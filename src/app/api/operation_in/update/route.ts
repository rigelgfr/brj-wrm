// app/api/operation_in/update/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // First, get all the inbound records grouped by warehouse (area)
    const uniqueHits = await db.inbound.groupBy({
      by: ['area', 'year', 'month', 'week_in_month'],
      _sum: {
        volume: true,
      },
      _count: {
        no: true,
      }
    });

    // Process and upsert the aggregated data
    for (const hit of uniqueHits) {
      await db.inboundAggregated.upsert({
        where: {
          warehouse_year_month_week_in_month: {
            warehouse: hit.area,
            year: hit.year,
            month: hit.month,
            week_in_month: hit.week_in_month,
          }
        },
        update: {
          total_volume: hit._sum.volume || 0,
          total_truck_count: hit._count.no,
          // For unique_truck_count, we need a separate query
          unique_truck_count: await db.inbound.count({
            where: {
              area: hit.area,
              year: hit.year,
              month: hit.month,
              week_in_month: hit.week_in_month,
            },
            distinct: ['no']
          })
        },
        create: {
          warehouse: hit.area,
          year: hit.year,
          month: hit.month,
          week_in_month: hit.week_in_month,
          total_volume: hit._sum.volume || 0,
          total_truck_count: hit._count.no,
          unique_truck_count: await db.inbound.count({
            where: {
              area: hit.area,
              year: hit.year,
              month: hit.month,
              week_in_month: hit.week_in_month,
            },
            distinct: ['no']
          })
        }
      });
    }

    return NextResponse.json({ message: "Operation data updated successfully" });
  } catch (error) {
    console.error("[OPERATION_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}