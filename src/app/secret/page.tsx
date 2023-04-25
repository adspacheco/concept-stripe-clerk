import { currentUser } from "@clerk/nextjs/app-beta";

export default async function Page() {
  const user = await currentUser();

  return <h1>You find me {user?.id}</h1>;
}
