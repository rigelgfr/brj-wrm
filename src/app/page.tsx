import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Redirect based on authentication status
  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

  // This part will never be rendered due to redirects
  return null;
}