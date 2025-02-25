// admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/auth.config";
import AdminPage from "./data";

// Server Component
export default async function Page() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and has admin role
  if (!session || session.user.role !== "SUPER_ADMIN") {    
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  // If authorized, render the client component
  return <AdminPage />;
}