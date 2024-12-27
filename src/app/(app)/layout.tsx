import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import Header from "@/src/components/Header"
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header session={session} appName="BRJ-WRM" />
      <div className="flex w-full flex-1 overflow-auto bg-slate-50">
        {/* Add your sidebar here if needed */}
        <main className="w-full flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}