// app/api/space/route.ts
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const spaces = await prisma.warehouses.findMany({
      select: {
        wh_name: true,
        wh_type: true,
        space: true,
        max_cap_sqm: true,
        max_cap_vol: true,
      }
    })
    
    return NextResponse.json(spaces)
  } catch (error) {
    console.error('Error fetching space data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch space data' },
      { status: 500 }
    )
  }
}