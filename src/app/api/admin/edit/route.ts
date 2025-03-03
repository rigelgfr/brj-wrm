// app/api/admin/edit/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, oldPassword, newPassword, ...updateData } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // First get the existing user to verify password if needed
    const existingUser = await prisma.user.findUnique({
      where: { id: id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Handle password change if requested
    if (newPassword) {
      // Verify old password
      if (!oldPassword) {
        return NextResponse.json(
          { error: "Current password is required", formError: true },
          { status: 400 }
        );
      }

      // Compare old password with stored hashed password
      const isPasswordValid = await bcrypt.compare(oldPassword, existingUser.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect", formError: true },
          { status: 400 }
        );
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // If roleId is provided, ensure it's a number
    if (updateData.roleId) {
      updateData.roleId = Number(updateData.roleId);
    }

    // Remove role from updateData if it exists (since it's a relation, not a direct field)
    delete updateData.role;

    // Update the user
    const updatedUser = await prisma.user.update({
      where: {
        id: id
      },
      data: updateData,
      include: {
        role_users_roleTorole: true
      }
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user", formError: true },
      { status: 500 }
    );
  }
}