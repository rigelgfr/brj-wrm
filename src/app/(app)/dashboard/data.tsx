'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight } from 'lucide-react';

interface DashboardData {
  occupancySqm: OccupancyData[];
  occupancyVol: OccupancyData[];
}

interface OccupancyData {
  year: number;
  month: string;
  week: string;
  wh_type: string;
  status: string;
  space: number;
}

const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return { currentTime, formatTime };
};

const getChartData = (occupancyData: OccupancyData[] | undefined) => {
  if (!occupancyData) return [];

  const monthlyData = occupancyData.reduce((acc, curr) => {
    if (!acc[curr.month]) {
      acc[curr.month] = { total: 0, count: 0 };
    }
    acc[curr.month].total += curr.space;
    acc[curr.month].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    occupancy: Math.round((data.total / data.count) * 100) / 100
  }));
};

const WarehouseTypes = ['FZ AB', 'FZ BRJ', 'Bonded', 'CFS', 'PLB'];

// Main Dashboard Component
export const DashboardContent = () => {
  const router = useRouter();
  const { currentTime, formatTime } = useCurrentTime();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/inventory/table');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-krnd" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Time Banner */}
      <Card className="w-full bg-green-krnd">
        <CardContent className="p-6">
          <h1 className="text-4xl font-bold text-white text-center">
            {formatTime(currentTime)}
          </h1>
        </CardContent>
      </Card>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Inventory Preview */}
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push('/inventory')}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Inventory Overview</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-krnd" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={getChartData(data?.occupancySqm)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke="#659c37" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Latest Occupancy Stats */}
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push('/occupancy')}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current Occupancy</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-krnd" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total SQM</p>
              <p className="text-2xl font-bold">
                {data?.occupancySqm?.[0]?.space || 0} m²
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Volume</p>
              <p className="text-2xl font-bold">
                {data?.occupancyVol?.[0]?.space || 0} m³
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Types */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Warehouse Types</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-krnd" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {WarehouseTypes.map((type) => (
                <div key={type} className="flex justify-between items-center">
                  <span>{type}</span>
                  <span className="font-semibold">
                    {data?.occupancySqm?.find(item => item.wh_type === type)?.space || 0} m²
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};