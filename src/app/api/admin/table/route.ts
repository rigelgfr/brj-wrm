export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/auth.config";

export async function GET() {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session.user.roleName !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    } else {
        try {
            const users = await prisma.user.findMany({
            orderBy: {
                createdAt: "asc"
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                roleId: true,
                role: true,
            }
            });

            return NextResponse.json(users);
        } catch (error) {
            console.error("Error fetching users data:", error);
            return NextResponse.json(
            { error: "Failed to fetch users data" },
            { status: 500 }
            );
        }
    }

}
