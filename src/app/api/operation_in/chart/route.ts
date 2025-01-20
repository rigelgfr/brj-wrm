// app/api/operation_in/chart/route.ts
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const year = parseInt(searchParams.get('year') || '2024')
  const month = searchParams.get('month') || 'October'
  const weeks = searchParams.getAll('week') || ['W1']
  const warehouses = searchParams.getAll('warehouse') || ['CFS', 'FZ AB', 'FZ BRJ', 'Bonded', 'PLB']

  console.log('Query params:', { year, month, weeks, warehouses })

  try {    
    const data = await prisma.inbound_aggregated.findMany({
      where: {
        year: year,
        month: month,
        week_in_month: {
          in: weeks
        },
        wh_type: {
          in: warehouses
        }
      },
      select: {
        wh_type: true,
        week_in_month: true,
        unique_truck_count: true,
        total_volume_int: true,
      }
    })

    // Transform data to be grouped by warehouse
    return Response.json({
      truck: {
        data: warehouses.map(warehouse => ({
          warehouse,
          ...weeks.reduce((acc, week) => {
            const record = data.find(d => d.wh_type === warehouse && d.week_in_month === week)
            acc[week] = record?.unique_truck_count ?? 0
            return acc
          }, {} as Record<string, number>)
        })),
        unit: 'Trucks'
      },
      volume: {
        data: warehouses.map(warehouse => ({
          warehouse,
          ...weeks.reduce((acc, week) => {
            const record = data.find(d => d.wh_type === warehouse && d.week_in_month === week)
            acc[week] = record?.total_volume_int ?? 0
            return acc
          }, {} as Record<string, number>)
        })),
        unit: 'CBM'
      }
    })
  } catch (error) {
    console.error('Error in route:', error)
    return Response.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}