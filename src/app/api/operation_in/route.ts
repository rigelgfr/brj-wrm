// app/api/inbound/route.ts
import { prisma } from "@/src/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const year = parseInt(searchParams.get('year') || '2024')
  const month = searchParams.get('month') || 'October'
  const weeks = searchParams.getAll('week') || ['W1']
  const warehouses = searchParams.getAll('warehouse') || ['CFS', 'FREEZONE AB', 'FREEZONE BRJ', 'GB', 'PLB']

  console.log('Query params:', { year, month, weeks, warehouses })

  try {    
    const data = await prisma.inbound_aggregated.findMany({
      where: {
        year: year,
        month: month,
        week_in_month: {
          in: weeks
        },
        warehouse: {
          in: warehouses
        }
      },
      select: {
        warehouse: true,
        week_in_month: true,
        unique_truck_count: true
      }
    })

    // Transform data to be grouped by warehouse
    const transformedData = warehouses.map(warehouse => {
      const warehouseData = {
        warehouse,
        ...weeks.reduce((acc, week) => {
          const record = data.find(d => d.warehouse === warehouse && d.week_in_month === week)
          acc[week] = record?.unique_truck_count ?? 0
          return acc
        }, {} as Record<string, number>)
      }
      return warehouseData
    })

    return Response.json(transformedData)
  } catch (error) {
    console.error('Error in route:', error)
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}