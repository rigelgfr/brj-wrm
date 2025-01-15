import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { prisma } from "@/src/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  return (
    <div></div>
  )
}