// app/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { LoginButton, LogoutButton } from "../components/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main>
      <LoginButton />
      <LogoutButton />
      <h1>Welcome to Next.js App Router</h1>
      <pre>{JSON.stringify(session)}</pre>
    </main>
  );
}
