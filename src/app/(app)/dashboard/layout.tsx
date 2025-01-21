// (app)/dasboard/layout.tsx
'use client'

import React, { useState, useEffect } from 'react';
import Clock from '@/components/Clock';
import { Card, CardContent } from "@/components/ui/card";
import { TruckDataCard, VolumeDataCard, TruckTrendsChart, VolumeTrendsChart, OccupancyDonut, OccupancyVolumeChart, LatestInboundTable, LatestOutboundTable } from './data';
import { MonthlyData, DashboardData } from './types';
import Loading from '@/components/ui/Loading';

const DashboardLayout: React.FC = () => {
    const [data, setData] = useState<DashboardData>({ 
      data: [], 
      currentMonth: {
        inboundTrucks: 0,
        outboundTrucks: 0,
        inboundVolume: 0,
        outboundVolume: 0
      },
      lastMonth: {
        inboundTrucks: 0,
        outboundTrucks: 0,
        inboundVolume: 0,
        outboundVolume: 0
      },
      occupancy: {
        sqm: { period: { year: 0, month: '', week: 0 }, data: [] },
        volume: { period: { year: 0, month: '', week: 0 }, data: [] }
      },
      latestInbounds: [],
      latestOutbounds: [],
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/dashboard');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const result = await response.json();
                console.log('Fetched data:', result); // Debug log
                setData(result);
            } catch (err) {
                console.error('Error fetching data:', err);

                if(err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate maximum values for Y-axis limits
    const getMaxValue = (dataArray: MonthlyData[], keys: (keyof MonthlyData)[]): number => {
      if (!dataArray || dataArray.length === 0) return 0;
      return Math.ceil(
        Math.max(
          ...dataArray.flatMap(item => 
            keys.map(key => {
                const value = item[key];
                return typeof value === 'number' ? value : 0;
            })
        )
      ) * 1.1);
    };

    const maxTrucks = getMaxValue(data.data, ['inboundTrucks', 'outboundTrucks']);
    const maxVolume = getMaxValue(data.data, ['inboundVolume', 'outboundVolume']);

    return (
        <div className="p-4 mx-[1em]">
            <div className="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-6">
                <div className='col-span-1 md:col-span-2 flex flex-row border-b-2'>
                    <div className='flex flex-col justify-start mr-4 items-start '>
                        <h1 className="text-3xl font-normal text-lightgrey-krnd">BRJ Warehouse</h1>
                        <h1 className="text-5xl font-bold text-green-krnd">Dashboard</h1>
                    </div>
                    <div className='w-full h-full flex justify-end items-center'>
                        <Clock />
                    </div>
                </div>
                        
    

                <TruckDataCard lastMonth={data.lastMonth} />
                <VolumeDataCard lastMonth={data.lastMonth} />

                <TruckTrendsChart 
                  data={data.data}
                  isLoading={isLoading}
                  error={error}
                  maxTrucks={maxTrucks}
                />
                
                {/* Occupancy sqm donut chart */}
                <div className="h-full">
                    {isLoading ? (
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-center h-full">
                                <Loading />
                            </CardContent>
                        </Card>
                    ) : error ? (
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-center h-full text-red-500">
                                Error: {error}
                            </CardContent>
                        </Card>
                    ) : data.occupancy?.sqm ? (
                        <OccupancyDonut 
                            occupancyData={data.occupancy.sqm}
                            title={`SQM (${data.occupancy.sqm.period?.week || ''}, ${data.occupancy.sqm.period?.month || ''} ${data.occupancy.sqm.period?.year || ''})`}
                        />
                    ) : (
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-center h-full">
                                No occupancy data available
                            </CardContent>
                        </Card>
                    )}
                </div>
                
                {/* Occupancy vol bar charts */}
                <div className="h-full">
                    {isLoading ? (
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-center h-full">
                                <Loading />
                            </CardContent>
                        </Card>
                    ) : error ? (
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-center h-full text-red-500">
                                Error: {error}
                            </CardContent>
                        </Card>
                    ) : data.occupancy?.volume ? (
                        <OccupancyVolumeChart 
                            occupancyData={data.occupancy.volume}
                            title={`Volume (${data.occupancy.volume.period?.week || ''}, ${data.occupancy.volume.period?.month || ''} ${data.occupancy.volume.period?.year || ''})`}
                        />
                    ) : (
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-center h-full">
                                No occupancy data available
                            </CardContent>
                        </Card>
                    )}
                </div>

                <VolumeTrendsChart 
                  data={data.data}
                  isLoading={isLoading}
                  error={error}
                  maxVolume={maxVolume}
                />

                <div className='grid grid-rows-2 col-span-2 gap-6'>
                    {isLoading ? (
                        <>
                            <div className='w-full flex justify-center items-center'><Loading/></div>
                            <div className='w-full flex justify-center items-center'><Loading/></div>
                        </>
                    ) : error ? (
                        <>
                            <div className='w-full flex justify-center items-center text-red-500'>Error: {error}</div>
                            <div className='w-full flex justify-center items-center text-red-500'>Error: {error}</div>
                        </>
                    ) : (
                        <>  
                            <LatestInboundTable data={data.latestInbounds} />

                            <LatestOutboundTable data={data.latestOutbounds} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;