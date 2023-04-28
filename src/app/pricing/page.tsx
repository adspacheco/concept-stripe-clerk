import CheckoutForm from "@/components/CheckoutForm";
import { currentUser } from "@clerk/nextjs/app-beta";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await currentUser();

  const data = user?.privateMetadata.subscription;

  // redirect if active or trialing
  if (data === "active" || data === "trialing") {
    redirect("/secret");
  }
  return (
    <main className="text-center">
      {data === "canceled" ? (
        <h1>
          Seu plano foi cancelado, clique no botão abaixo e reative sua
          assinatura!
        </h1>
      ) : (
        <h1>
          Hey {user?.firstName} ative sua assinatura e descubra o segredo!
        </h1>
      )}
      <CheckoutForm />
    </main>
  );
}
