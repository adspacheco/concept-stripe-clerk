import { SignIn } from "@clerk/nextjs/app-beta";

export default function Page() {
  return <SignIn path="/login" signUpUrl="/cadastro" />;
}
