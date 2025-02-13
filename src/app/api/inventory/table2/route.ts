// api/inventory/table2/route.ts

export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Using Prisma's raw SQL query for occupancy_sqm
    const occupancy= await prisma.$queryRaw`
      SELECT year, month, week, wh_type, section, occupied_sqm, empty_sqm, occupied_vol
      FROM occupancy
      ORDER BY 
        year ASC,
        CASE month
          WHEN 'Jan' THEN 1
          WHEN 'Feb' THEN 2
          WHEN 'Mar' THEN 3
          WHEN 'Apr' THEN 4
          WHEN 'May' THEN 5
          WHEN 'Jun' THEN 6
          WHEN 'Jul' THEN 7
          WHEN 'Aug' THEN 8
          WHEN 'Sep' THEN 9
          WHEN 'Oct' THEN 10
          WHEN 'Nov' THEN 11
          WHEN 'Dec' THEN 12
          ELSE 13
        END,
        week ASC,
        CASE wh_type
          WHEN 'FZ AB' THEN 1
          WHEN 'FZ BRJ' THEN 2
          WHEN 'GB' THEN 3
          WHEN 'CFS' THEN 4
          WHEN 'PLB' THEN 5
          ELSE 6
        END,
		CASE section
		  WHEN 'Indoor' THEN 1
		  WHEN 'Canopy 1' then 2
		  when 'Canopy 2' then 3
		  else 4
		END
    `;

    return NextResponse.json({
      occupancy,
    });
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory data" },
      { status: 500 }
    );
  }
}