// app/api/outbound/delete/route.ts
export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateOutboundAggregates } from "../../operations/out/update/utils";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { no } = body;

    if (!no) {
      return new NextResponse("Missing 'no' parameter", { status: 400 });
    }

    // Delete the row from the outbound table
    const deletedOutbound = await prisma.outbound.delete({
      where: {
        no: parseInt(no, 10),
      },
    });

    try {
      const result = await updateOutboundAggregates();
      console.log('Aggregate update result:', result);
    } catch (error) {
      console.error('Error updating aggregates:', error);
    }

    return NextResponse.json({
      message: "Row deleted successfully",
      deletedOutbound,
    });
  } catch (error) {
    console.error("[OUTBOUND_DELETE]", error);

    if (typeof error === "object" && error !== null && "code" in error) {
      const errorCode = (error as { code: string }).code;

      if (errorCode === "P2025") {
          return new NextResponse("Row not found", { status: 404 });
      }
  }


    return new NextResponse("Internal Server Error", { status: 500 });
  }
}