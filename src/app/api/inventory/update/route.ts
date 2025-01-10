// app/api/inventory/update/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { tableType, year, month, week, wh_type, status, space } = body;

    // Determine which Prisma model to use
    const table = tableType === 'sqm' ? 'occupancy_sqm' : 'occupancy_vol';
    const maxCapField = tableType === 'sqm' ? 'max_cap_sqm' : 'max_cap_vol';

    // If status is 'Empty', just update the space value
    if (status === 'Empty') {
      const result = await prisma[table].update({
        where: {
          year_month_week_wh_type_status: {
            year,
            month,
            week,
            wh_type,
            status
          }
        },
        data: {
          space
        }
      });
      return NextResponse.json(result);
    }

    // For 'Occupied' status, we need to update both rows
    if (status === 'Occupied') {
      // First, get the warehouse max capacity
      const warehouse = await prisma.warehouses.findUnique({
        where: {
          wh_type: wh_type
        },
        select: {
          [maxCapField]: true
        }
      });

      if (!warehouse) {
        return NextResponse.json(
          { message: 'Warehouse not found' },
          { status: 404 }
        );
      }

      const maxCapacity = warehouse[maxCapField];
      
      // Start a transaction to update both rows
      const result = await prisma.$transaction(async (tx) => {
        // Update the Occupied row
        const occupiedUpdate = await tx[table].update({
          where: {
            year_month_week_wh_type_status: {
              year,
              month,
              week,
              wh_type,
              status: 'Occupied'
            }
          },
          data: {
            space
          }
        });

        // Calculate and update the Empty row
        const emptySpace = maxCapacity - space;
        const emptyUpdate = await tx[table].update({
          where: {
            year_month_week_wh_type_status: {
              year,
              month,
              week,
              wh_type,
              status: 'Empty'
            }
          },
          data: {
            space: emptySpace
          }
        });

        return {
          occupied: occupiedUpdate,
          empty: emptyUpdate
        };
      });

      return NextResponse.json(result);
    }

    // If status is neither 'Empty' nor 'Occupied'
    return NextResponse.json(
      { message: 'Invalid status value' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { message: 'Failed to update record', error },
      { status: 500 }
    );
  }
}