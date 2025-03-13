export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { standardizeTruckType } from "./classifyTruck";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get filter parameters
    const period = searchParams.get('period') || 'yearly';
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const month = searchParams.get('month');
    const vehicleType = searchParams.get('vehicleType');

    // Build date filters
    let dateFilter = {};
    if (period === 'yearly') {
      dateFilter = {
        created_at: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${parseInt(year) + 1}-01-01`),
        },
      };
    } else if (period === 'monthly' && month) {
      const monthNum = parseInt(month);
      const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
      const nextYear = monthNum === 12 ? parseInt(year) + 1 : parseInt(year);
      
      dateFilter = {
        created_at: {
          gte: new Date(`${year}-${monthNum.toString().padStart(2, '0')}-01`),
          lt: new Date(`${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`),
        },
      };
    }

    // Vehicle type filter (for by-vehicle mode)
    let truckTypeFilter = {};
    if (vehicleType) {
      truckTypeFilter = {
        truck_type: vehicleType,
      };
    }

    // Get total counts for verification
    const totalInbound = await prisma.inbound.count({
      where: {
        ...dateFilter,
        ...truckTypeFilter,
      },
    });
    
    const totalOutbound = await prisma.outbound.count({
      where: {
        ...dateFilter,
        ...truckTypeFilter,
      },
    });

    // Fetch inbound statistics using Prisma's groupBy
    const inboundStats = await prisma.inbound.groupBy({
      by: ['truck_type'],
      where: {
        ...dateFilter,
        ...truckTypeFilter,
      },
      _count: {
        id: true,
      },
      _avg: {
        leadtime_unload: true,
        leadtime_put: true,
      },
    });

    // Fetch outbound statistics using Prisma's groupBy
    const outboundStats = await prisma.outbound.groupBy({
      by: ['truck_type'],
      where: {
        ...dateFilter,
        ...truckTypeFilter,
      },
      _count: {
        id: true,
      },
      _avg: {
        leadtime_picking: true,
        leadtime_load: true,
      },
    });

    // Debug counters
    let totalInboundProcessed = 0;
    let totalOutboundProcessed = 0;
    
    const aggregatedStats: Record<string, {
      total_count: number;
      inbound: {
        count: number;
        unload: { avg: number };
        putaway: { avg: number };
      };
      outbound: {
        count: number;
        picking: { avg: number };
        load: { avg: number };
      };
    }> = {};

    // Process inbound stats
    inboundStats.forEach((stat) => {
      const standardType = standardizeTruckType(stat.truck_type || '');
      totalInboundProcessed += stat._count.id;
      
      if (!aggregatedStats[standardType]) {
        aggregatedStats[standardType] = {
          total_count: 0,
          inbound: {
            count: 0,
            unload: { avg: 0 },
            putaway: { avg: 0 }
          },
          outbound: {
            count: 0,
            picking: { avg: 0 },
            load: { avg: 0 }
          }
        };
      }

      // Add to existing count instead of overwriting
      aggregatedStats[standardType].inbound.count += stat._count.id;
      aggregatedStats[standardType].inbound.unload = {
        avg: stat._avg.leadtime_unload || 0
      };
      aggregatedStats[standardType].inbound.putaway = {
        avg: stat._avg.leadtime_put || 0
      };
    });

    // Process outbound stats
    outboundStats.forEach((stat) => {
      const standardType = standardizeTruckType(stat.truck_type || '');
      totalOutboundProcessed += stat._count.id;
      
      if (!aggregatedStats[standardType]) {
        aggregatedStats[standardType] = {
          total_count: 0,
          inbound: {
            count: 0,
            unload: { avg: 0 },
            putaway: { avg: 0 }
          },
          outbound: {
            count: 0,
            picking: { avg: 0 },
            load: { avg: 0 }
          }
        };
      }

      // Add to existing count instead of overwriting  
      aggregatedStats[standardType].outbound.count += stat._count.id;
      aggregatedStats[standardType].outbound.picking = {
        avg: stat._avg.leadtime_picking || 0
      };
      aggregatedStats[standardType].outbound.load = {
        avg: stat._avg.leadtime_load || 0
      };
    });

    // Calculate total_count after processing both inbound and outbound
    Object.keys(aggregatedStats).forEach((type) => {
      aggregatedStats[type].total_count = 
        aggregatedStats[type].inbound.count + 
        aggregatedStats[type].outbound.count;
    });

    // Include debug information in the response
    return NextResponse.json({
      success: true,
      debug: {
        rawTotalInbound: totalInbound,
        rawTotalOutbound: totalOutbound,
        processedTotalInbound: totalInboundProcessed,
        processedTotalOutbound: totalOutboundProcessed,
      },
      data: aggregatedStats
    });

  } catch (error) {
    console.error('Error fetching truck statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch truck statistics' },
      { status: 500 }
    );
  }
}