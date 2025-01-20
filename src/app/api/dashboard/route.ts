// api/dashboard/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Helper function to safely convert Decimal to number
const toNumber = (value: number | Prisma.Decimal | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    if (value instanceof Prisma.Decimal) {
        return value.toNumber();
    }
    return value;
};

export async function GET() {
    try {
        // Get current date
        const now = new Date();
        
        // Create an array of the last 6 months in reverse order (oldest to newest)
        const last6Months = Array.from({length: 6}, (_, i) => {
            const d = new Date(now);
            d.setMonth(d.getMonth() - (5 - i)); // Changed from d.getMonth() - i
            return d.toLocaleString('default', { month: 'long' });
        });

        // Fetch inbound data
        const inboundResult = await prisma.inbound_aggregated.groupBy({
            by: ['month'],
            _sum: {
                unique_truck_count: true,
                total_volume: true,
            },
            where: {
                month: {
                    in: last6Months
                }
            }
        });

        // Fetch outbound data
        const outboundResult = await prisma.outbound_aggregated.groupBy({
            by: ['month'],
            _sum: {
                unique_truck_count: true,
                total_volume: true,
            },
            where: {
                month: {
                    in: last6Months
                }
            }
        });

        // Fetch latest occupancy data (SQM)
        const latestOccupancySqm = await prisma.occupancy_sqm.findMany({
            include: {
                months: true, // Include related month data
            },
            orderBy: [
                { year: 'desc' },
                { months: { sort: 'desc' } }, // Order by `sort` in the related `Months` table
                { week: 'desc' }
            ],
            take: 1
        });

        // Get all occupancy records for the latest period
        const occupancySqmData = await prisma.occupancy_sqm.findMany({
            where: {
                year: latestOccupancySqm[0]?.year,
                month: latestOccupancySqm[0]?.month,
                week: latestOccupancySqm[0]?.week
            }
        });

        // Fetch latest occupancy data (Volume)
        const latestOccupancyVol = await prisma.occupancy_vol.findMany({
            include: {
                months: true, // Include related month data
            },
            orderBy: [
                { year: 'desc' },
                { months: { sort: 'desc' } }, // Order by `sort` in the related `Months` table
                { week: 'desc' }
            ],
            take: 1
        });

        // Get all occupancy records for the latest period
        const occupancyVolData = await prisma.occupancy_vol.findMany({
            where: {
                year: latestOccupancyVol[0]?.year,
                month: latestOccupancyVol[0]?.month,
                week: latestOccupancyVol[0]?.week
            }
        });

        // Fetch latest inbound records
        const latestInbounds = await prisma.inbound.findMany({
            select: {
                no: true,
                area: true,
                inbound_date: true,
                customer_name: true,
                volume: true
            },
            orderBy: {
                no: 'desc'
            },
            take: 3
        });

        // Fetch latest outbound records
        const latestOutbounds = await prisma.outbound.findMany({
            select: {
                no: true,
                area: true,
                outbound_date: true,
                customer_name: true,
                volume: true
            },
            orderBy: {
                no: 'desc'
            },
            take: 3
        });

        // Combine and format the data
        const formattedResult = last6Months.map(month => {
            const inboundMonth = inboundResult.find(r => r.month === month);
            const outboundMonth = outboundResult.find(r => r.month === month);
            
            return {
                month,
                inboundTrucks: toNumber(inboundMonth?._sum.unique_truck_count) || 0,
                outboundTrucks: toNumber(outboundMonth?._sum.unique_truck_count) || 0,
                inboundVolume: toNumber(inboundMonth?._sum.total_volume) || 0,
                outboundVolume: toNumber(outboundMonth?._sum.total_volume) || 0,
            };
        });

        // Format occupancy data, sqm with pie charts, vol with bars
        const occupancyData = {
            sqm: {
                period: {
                    year: latestOccupancySqm[0]?.year,
                    month: latestOccupancySqm[0]?.month,
                    week: latestOccupancySqm[0]?.week
                },
                data: occupancySqmData.map(record => ({
                    wh_type: record.wh_type,
                    status: record.status,
                    space: record.space
                }))
            },
            volume: {
                period: {
                    year: latestOccupancyVol[0]?.year,
                    month: latestOccupancyVol[0]?.month,
                    week: latestOccupancyVol[0]?.week
                },
                data: occupancyVolData.map(record => ({
                    wh_type: record.wh_type,
                    status: record.status,
                    space: record.space
                }))
                
            }
        };

        return NextResponse.json({
            data: formattedResult,
            currentMonth: {
                inboundTrucks: formattedResult[5]?.inboundTrucks || 0,
                outboundTrucks: formattedResult[5]?.outboundTrucks || 0,
                inboundVolume: Math.round(formattedResult[5]?.inboundVolume || 0),
                outboundVolume: Math.round(formattedResult[5]?.outboundVolume || 0),
            },
            occupancy: occupancyData,
            latestInbounds,
            latestOutbounds
        });
    } catch (error) {
        console.error("[DASHBOARD_GET]", error);
        return NextResponse.json(
            { error: "Failed to fetch aggregated data" },
            { status: 500 }
        );
    }
}