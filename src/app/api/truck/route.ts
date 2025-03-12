export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { standardizeTruckType } from "./classifyTruck";

export async function GET() {
  try {
    // First, let's get total counts to verify our data
    const totalInbound = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM inbound
    `;
    
    const totalOutbound = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM outbound
    `;

    // Fetch inbound statistics with raw counts
    const inboundStats = await prisma.$queryRaw<any[]>`
      SELECT 
        truck_type,
        COUNT(*) as count,
        AVG(leadtime_unload) as avg_unload,
        MIN(leadtime_unload) as min_unload,
        MAX(leadtime_unload) as max_unload,
        AVG(leadtime_put) as avg_putaway,
        MIN(leadtime_put) as min_putaway,
        MAX(leadtime_put) as max_putaway
      FROM inbound
      GROUP BY truck_type
    `;

    // Fetch outbound statistics with raw counts
    const outboundStats = await prisma.$queryRaw<any[]>`
      SELECT 
        truck_type,
        COUNT(*) as count,
        AVG(leadtime_picking) as avg_picking,
        MIN(leadtime_picking) as min_picking,
        MAX(leadtime_picking) as max_picking,
        AVG(leadtime_load) as avg_load,
        MIN(leadtime_load) as min_load,
        MAX(leadtime_load) as max_load
      FROM outbound
      GROUP BY truck_type
    `;

    // Debug counters
    let totalInboundProcessed = 0;
    let totalOutboundProcessed = 0;
    
    const aggregatedStats: Record<string, {
      total_count: number;
      inbound: {
        count: number;
        unload: { avg: number; min: number; max: number };
        putaway: { avg: number; min: number; max: number };
      };
      outbound: {
        count: number;
        picking: { avg: number; min: number; max: number };
        load: { avg: number; min: number; max: number };
      };
    }> = {};

    // Process inbound stats
    inboundStats.forEach((stat) => {
      const standardType = standardizeTruckType(stat.truck_type);
      totalInboundProcessed += Number(stat.count);
      
      if (!aggregatedStats[standardType]) {
        aggregatedStats[standardType] = {
          total_count: 0,
          inbound: {
            count: 0,
            unload: { avg: 0, min: 0, max: 0 },
            putaway: { avg: 0, min: 0, max: 0 }
          },
          outbound: {
            count: 0,
            picking: { avg: 0, min: 0, max: 0 },
            load: { avg: 0, min: 0, max: 0 }
          }
        };
      }

      // Add to existing count instead of overwriting
      aggregatedStats[standardType].inbound.count += Number(stat.count);
      aggregatedStats[standardType].inbound.unload = {
        avg: Number(stat.avg_unload) || 0,
        min: Number(stat.min_unload) || 0,
        max: Number(stat.max_unload) || 0
      };
      aggregatedStats[standardType].inbound.putaway = {
        avg: Number(stat.avg_putaway) || 0,
        min: Number(stat.min_putaway) || 0,
        max: Number(stat.max_putaway) || 0
      };
    });

    // Process outbound stats
    outboundStats.forEach((stat) => {
      const standardType = standardizeTruckType(stat.truck_type);
      totalOutboundProcessed += Number(stat.count);
      
      if (!aggregatedStats[standardType]) {
        aggregatedStats[standardType] = {
          total_count: 0,
          inbound: {
            count: 0,
            unload: { avg: 0, min: 0, max: 0 },
            putaway: { avg: 0, min: 0, max: 0 }
          },
          outbound: {
            count: 0,
            picking: { avg: 0, min: 0, max: 0 },
            load: { avg: 0, min: 0, max: 0 }
          }
        };
      }

      // Add to existing count instead of overwriting
      aggregatedStats[standardType].outbound.count += Number(stat.count);
      aggregatedStats[standardType].outbound.picking = {
        avg: Number(stat.avg_picking) || 0,
        min: Number(stat.min_picking) || 0,
        max: Number(stat.max_picking) || 0
      };
      aggregatedStats[standardType].outbound.load = {
        avg: Number(stat.avg_load) || 0,
        min: Number(stat.min_load) || 0,
        max: Number(stat.max_load) || 0
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
        rawTotalInbound: Number(totalInbound[0].count),
        rawTotalOutbound: Number(totalOutbound[0].count),
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