export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    
    // Default to current month in proper format (first letter capitalized, rest lowercase)
    const defaultMonth = new Date().toLocaleString('default', { month: 'short' })
    const month = (searchParams.get('month') || defaultMonth)
      .charAt(0).toUpperCase() + 
      (searchParams.get('month') || defaultMonth)
        .slice(1).toLowerCase()

    // Validate month format
    if (!/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/.test(month)) {
      return NextResponse.json(
        { success: false, error: 'Invalid month format. Please use three-letter format (e.g., Jan, Feb)' },
        { status: 400 }
      )
    }

    // First get all warehouse areas and types for structure
    const warehouseStructure = await prisma.warehouse_area.findMany({
      select: {
        area: true,
        wh_type: true
      }
    })

    // Get all warehouse types with their spaces
    const warehouseTypes = await prisma.warehouse_type.findMany({
      select: {
        wh_type: true,
        section: true,
        space: true
      }
    })

    // Get occupancy data for the specified period
    const occupancyData = await prisma.occupancy.findMany({
      where: {
        year: year,
        month: month
      },
      select: {
        week: true,
        wh_type: true,
        section: true,
        occupied_sqm: true,
        occupied_vol: true,
        empty_sqm: true
      },
      orderBy: {
        week: 'asc'
      }
    })

    // Transform the data
    const formattedData = warehouseStructure.flatMap(warehouse => {
      // Find all sections for this warehouse type
      const sections = warehouseTypes
        .filter(wt => wt.wh_type === warehouse.wh_type)
        .map(wt => {
          // Get all weeks' data for this section
          const weeksData = occupancyData
            .filter(occ => occ.wh_type === wt.wh_type && occ.section === wt.section)
            .reduce((acc, curr) => {
              acc[`W${curr.week}`] = {
                occupied_sqm: curr.occupied_sqm || 0,
                occupied_vol: curr.occupied_vol || 0,
                empty_sqm: curr.empty_sqm || wt.space || 0
              }
              return acc
            }, {} as Record<string, any>)

          return {
            area: warehouse.area,
            wh_type: wt.wh_type,
            section: wt.section,
            total_sqm: wt.space || 0,
            ...weeksData
          }
        })

      return sections
    })

    // Get unique weeks for metadata using Array.from instead of spread operator
    const weeks = Array.from(new Set(occupancyData.map(d => d.week)))
      .sort((a, b) => parseInt(a) - parseInt(b))

    return NextResponse.json({
      success: true,
      data: formattedData,
      metadata: {
        year,
        month,
        weeks: weeks,
        total_records: formattedData.length
      }
    })

  } catch (error) {
    console.error('Error fetching warehouse data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch warehouse data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}