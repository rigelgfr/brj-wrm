export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type UpdateRequestBody = {
  tableType: 'sqm' | 'vol';
  year: number;
  month: string;
  week: string;
  wh_type: string;
  status: 'Empty' | 'Occupied';
  space: number;
};

async function updateSqmTable(
  params: Omit<UpdateRequestBody, 'tableType'>
) {
  const { year, month, week, wh_type, status, space } = params;

  if (status === 'Empty') {
    return await prisma.occupancy_sqm.update({
      where: {
        year_month_week_wh_type_status: {
          year, month, week, wh_type, status
        }
      },
      data: { space }
    });
  }

  const warehouse = await prisma.warehouses.findUnique({
    where: { wh_type },
    select: { max_cap_sqm: true }
  });

  if (!warehouse) {
    throw new Error('Warehouse not found');
  }

  const maxCapacity = Number(warehouse.max_cap_sqm);
  if (isNaN(maxCapacity)) {
    throw new Error('Invalid warehouse capacity');
  }

  return await prisma.$transaction(async (tx) => {
    const occupiedUpdate = await tx.occupancy_sqm.update({
      where: {
        year_month_week_wh_type_status: {
          year, month, week, wh_type, status: 'Occupied'
        }
      },
      data: { space }
    });

    const emptyUpdate = await tx.occupancy_sqm.update({
      where: {
        year_month_week_wh_type_status: {
          year, month, week, wh_type, status: 'Empty'
        }
      },
      data: { space: maxCapacity - space }
    });

    return { occupied: occupiedUpdate, empty: emptyUpdate };
  });
}

async function updateVolTable(
  params: Omit<UpdateRequestBody, 'tableType'>
) {
  const { year, month, week, wh_type, status, space } = params;

  if (status === 'Empty') {
    return await prisma.occupancy_vol.update({
      where: {
        year_month_week_wh_type_status: {
          year, month, week, wh_type, status
        }
      },
      data: { space }
    });
  }

  const warehouse = await prisma.warehouses.findUnique({
    where: { wh_type },
    select: { max_cap_vol: true }
  });

  if (!warehouse) {
    throw new Error('Warehouse not found');
  }

  const maxCapacity = Number(warehouse.max_cap_vol);
  if (isNaN(maxCapacity)) {
    throw new Error('Invalid warehouse capacity');
  }

  return await prisma.$transaction(async (tx) => {
    const occupiedUpdate = await tx.occupancy_vol.update({
      where: {
        year_month_week_wh_type_status: {
          year, month, week, wh_type, status: 'Occupied'
        }
      },
      data: { space }
    });

    const emptyUpdate = await tx.occupancy_vol.update({
      where: {
        year_month_week_wh_type_status: {
          year, month, week, wh_type, status: 'Empty'
        }
      },
      data: { space: maxCapacity - space }
    });

    return { occupied: occupiedUpdate, empty: emptyUpdate };
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as UpdateRequestBody;
    const { tableType, ...params } = body;

    if (params.status !== 'Empty' && params.status !== 'Occupied') {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 }
      );
    }

    const result = await (tableType === 'sqm' 
      ? updateSqmTable(params)
      : updateVolTable(params)
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Update error:', error);
    if (error instanceof Error && error.message === 'Warehouse not found') {
      return NextResponse.json(
        { message: error.message },
        { status: 404 }
      );
    }
    if (error instanceof Error && error.message === 'Invalid warehouse capacity') {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to update record', error },
      { status: 500 }
    );
  }
}