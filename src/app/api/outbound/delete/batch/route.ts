export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/auth.config";
import { updateInboundAggregates } from "../../../operations/in/update/utils";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
      
    if (!session) {
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
        
            // Convert string IDs to numbers if needed
            const numericIds = ids.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
        
            // Delete the rows from the inbound table
            const deletedCount = await prisma.outbound.deleteMany({
              where: {
                no: {
                  in: numericIds,
                },
              },
            });
        
            try {
              const result = await updateInboundAggregates();
              console.log('Aggregate update result:', result);
            } catch (error) {
              console.error('Error updating aggregates:', error);
            }
        
            return NextResponse.json({
              message: `${deletedCount.count} rows deleted successfully`,
              count: deletedCount.count,
            });
          } catch (error) {
            console.error("[OUTBOUND_BATCH_DELETE]", error);
            return new NextResponse("Internal Server Error", { status: 500 });
          }
    }   
}