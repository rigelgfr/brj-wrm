// app/api/admin/delete/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/auth.config";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated and has admin role
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  } else {
    try {
      const body = await request.json();
      const { id } = body;
  
      // Validate required fields
      if (!id) {
        return NextResponse.json(
          { error: "ID is required" },
          { status: 400 }
        );
      }
  
      // Delete the user
      await prisma.user.delete({
        where: {
          id: id
        }
      });
  
      return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Failed to delete user:", error);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }
  }  
}