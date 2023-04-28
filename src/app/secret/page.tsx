import { currentUser } from "@clerk/nextjs/app-beta";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await currentUser();

  const data = user?.privateMetadata.subscription;

  if (data !== "active" && data !== "trialing") {
    redirect("/pricing");
  }

  return (
    <div>
      <h1>You find me {user?.id}</h1>
      <h2>Subscription status: {JSON.stringify(data, null, 2)}</h2>
    </div>
  );
}
