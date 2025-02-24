// app/api/users/edit/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // If password is being updated, hash it
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
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
        role: true // Include role information in the response
      }
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}