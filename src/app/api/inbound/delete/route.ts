// app/api/inbound/delete/route.ts
export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateInboundAggregates } from "../../operation_in/update/utils";

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

    try {
      const result = await updateInboundAggregates();
      console.log('Aggregate update result:', result);
    } catch (error) {
      console.error('Error updating aggregates:', error);
    }

    return NextResponse.json({
      message: "Row deleted successfully",
      deletedInbound,
    });
  } catch (error) {
    console.error("[INBOUND_DELETE]", error);

    if (typeof error === "object" && error !== null && "code" in error) {
      const errorCode = (error as { code: string }).code;

      if (errorCode === "P2025") {
          return new NextResponse("Row not found", { status: 404 });
      }
  }


    return new NextResponse("Internal Server Error", { status: 500 });
  }
}