import CheckoutForm from "@/components/CheckoutForm";
import { currentUser } from "@clerk/nextjs/app-beta";

export default async function Page() {
  const user = await currentUser();

  const data = user?.privateMetadata.subscription;

  return (
    <div>
      <h1>You find me {user?.id}</h1>
      <h2>Subscription status: {JSON.stringify(data, null, 2)}</h2>
      <CheckoutForm />
    </div>
  );
}
