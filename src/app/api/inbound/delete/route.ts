// app/api/inbound/delete/route.ts
import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { no } = body;

    if (!no) {
      return new NextResponse("Missing 'no' parameter", { status: 400 });
    }

    // Delete the row from the inbound table
    const deletedInbound = await prisma.inbound.delete({
      where: {
        no: parseInt(no, 10),
      },
    });

    return NextResponse.json({
      message: "Row deleted successfully",
      deletedInbound,
    });
  } catch (error) {
    console.error("[INBOUND_DELETE]", error);

    if (error.code === "P2025") {
      return new NextResponse("Row not found", { status: 404 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}