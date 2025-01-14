// app/api/inventory/add/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

type OccupancyInput = {
  year: number;
  month: string;
  week: string;
  wh_type: string;
  space: number;
};

function getLastDayOfMonth(year: number, month: string): Date {
  const monthIndex = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ].indexOf(month);
  return new Date(year, monthIndex + 1, 0);
}

function getFirstDayOfMonth(year: number, month: string): Date {
  const monthIndex = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ].indexOf(month);
  return new Date(year, monthIndex, 1);
}

function calculateWeekNumber(date: Date): string {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDayPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
  
  const weekNum = Math.ceil((date.getDate() + lastDayPrevMonth.getDay()) / 7);
  return `W${weekNum}`;
}

function validateWeek(year: number, month: string, week: string): boolean {
  const lastDay = getLastDayOfMonth(year, month);
  const maxWeek = calculateWeekNumber(lastDay);
  const weekNum = parseInt(week.substring(1));
  const maxWeekNum = parseInt(maxWeek.substring(1));
  return weekNum <= maxWeekNum;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sqmData, volData } = body;

    // Validate input data
    if (!Array.isArray(sqmData) || !Array.isArray(volData)) {
      return NextResponse.json(
        { message: 'Invalid input data format' },
        { status: 400 }
      );
    }

    // Get warehouse capacities
    const warehouses = await prisma.warehouses.findMany({
      select: {
        wh_type: true,
        max_cap_sqm: true,
        max_cap_vol: true,
      },
    });

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Process SQM data
      for (const data of sqmData) {
        const { year, month, week, wh_type, space } = data;
        
        // Validate week
        if (!validateWeek(year, month, week)) {
          throw new Error(`Invalid week ${week} for ${month} ${year}`);
        }

        const warehouse = warehouses.find(w => w.wh_type === wh_type);
        if (!warehouse?.max_cap_sqm) {
          throw new Error(`Warehouse ${wh_type} not found or missing max capacity`);
        }

        // Add Occupied row
        await tx.occupancy_sqm.create({
          data: {
            year,
            month,
            week,
            wh_type,
            status: 'Occupied',
            space,
          },
        });

        // Add Empty row
        await tx.occupancy_sqm.create({
          data: {
            year,
            month,
            week,
            wh_type,
            status: 'Empty',
            space: warehouse.max_cap_sqm - space,
          },
        });
      }

      // Process VOL data
      for (const data of volData) {
        const { year, month, week, wh_type, space } = data;
        
        // Validate week
        if (!validateWeek(year, month, week)) {
          throw new Error(`Invalid week ${week} for ${month} ${year}`);
        }

        const warehouse = warehouses.find(w => w.wh_type === wh_type);
        if (!warehouse?.max_cap_vol) {
          throw new Error(`Warehouse ${wh_type} not found or missing max capacity`);
        }

        // Add Occupied row
        await tx.occupancy_vol.create({
          data: {
            year,
            month,
            week,
            wh_type,
            status: 'Occupied',
            space,
          },
        });

        // Add Empty row
        await tx.occupancy_vol.create({
          data: {
            year,
            month,
            week,
            wh_type,
            status: 'Empty',
            space: warehouse.max_cap_vol - space,
          },
        });
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Add error:', error);
    return NextResponse.json(
      { message: 'Failed to add records', error },
      { status: 500 }
    );
  }
}