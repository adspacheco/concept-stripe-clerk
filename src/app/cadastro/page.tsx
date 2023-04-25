import { SignUp } from "@clerk/nextjs/app-beta";

export default function Page() {
  return <SignUp path="/cadastro" signInUrl="/login" />;
}
