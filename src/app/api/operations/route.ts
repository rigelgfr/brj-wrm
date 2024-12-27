import { prisma } from "@/src/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const truckCounts = await prisma.$queryRaw`
            WITH UniqueHits AS (
                SELECT 
                    id,
                    area AS warehouse,
                    month,
                    week_in_month,
                    CASE 
                        WHEN COUNT(*) = 1 THEN 'HIT'
                        ELSE 'DUPLICATE'
                    END AS hit_status
                FROM inbound
                WHERE month = 'August' AND week_in_month = 'W3'
                GROUP BY id, area, month, week_in_month
            )
            SELECT 
                warehouse,
                COUNT(*) AS truck_count
            FROM UniqueHits
            WHERE hit_status = 'HIT'
            GROUP BY warehouse;
            `

        // Convert BigInt values to numbers
        const formattedTruckCounts = truckCounts.map((item: any) => ({
            warehouse: item.warehouse,
            truck_count: Number(item.truck_count),
        }))
        
        return NextResponse.json(formattedTruckCounts)
        
      } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
      }
}