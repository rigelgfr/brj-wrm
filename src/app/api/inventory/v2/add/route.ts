// app/api/inventory/add2/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getLastDayOfMonth(year: number, month: string): Date {
  const monthIndex = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ].indexOf(month);
  return new Date(year, monthIndex + 1, 0);
}

function calculateWeekNumber(date: Date): string {
  const lastDayPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
  const weekNum = Math.ceil((date.getDate() + lastDayPrevMonth.getDay()) / 7);
  return `W${weekNum}`;
}

function getNextTimePeriod(year: number, month: string, week: string): { year: number, month: string, week: string } {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIndex = months.indexOf(month);
  const lastDay = getLastDayOfMonth(year, month);
  const maxWeek = calculateWeekNumber(lastDay);
  const currentWeekNum = parseInt(week.substring(1));
  const maxWeekNum = parseInt(maxWeek.substring(1));

  if (currentWeekNum < maxWeekNum) {
    // Next week in same month
    return {
      year,
      month,
      week: `W${currentWeekNum + 1}`
    };
  } else if (currentMonthIndex < 11) {
    // First week of next month
    return {
      year,
      month: months[currentMonthIndex + 1],
      week: 'W1'
    };
  } else {
    // First week of first month of next year
    return {
      year: year + 1,
      month: 'Jan',
      week: 'W1'
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { occupancyData } = body;

    if (!Array.isArray(occupancyData)) {
      return NextResponse.json(
        { message: 'Invalid input data format' },
        { status: 400 }
      );
    }

    // Get the last time period INCLUDING ALL WAREHOUSE TYPES
    const lastRecord = await prisma.occupancy.findFirst({
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { week: 'desc' },
        { wh_type: 'desc' },  // Add these to ensure we get the absolute latest record
        { section: 'desc' }
      ],
      select: {
        year: true,
        month: true,
        week: true,
        wh_type: true,
        section: true
      }
    });

    console.log('Last record found:', lastRecord);

    // Validate input timeperiod matches what we expect
    const { year, month, week } = body.timeperiod || {}; // Get the expected period from frontend
    
    // Check for existing records in the target period
    const existingRecords = await prisma.occupancy.findMany({
      where: {
        year,
        month,
        week,
      },
      select: {
        wh_type: true,
        section: true,
      }
    });

    console.log('Checking for period:', { year, month, week });
    console.log('Existing records found:', existingRecords);

    // Start transaction
    await prisma.$transaction(async (tx) => {
      for (const data of occupancyData) {
        const { wh_type, section, occupied_sqm, occupied_vol } = data;
        
        // Check if this specific combination already exists
        const exists = existingRecords.some(
          record => record.wh_type === wh_type && record.section === section
        );

        if (exists) {
          throw new Error(`Data already exists for ${wh_type} ${section} in period ${month} ${year} ${week}`);
        }

        const warehouseType = await tx.warehouse_type.findFirst({
          where: { wh_type, section },
          select: { space: true }
        });

        if (!warehouseType?.space) {
          throw new Error(`Warehouse ${wh_type} section ${section} not found or missing space capacity`);
        }

        // Calculate empty space
        const empty_sqm = warehouseType.space - occupied_sqm;

        // Create occupancy record
        await tx.occupancy.create({
          data: {
            year,
            month,
            week,
            wh_type,
            section,
            occupied_sqm,
            empty_sqm,
            occupied_vol,
          },
        });
      }
    });

    return NextResponse.json({ 
      success: true,
      timeperiod: { year, month, week }
    });

  } catch (error: any) {
    console.error('Add error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({
        message: 'Duplicate entry detected. This period may have been added by another user.',
        error: error.message
      }, { status: 409 });
    }
    
    return NextResponse.json(
      { message: error.message || 'Failed to add records' },
      { status: 500 }
    );
  }
}