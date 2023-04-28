import { getAuth, clerkClient } from "@clerk/nextjs/server";
import type { NextApiRequest } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function POST(req: NextApiRequest) {
  // Captura os dados do usuário logado
  const { userId } = getAuth(req);

  // Se não houver usuário logado, retorna erro
  if (!userId) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Procura o usuário do stripe no clerk
  let user = await clerkClient.users.getUser(userId);

  // Atribui o stripeCustomerId para criação da checkout session
  let stripeCustomerId = user?.publicMetadata.stripeCustomerId || null;

  // Se não encontra os dados stripe no metadados do clerk, cria um :)
  if (!stripeCustomerId) {
    const stripeCustomer = await stripe.customers.create(
      {
        name: user.firstName + " " + user.lastName,
        email: user.emailAddresses.find(
          (x) => x.id === user.primaryEmailAddressId
        )?.emailAddress,
        metadata: {
          clerkUserId: user.id,
        },
      },
      {
        idempotencyKey: user.id, // garante que a criação do usuário no stripe seja única
      }
    );

    // Atribui o customerId na variável
    stripeCustomerId = stripeCustomer.id;

    // Aproveita e insere o customerId do Stripe no metadados do clerk :)
    user = await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        stripeCustomerId: stripeCustomer.id,
      },
    });
  }

  // Cria checkout session com os dados do usuário
  try {
    const successUrl = `http://${process.env.VERCEL_URL}/secret`;
    const cancelUrl = `http://${process.env.VERCEL_URL}/pricing`;

    const params: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId.toString(),
      success_url: successUrl,
      cancel_url: cancelUrl,
      mode: "subscription",
      line_items: [
        {
          price: "price_1MuiOmFiLJtwBN8PbJZB1Ymm",
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
      },
    };

    const checkoutSession: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create(params);

    return new Response(JSON.stringify(checkoutSession), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
