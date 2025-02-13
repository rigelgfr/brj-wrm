// app/api/inventory/update2/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { year, month, week, wh_type, section, occupied_sqm, occupied_vol } = body;

    // First get the warehouse area space
    const warehouseType = await prisma.warehouse_type.findUnique({
      where: {
        wh_type_section: {
          wh_type: wh_type,
          section: section,
        },
      },
      select: {
        space: true
      }
    });

    if (!warehouseType) {
      return NextResponse.json(
        { error: 'Warehouse type & section not found' },
        { status: 404 }
      );
    }

     // Type guard for null warehouseArea
     if (!warehouseType || warehouseType.space === null) {
        return NextResponse.json(
          { error: 'Warehouse area not found' },
          { status: 404 }
        );
      }

    // Validate occupied space against total space
    if (occupied_sqm > warehouseType.space) {
      return NextResponse.json(
        { error: 'Occupied space cannot exceed total warehouse space' },
        { status: 400 }
      );
    }

    // Calculate empty_sqm
    const empty_sqm = warehouseType.space - occupied_sqm;

    // Update the record with both occupied and empty values
    const updatedOccupancy = await prisma.occupancy.update({
      where: {
        year_month_week_wh_type_section: {
          year: year,
          month: month,
          week: week,
          wh_type: wh_type,
          section: section,
        },
      },
      data: {
        occupied_sqm: occupied_sqm,
        occupied_vol: occupied_vol,
        empty_sqm: empty_sqm, // Store the calculated empty_sqm
      },
    });

    return NextResponse.json(updatedOccupancy);
  } catch (error: any) {
    console.error('Database Error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update warehouse occupancy data' },
      { status: 500 }
    );
  }
}