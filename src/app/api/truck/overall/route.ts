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
    const week = url.searchParams.get('week');

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
    
    // Add week filter if provided - use the week value directly as a string
    const weekFilter = week ? { week_in_month: week } : {};
    
    const filter = { ...yearFilter, ...monthFilter, ...weekFilter };

    // Get truck counts by type for inbound and outbound
    const [inboundData, outboundData] = await Promise.all([
      prisma.inbound.findMany({
        where: filter,
        select: {
          truck_type: true,
          leadtime_put: true,
          leadtime_unload: true
        }
      }),
      prisma.outbound.findMany({
        where: filter,
        select: {
          truck_type: true,
          leadtime_picking: true,
          leadtime_load: true
        }
      })
    ]);

    // Standardize truck types and aggregate the data
    const inboundCounts = new Map();
    const inboundLeadtimes = new Map();
    
    inboundData.forEach(item => {
      const standardType = standardizeTruckType(item.truck_type || '');
      
      // Update counts
      if (!inboundCounts.has(standardType)) {
        inboundCounts.set(standardType, 0);
      }
      inboundCounts.set(standardType, inboundCounts.get(standardType) + 1);
      
      // Update leadtimes
      if (!inboundLeadtimes.has(standardType)) {
        inboundLeadtimes.set(standardType, {
          put: { sum: 0, count: 0 },
          unload: { sum: 0, count: 0 }
        });
      }
      
      const leadtimes = inboundLeadtimes.get(standardType);
      if (item.leadtime_put !== null) {
        leadtimes.put.sum += item.leadtime_put;
        leadtimes.put.count += 1;
      }
      if (item.leadtime_unload !== null) {
        leadtimes.unload.sum += item.leadtime_unload;
        leadtimes.unload.count += 1;
      }
    });

    const outboundCounts = new Map();
    const outboundLeadtimes = new Map();
    
    outboundData.forEach(item => {
      const standardType = standardizeTruckType(item.truck_type || '');
      
      // Update counts
      if (!outboundCounts.has(standardType)) {
        outboundCounts.set(standardType, 0);
      }
      outboundCounts.set(standardType, outboundCounts.get(standardType) + 1);
      
      // Update leadtimes
      if (!outboundLeadtimes.has(standardType)) {
        outboundLeadtimes.set(standardType, {
          picking: { sum: 0, count: 0 },
          load: { sum: 0, count: 0 }
        });
      }
      
      const leadtimes = outboundLeadtimes.get(standardType);
      if (item.leadtime_picking !== null) {
        leadtimes.picking.sum += item.leadtime_picking;
        leadtimes.picking.count += 1;
      }
      if (item.leadtime_load !== null) {
        leadtimes.load.sum += item.leadtime_load;
        leadtimes.load.count += 1;
      }
    });

    // Get all unique truck types
    const allTruckTypes = new Set([
        ...Array.from(inboundCounts.keys()),
        ...Array.from(outboundCounts.keys())
    ]);

    // Create the combined data structure
    const truckTypeCounts = Array.from(allTruckTypes).map(truckType => {
      const inboundCount = inboundCounts.get(truckType) || 0;
      const outboundCount = outboundCounts.get(truckType) || 0;
      const totalCount = inboundCount + outboundCount;

      return {
        truck_type: truckType,
        inbound: inboundCount,
        outbound: outboundCount,
        total_count: totalCount
      };
    });

    // Process the data for leadtimes
    const leadtimes = Array.from(allTruckTypes).map(truckType => {
      const inboundLeadtime = inboundLeadtimes.get(truckType) || {
        put: { sum: 0, count: 0 },
        unload: { sum: 0, count: 0 }
      };
      
      const outboundLeadtime = outboundLeadtimes.get(truckType) || {
        picking: { sum: 0, count: 0 },
        load: { sum: 0, count: 0 }
      };
      
      return {
        truck_type: truckType,
        leadtime_put: inboundLeadtime.put.count > 0 
          ? Number((inboundLeadtime.put.sum / inboundLeadtime.put.count).toFixed(2)) 
          : null,
        leadtime_unload: inboundLeadtime.unload.count > 0 
          ? Number((inboundLeadtime.unload.sum / inboundLeadtime.unload.count).toFixed(2)) 
          : null,
        leadtime_picking: outboundLeadtime.picking.count > 0 
          ? Number((outboundLeadtime.picking.sum / outboundLeadtime.picking.count).toFixed(2)) 
          : null,
        leadtime_load: outboundLeadtime.load.count > 0 
          ? Number((outboundLeadtime.load.sum / outboundLeadtime.load.count).toFixed(2)) 
          : null
      };
    });

    // Return the response
    return NextResponse.json({
      timeframe: {
        year: yearNum,
        month: month || null,
        week: week || null
      },
      truck_counts: truckTypeCounts,
      leadtime_averages: leadtimes
    });
  } catch (error) {
    console.error('Error in truck/overall route:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}