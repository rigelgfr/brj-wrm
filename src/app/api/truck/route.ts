import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to standardize truck types
function standardizeTruckType(type: string): string {
  const normalized = type.toUpperCase().trim();
  
  if (!normalized) return "Unknown";
  
  if (normalized.includes("WING") || normalized === "WB") return "Wing Box";
  if (normalized.match(/40|40'|40FT|40HQ|40HC|40OT|40DRY/)) return "40ft";
  if (normalized.match(/20|20'|20FT|20GP|20DRY/)) return "20ft";
  if (normalized === "CDD") return "CDD";
  if (normalized === "CDE") return "CDE";
  if (normalized.includes("TRONTON")) return "Tronton";
  if (normalized.includes("BOX")) return "Box";
  if (normalized === "MOTOR") return "Motor";
  if (normalized === "MOBIL") return "Mobil";
  if (normalized.includes("FLAT")) return "Flatbed";
  if (normalized === "FUSO") return "Fuso";
  
  return "Unknown";
}

export async function GET() {
  try {
    // Fetch inbound statistics
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
      WHERE truck_type IS NOT NULL
      GROUP BY truck_type
    `;

    // Fetch outbound statistics
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
      WHERE truck_type IS NOT NULL
      GROUP BY truck_type
    `;

    // Initialize aggregated stats object
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

      aggregatedStats[standardType].total_count += Number(stat.count);
      aggregatedStats[standardType].inbound.count = Number(stat.count);
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

      aggregatedStats[standardType].total_count += Number(stat.count);
      aggregatedStats[standardType].outbound.count = Number(stat.count);
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

    return NextResponse.json({
      success: true,
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