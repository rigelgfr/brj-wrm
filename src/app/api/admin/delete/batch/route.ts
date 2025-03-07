export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/auth.config";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
      
    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
        );
    }  else {
        try {
            const body = await req.json();
            const { ids } = body;
        
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
              return new NextResponse("Missing or invalid 'ids' parameter", { status: 400 });
            }
        
            // Delete the rows from the users table
            const deletedCount = await prisma.user.deleteMany({
              where: {
                id: {
                  in: ids,
                },
              },
            });
        
            return NextResponse.json({
              message: `${deletedCount.count} rows deleted successfully`,
              count: deletedCount.count,
            });
          } catch (error) {
            console.error("[INBOUND_BATCH_DELETE]", error);
            return new NextResponse("Internal Server Error", { status: 500 });
          }
    }   
}