import { getServerSession } from "next-auth/next"
import { redirect } from 'next/navigation'
import { authOptions } from "../api/auth/[...nextauth]/route"
import Header from "@/src/components/Header"
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
    
  if (!session) {
    redirect('/login')
  }
  
  return (
    <div className="flex h-screen flex-col overflow-hidden w-full">
      <Header session={session} appName="BRJ-WRM" />
      <div className="flex w-full flex-1 overflow-auto">
        {/* Add your sidebar here if needed */}
        <main className="w-full flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}