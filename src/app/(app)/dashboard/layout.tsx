'use client'

import React, { useState, useEffect } from 'react';
import Clock from '@/src/components/Clock';
import { Card, CardContent } from "@/components/ui/card";
import { TruckDataCard, VolumeDataCard, TruckTrendsChart, VolumeTrendsChart, OccupancyDonut } from './data';

const DashboardLayout = () => {
    const [data, setData] = useState({ 
      data: [], 
      currentMonth: {},
      occupancy: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate maximum values for Y-axis limits
    const getMaxValue = (dataArray, keys) => {
      if (!dataArray || dataArray.length === 0) return 0;
      return Math.ceil(Math.max(
          ...dataArray.flatMap(item => keys.map(key => item[key] || 0))
      ) * 1.1);
    };

    const maxTrucks = getMaxValue(data.data, ['inboundTrucks', 'outboundTrucks']);
    const maxVolume = getMaxValue(data.data, ['inboundVolume', 'outboundVolume']);

    return (
        <div className="p-4 mx-[1em]">
            <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
                <Card className="col-span-2 shadow-none border-none">
                    <CardContent className="flex items-center justify-between p-6">
                        <h1 className="text-4xl font-bold text-green-600">Dashboard</h1>
                        <Clock />
                    </CardContent>
                </Card>

                <TruckDataCard currentMonth={data.currentMonth} />
                <VolumeDataCard currentMonth={data.currentMonth} />

                <TruckTrendsChart 
                  data={data.data}
                  isLoading={isLoading}
                  error={error}
                  maxTrucks={maxTrucks}
                />

                <div className="h-full">
                    {isLoading ? (
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-center h-full">
                                Loading...
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
                            title={`Space Occupancy (Week ${data.occupancy.sqm.period?.week || ''}, ${data.occupancy.sqm.period?.month || ''} ${data.occupancy.sqm.period?.year || ''})`}
                        />
                    ) : (
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-center h-full">
                                No occupancy data available
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="h-full bg-gray-100 rounded-lg p-4">Grid Item 2</div>

                <VolumeTrendsChart 
                  data={data.data}
                  isLoading={isLoading}
                  error={error}
                  maxVolume={maxVolume}
                />
            </div>
        </div>
    );
};

export default DashboardLayout;