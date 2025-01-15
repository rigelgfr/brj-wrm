import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

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
            orderBy: [
                { year: 'desc' },
                { month: 'desc' },
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

        // Calculate occupancy by status
        const occupancySqmByStatus = occupancySqmData.reduce((acc, curr) => {
            const status = curr.status;
            acc[status] = (acc[status] || 0) + (curr.space || 0);
            return acc;
        }, {} as Record<string, number>);

        // Fetch latest occupancy data (Volume)
        const latestOccupancyVol = await prisma.occupancy_vol.findMany({
            orderBy: [
                { year: 'desc' },
                { month: 'desc' },
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

        // Calculate volume occupancy by status
        const occupancyVolByStatus = occupancyVolData.reduce((acc, curr) => {
            const status = curr.status;
            acc[status] = (acc[status] || 0) + (curr.space || 0);
            return acc;
        }, {} as Record<string, number>);

        // Combine and format the data
        const formattedResult = last6Months.map(month => {
            const inboundMonth = inboundResult.find(r => r.month === month);
            const outboundMonth = outboundResult.find(r => r.month === month);
            
            return {
                month,
                inboundTrucks: inboundMonth?._sum.unique_truck_count || 0,
                outboundTrucks: outboundMonth?._sum.unique_truck_count || 0,
                inboundVolume: inboundMonth?._sum.total_volume || 0,
                outboundVolume: outboundMonth?._sum.total_volume || 0,
            };
        });

        // Format occupancy data for pie charts
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
                data: [
                    { name: 'Occupied', value: occupancyVolByStatus['Occupied'] || 0 },
                    { name: 'Empty', value: occupancyVolByStatus['Empty'] || 0 }
                ]
            }
        };

        return NextResponse.json({
            data: formattedResult,
            currentMonth: {
                inboundTrucks: formattedResult[5]?.inboundTrucks || 0,
                outboundTrucks: formattedResult[5]?.outboundTrucks || 0,
                inboundVolume: Math.round(formattedResult[4]?.inboundVolume || 0),
                outboundVolume: Math.round(formattedResult[4]?.outboundVolume || 0),
            },
            occupancy: occupancyData
        });
    } catch (error) {
        console.error("[DASHBOARD_GET]", error);
        return NextResponse.json(
            { error: "Failed to fetch aggregated data" },
            { status: 500 }
        );
    }
}