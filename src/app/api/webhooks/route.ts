import Stripe from "stripe";
import { headers } from "next/dist/client/components/headers";
import { NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.deleted",
  "customer.subscription.updated",
  "invoice.payment_failed",
]);

async function buffer(body: ReadableStream<Uint8Array>) {
  const chunks = [];
  const reader = body!.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(typeof value === "string" ? Buffer.from(value) : value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  // const body = await req.text();
  const body = req.body;

  const buf = await buffer(body!);
  const secret = req.headers.get("stripe-signature");
  const webhookScecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!secret || !webhookScecret) return;
    event = stripe.webhooks.constructEvent(buf, secret, webhookScecret);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    console.log("Webhook error:", errorMessage);
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const { type } = event;

  if (relevantEvents.has(type)) {
    try {
      const object = event.data.object;

      // console.log(object);

      switch (type) {
        case "checkout.session.completed":
          const checkoutSession = event.data.object as Stripe.Checkout.Session;

          const newSubscription = await stripe.subscriptions.retrieve(
            checkoutSession.subscription as string
          );
          //checkoutSession.metadata.clerkUserId;
          // console.log("status", newSubscription.status);

          // const customerId = checkoutSession.customer as string;
          // console.log(newSubscription);

          // Captura o clerkUserId do metadados do stripe
          const user = (await stripe.customers.retrieve(
            checkoutSession.customer as string
          )) as Stripe.Customer;

          // Atualiza o status da assinatura no usuário no clerk
          // "active" ou "trialing"
          await clerkClient.users.updateUser(user.metadata.clerkUserId, {
            privateMetadata: {
              subscription: newSubscription.status,
            },
          });

          break;

        case "invoice.payment_failed":
          // todo
          break;

        case "customer.subscription.updated":
          const subscription = event.data.object as Stripe.Subscription;
          // const newStatus = subscription.status as string;
          // customerId = subscription.customer as string;

          // Captura o clerkUserId do metadados do stripe
          const { metadata } = (await stripe.customers.retrieve(
            subscription.customer.toString()
          )) as Stripe.Customer;

          // Atualiza o status da assinatura no usuário no clerk
          await clerkClient.users.updateUser(metadata.clerkUserId, {
            privateMetadata: {
              subscription: subscription.status,
            },
          });
          break;

        case "customer.subscription.deleted":
          const subscriptionDeleted = event.data.object as Stripe.Subscription;

          const userDeleted = (await stripe.customers.retrieve(
            subscriptionDeleted.customer.toString()
          )) as Stripe.Customer;

          await clerkClient.users.updateUser(userDeleted.metadata.clerkUserId, {
            privateMetadata: {
              subscription: subscriptionDeleted.status,
            },
          });
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
          throw new Error("Unhandled event type");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Internal server error";
      console.log("Webhook error:", errorMessage);
      return new Response(JSON.stringify({ message: errorMessage }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
