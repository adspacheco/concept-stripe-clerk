import CheckoutButton from "@/components/CheckoutButton";
import { currentUser } from "@clerk/nextjs/app-beta";

export default async function Page() {
  const user = await currentUser();

  const data = user?.publicMetadata.data;

  return (
    <div>
      <h1>You find me {user?.id}</h1>
      <h2>Public data is: {JSON.stringify(data, null, 2)}</h2>
      <CheckoutButton />
    </div>
  );
}
