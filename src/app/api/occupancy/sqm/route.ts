// app/api/occupancy/route.ts
export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma"

const monthMap: Record<string, string> = {
  'January': 'Jan',
  'February': 'Feb',
  'March': 'Mar',
  'April': 'Apr',
  'May': 'May',
  'June': 'Jun',
  'July': 'Jul',
  'August': 'Aug',
  'September': 'Sep',
  'October': 'Oct',
  'November': 'Nov',
  'December': 'Dec'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const year = parseInt(searchParams.get('year') || '2024')
  const fullMonth = searchParams.get('month') || 'October'
  const week = searchParams.get('week') || 'W1'
  
  // Convert full month name to three-letter format
  const month = monthMap[fullMonth] || 'Oct'

  console.log('Query params after conversion:', { year, month, week })

  try {
    const data = await prisma.occupancy_sqm.groupBy({
      by: ['wh_type', 'status'],
      where: {
        year: year,
        month: month,
        week: week,
      },
      _sum: {
        space: true
      }
    })

    console.log('Raw database response:', data)

    // Transform data into the format needed for pie charts
    const warehouseData = data.reduce((acc, curr) => {
      if (!acc[curr.wh_type]) {
        acc[curr.wh_type] = {
          occupied: 0,
          empty: 0
        }
      }
      
      const space = curr._sum.space || 0
      if (curr.status.toLowerCase() === 'occupied') {
        acc[curr.wh_type].occupied = space
      } else {
        acc[curr.wh_type].empty = space
      }
      
      return acc
    }, {} as Record<string, { occupied: number; empty: number }>)

    console.log('Transformed data:', warehouseData)

    return Response.json(warehouseData)
  } catch (error) {
    console.error('Error in occupancy route:', error)
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}