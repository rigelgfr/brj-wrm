import { getServerSession } from "next-auth/next"
import { redirect } from 'next/navigation'
import { authOptions } from "../api/auth/[...nextauth]/route"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Welcome to Dashboard</h1>
      <p>Logged in as: {session.user?.name}</p>
    </div>
  )
}