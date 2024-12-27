import { getServerSession } from "next-auth/next"
import { redirect } from 'next/navigation'
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { LogoutButton } from "@/src/components/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="w-full flex items-center justify-center">
      <h1 className="text-2xl font-bold text-darkgrey-krnd">Welcome to Dashboard</h1>
      <p className="text-darkgrey-krnd">Logged in as: {session.user?.name}</p>
      <LogoutButton />
    </div>
  )
}