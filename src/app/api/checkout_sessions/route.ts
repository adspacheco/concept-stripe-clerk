import { getAuth, clerkClient } from "@clerk/nextjs/server";
import type { NextApiRequest } from "next";

export async function POST(request: NextApiRequest) {
  const { userId } = getAuth(request);
  const params = { publicMetadata: { data: "pub dt" } };

  if (!userId) {
    return new Response("No user id");
  }

  const user = await clerkClient.users.updateUser(userId, params);

  console.log(user);

  return new Response("Hello, Next.js!");
}
