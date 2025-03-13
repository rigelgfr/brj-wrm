export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { standardizeTruckType } from '../classifyTruck';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const year = url.searchParams.get('year');
    const month = url.searchParams.get('month');

    // Validate year
    if (!year) {
      return NextResponse.json(
        { error: 'Year parameter is required' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum)) {
      return NextResponse.json(
        { error: 'Year must be a valid number' },
        { status: 400 }
      );
    }

    // Prepare filter conditions
    const yearFilter = { year: yearNum };
    const monthFilter = month ? { month } : {};
    const filter = { ...yearFilter, ...monthFilter };

    // Get truck counts by area and type for inbound and outbound
    const [inboundData, outboundData] = await Promise.all([
      prisma.inbound.findMany({
        where: filter,
        select: {
          truck_type: true,
          area: true,
          leadtime_put: true,
          leadtime_unload: true
        }
      }),
      prisma.outbound.findMany({
        where: filter,
        select: {
          truck_type: true,
          area: true,
          leadtime_load: true,
          leadtime_picking: true
        }
      })
    ]);

    // Use Map<string, Map<string, number>> to ensure proper typing
    const inboundCountsByArea = new Map<string, Map<string, number>>();

    // Add this code for inbound leadtime tracking
    const inboundLeadtimesByArea = new Map<string, Map<string, {
        put: { sum: number, count: number },
        unload: { sum: number, count: number }
    }>>();
    
    inboundData.forEach(item => {
        const standardType = standardizeTruckType(item.truck_type || '');
        const area = item.area || 'Unknown';
        
        // Initialize area map if not exists for counts
        if (!inboundCountsByArea.has(area)) {
          inboundCountsByArea.set(area, new Map());
        }
        
        // Update count
        const areaCountMap = inboundCountsByArea.get(area)!;
        areaCountMap.set(standardType, (areaCountMap.get(standardType) || 0) + 1);
        
        // Initialize area map if not exists for leadtimes
        if (!inboundLeadtimesByArea.has(area)) {
          inboundLeadtimesByArea.set(area, new Map());
        }
        
        const areaLeadtimeMap = inboundLeadtimesByArea.get(area)!;
        
        // Initialize truck type leadtimes if not exists
        if (!areaLeadtimeMap.has(standardType)) {
          areaLeadtimeMap.set(standardType, {
            put: { sum: 0, count: 0 },
            unload: { sum: 0, count: 0 }
          });
        }
        
        const leadtimes = areaLeadtimeMap.get(standardType)!;
        
        if (item.leadtime_put !== null) {
          leadtimes.put.sum += item.leadtime_put;
          leadtimes.put.count += 1;
        }
        
        if (item.leadtime_unload !== null) {
          leadtimes.unload.sum += item.leadtime_unload;
          leadtimes.unload.count += 1;
        }
    });

    const outboundCountsByArea = new Map<string, Map<string, number>>();

    const outboundLeadtimesByArea = new Map<string, Map<string, {
        picking: { sum: number, count: number },
        load: { sum: number, count: number }
    }>>();
    
    outboundData.forEach(item => {
        const standardType = standardizeTruckType(item.truck_type || '');
        const area = item.area || 'Unknown';
        
        // Initialize area map if not exists for counts
        if (!outboundCountsByArea.has(area)) {
          outboundCountsByArea.set(area, new Map());
        }
        
        // Update count
        const areaCountMap = outboundCountsByArea.get(area)!;
        areaCountMap.set(standardType, (areaCountMap.get(standardType) || 0) + 1);
        
        // Initialize area map if not exists for leadtimes
        if (!outboundLeadtimesByArea.has(area)) {
          outboundLeadtimesByArea.set(area, new Map());
        }
        
        const areaLeadtimeMap = outboundLeadtimesByArea.get(area)!;
        
        // Initialize truck type leadtimes if not exists
        if (!areaLeadtimeMap.has(standardType)) {
          areaLeadtimeMap.set(standardType, {
            picking: { sum: 0, count: 0 },
            load: { sum: 0, count: 0 }
          });
        }
        
        const leadtimes = areaLeadtimeMap.get(standardType)!;
        
        if (item.leadtime_load !== null) {
          leadtimes.load.sum += item.leadtime_load;
          leadtimes.load.count += 1;
        }
        
        if (item.leadtime_picking !== null) {
          leadtimes.picking.sum += item.leadtime_picking;
          leadtimes.picking.count += 1;
        }
    });

    // Get all unique areas and truck types
    const allAreas = new Set<string>([
      ...Array.from(inboundCountsByArea.keys()),
      ...Array.from(outboundCountsByArea.keys())
    ]);
    
    const allTruckTypes = new Set<string>();
    
    // Collect all unique truck types across all areas
    // Using Array.from to avoid iterator issues
    Array.from(inboundCountsByArea.values()).forEach(areaMap => {
      Array.from(areaMap.keys()).forEach(truckType => {
        allTruckTypes.add(truckType);
      });
    });
    
    Array.from(outboundCountsByArea.values()).forEach(areaMap => {
      Array.from(areaMap.keys()).forEach(truckType => {
        allTruckTypes.add(truckType);
      });
    });

    // Process leadtime data to add to the response
    const areaLeadtimes = Array.from(allAreas).map(area => {
      const inboundLeadtimeMap = inboundLeadtimesByArea.get(area) || new Map();
      const outboundLeadtimeMap = outboundLeadtimesByArea.get(area) || new Map();
      
      return Array.from(allTruckTypes).map(truckType => {
        const inboundLeadtime = inboundLeadtimeMap.get(truckType);
        const outboundLeadtime = outboundLeadtimeMap.get(truckType);
        
        // Calculate average leadtimes
        const leadtime_put = inboundLeadtime && inboundLeadtime.put.count > 0
          ? inboundLeadtime.put.sum / inboundLeadtime.put.count
          : null;
          
        const leadtime_unload = inboundLeadtime && inboundLeadtime.unload.count > 0
          ? inboundLeadtime.unload.sum / inboundLeadtime.unload.count
          : null;
          
        const leadtime_picking = outboundLeadtime && outboundLeadtime.picking.count > 0
          ? outboundLeadtime.picking.sum / outboundLeadtime.picking.count
          : null;
          
        const leadtime_load = outboundLeadtime && outboundLeadtime.load.count > 0
          ? outboundLeadtime.load.sum / outboundLeadtime.load.count
          : null;
        
        return {
          truck_type: truckType,
          leadtime_put,
          leadtime_unload,
          leadtime_picking,
          leadtime_load
        };
      });
    });

    // Create the combined data structure
    const areaData = Array.from(allAreas).map((area, index) => {
      const inboundMap = inboundCountsByArea.get(area) || new Map<string, number>();
      const outboundMap = outboundCountsByArea.get(area) || new Map<string, number>();
      
      const truckTypeCounts = Array.from(allTruckTypes).map(truckType => {
        const inboundCount = inboundMap.get(truckType) || 0;
        const outboundCount = outboundMap.get(truckType) || 0;
        const totalCount = inboundCount + outboundCount;
        
        return {
          truck_type: truckType,
          inbound: inboundCount,
          outbound: outboundCount,
          total: totalCount
        };
      });
      
      // Calculate area totals with proper typing
      const inboundTotal = Array.from(inboundMap.values()).reduce((sum, count) => sum + count, 0);
      const outboundTotal = Array.from(outboundMap.values()).reduce((sum, count) => sum + count, 0);
      
      return {
        area: area,
        truck_types: truckTypeCounts,
        leadtimes: areaLeadtimes[index],
        totals: {
          inbound: inboundTotal,
          outbound: outboundTotal,
          total: inboundTotal + outboundTotal
        }
      };
    });

    // Return the response
    return NextResponse.json({
      timeframe: {
        year: yearNum,
        month: month || null
      },
      truck_counts_by_area: areaData,
      all_truck_types: Array.from(allTruckTypes)
    });
  } catch (error) {
    console.error('Error in truck/by route:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}