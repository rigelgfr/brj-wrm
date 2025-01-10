import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Using Prisma's raw SQL query for occupancy_sqm
    const occupancySqm = await prisma.$queryRaw`
      SELECT year, month, week, wh_type, status, space
      FROM occupancy_sqm
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
        status DESC,
        CASE wh_type
          WHEN 'FZ AB' THEN 1
          WHEN 'FZ BRJ' THEN 2
          WHEN 'Bonded' THEN 3
          WHEN 'CFS' THEN 4
          WHEN 'PLB' THEN 5
          ELSE 6
        END
    `;

    // Using Prisma's raw SQL query for occupancy_vol
    const occupancyVol = await prisma.$queryRaw`
      SELECT year, month, week, wh_type, status, space
      FROM occupancy_vol
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
        status DESC,
        CASE wh_type
          WHEN 'FZ AB' THEN 1
          WHEN 'FZ BRJ' THEN 2
          WHEN 'Bonded' THEN 3
          WHEN 'CFS' THEN 4
          WHEN 'PLB' THEN 5
          ELSE 6
        END
    `;

    return NextResponse.json({
      occupancySqm,
      occupancyVol
    });
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory data" },
      { status: 500 }
    );
  }
}