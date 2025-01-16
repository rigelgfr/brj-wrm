// (app)/dasboard/data.tsx

'use client'

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Label } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Box, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loading from '@/src/components/ui/Loading';

export const TruckDataCard = ({ currentMonth }) => (
  <Card onClick={() => { console.log("Clicked") }}>
    <CardContent className="p-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Truck className="h-5 w-5 text-green-600" />
          <h2 className="text-sm font-medium text-muted-foreground">Total Trucks In/Out last month</h2>
        </div>
        <div className='grid grid-cols-2'>
          <div className="flex items-baseline space-x-2 justify-center border-r">
            <h3 className="text-2xl font-bold">{currentMonth?.inboundTrucks || 0}</h3>
            <span className="text-sm text-muted-foreground">in</span>
          </div>
          <div className="flex items-baseline space-x-2 justify-center border-l">
            <h3 className="text-2xl font-bold">{currentMonth?.outboundTrucks || 0}</h3>
            <span className="text-sm text-muted-foreground">out</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const VolumeDataCard = ({ currentMonth }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Box className="h-5 w-5 text-green-600" />
          <h2 className="text-sm font-medium text-muted-foreground">Total Volume In/Out last month</h2>
        </div>
        <div className='grid grid-cols-2 text-2xl'>
          <div className="flex items-baseline space-x-2 justify-center border-r">
            <h3 className="font-bold">{currentMonth?.inboundVolume || 0}</h3>
            <span className="text-sm text-muted-foreground">in</span>
          </div>
          <div className="flex items-baseline space-x-2 justify-center border-l">
            <h3 className="font-bold">{currentMonth?.outboundVolume || 0}</h3>
            <span className="text-sm text-muted-foreground">out</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const TruckTrendsChart = ({ data, isLoading, error, maxTrucks }) => (
  <Card className="col-span-2">
    <CardHeader>
      <CardTitle>Monthly Truck Trends</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center">
          <Loading />
        </div>
      ) : error ? (
        <div className="h-[300px] flex items-center justify-center text-red-500">
          Error: {error}
        </div>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => value.substring(0, 3)}
              />
              <YAxis 
                domain={[0, maxTrucks]}
                allowDataOverflow={false}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="inboundTrucks" 
                stroke="#16a34a" 
                name="Truck In"
              />
              <Line 
                type="monotone" 
                dataKey="outboundTrucks" 
                stroke="#2563eb" 
                name="Truck Out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardContent>
  </Card>
);

export const VolumeTrendsChart = ({ data, isLoading, error, maxVolume }) => (
  <Card className="col-span-2">
    <CardHeader>
      <CardTitle>Monthly Volume Trends</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center">
          <Loading />
        </div>
      ) : error ? (
        <div className="h-[300px] flex items-center justify-center text-red-500">
          Error: {error}
        </div>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => value.substring(0, 3)}
              />
              <YAxis 
                domain={[0, maxVolume]}
                allowDataOverflow={false}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="inboundVolume" 
                stroke="#16a34a" 
                name="Volume In"
              />
              <Line 
                type="monotone" 
                dataKey="outboundVolume" 
                stroke="#2563eb" 
                name="Volume Out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardContent>
  </Card>
);

export const OccupancyDonut = ({ occupancyData, title }) => {
  const [warehouseTypes, setWarehouseTypes] = useState([]);
  const [currentTypeIndex, setCurrentTypeIndex] = useState(0);
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    if (!occupancyData?.data || !Array.isArray(occupancyData.data)) {
      return;
    }

    // Group data by warehouse type
    const groupedData = {};
    
    occupancyData.data.forEach(item => {
      const whType = item.wh_type;
      const status = item.status;
      const space = Number(item.space) || 0;

      if (!groupedData[whType]) {
        groupedData[whType] = {
          Occupied: 0,
          Empty: 0
        };
      }

      if (status === 'Occupied' || status === 'Empty') {
        groupedData[whType][status] += space;
      }
    });

    // Get unique warehouse types
    const types = Object.keys(groupedData);
    setWarehouseTypes(types);

    // Create processed data array
    const processed = types.map(type => ({
      type,
      data: [
        { name: 'Occupied', value: Math.round(groupedData[type].Occupied) },
        { name: 'Empty', value: Math.round(groupedData[type].Empty) }
      ]
    }));

    setProcessedData(processed);
  }, [occupancyData]);

  const COLORS = ['#a9d18e', '#e5e7eb'];

  const handlePrev = () => {
    setCurrentTypeIndex(prev => 
      prev === 0 ? warehouseTypes.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentTypeIndex(prev => 
      prev === warehouseTypes.length - 1 ? 0 : prev + 1
    );
  };

  if (!processedData.length) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <span className="text-muted-foreground">No occupancy data available</span>
        </CardContent>
      </Card>
    );
  }

  const currentData = processedData[currentTypeIndex].data;
  const total = currentData.reduce((sum, item) => sum + item.value, 0);
  const occupiedPercentage = total ? 
    ((currentData.find(d => d.name === 'Occupied')?.value || 0) / total * 100).toFixed(1) : 
    0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-2">
        {/* Donut chart with navigation arrows */}
        <div className="flex items-center justify-between w-full">
          {warehouseTypes.length > 1 && (
            <button 
              onClick={handlePrev}
              className="p-2 hover:bg-gray-100 rounded"
              aria-label="Previous warehouse type"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius= "90%"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                  <Label
                    value={`${occupiedPercentage}%`}
                    position="center"
                    fontSize={16}
                    fill="#374151"
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {warehouseTypes.length > 1 && (
            <button 
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 rounded"
              aria-label="Next warehouse type"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Warehouse type */}
        <div className="text-sm font-medium text-gray-600">
          {processedData[currentTypeIndex].type}
        </div>

        {/* Space values */}
        <div className="flex justify-center space-x-8">
          {currentData.map((entry, index) => (
            <div key={entry.name} className="flex flex-col items-center">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index] }} 
                />
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <span className="text-lg font-semibold mt-1">
                {entry.value.toLocaleString()} m²
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const OccupancyVolumeChart = ({ occupancyData, title }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!occupancyData?.data || !Array.isArray(occupancyData.data)) return;

    // Group and process the data
    const processedData = Object.values(
      occupancyData.data.reduce((acc, item) => {
        const whType = item.wh_type;
        if (!acc[whType]) {
          acc[whType] = {
            name: whType,
            total: 0,
            occupied: 0,
            empty: 0
          };
        }
        
        const value = Number(item.space) || 0;
        acc[whType].total += value;
        if (item.status === 'Occupied') acc[whType].occupied += value;
        if (item.status === 'Empty') acc[whType].empty += value;
        
        return acc;
      }, {})
    ).map(item => ({
      name: item.name,
      Occupied: item.occupied,
      Empty: item.empty,
      percentage: ((item.occupied / item.total) * 100).toFixed(1)
    }));

    setData(processedData);
  }, [occupancyData]);

  if (!data.length) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <span className="text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {data.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className='grid grid-cols-4 items-end'>
                <div className="text-sm font-medium text-darkgrey-krnd">{item.name}</div>
                <div className='flex text-xs col-span-2 justify-center'>
                  {Math.round(item.Occupied).toLocaleString()} m³ / {Math.round(item.Empty).toLocaleString()} m³
                </div>
                <div className='text-xs flex justify-end'>
                  {item.percentage}%
                </div>
              </div>
              
              <div className="w-full h-4 bg-[#e5e7eb] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#a9d18e] transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const LatestInboundTable = ({ data }) => {
  if (!data || data.length === 0) {
      return <div className="text-center py-4">No inbound data available</div>;
  }

  return (
      <div className="rounded-xl border shadow-sm">
          <CardHeader className='h-4'>
            <CardTitle className=''>Latest Inbound Data</CardTitle>
          </CardHeader>
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Inbound Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {data.map((item) => (
                      <TableRow key={item.no} className=''>
                          <TableCell>{item.no}</TableCell>
                          <TableCell>{item.area}</TableCell>
                          <TableCell>{new Date(item.inbound_date).toLocaleDateString()}</TableCell>
                          <TableCell>{item.customer_name}</TableCell>
                          <TableCell className="text-right">{item.volume}</TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
      </div>
  );
};

export const LatestOutboundTable = ({ data }) => {
  if (!data || data.length === 0) {
      return <div className="text-center py-4">No outbound data available</div>;
  }

  return (
      <div className="rounded-xl border shadow-sm">
        <CardHeader className='h-4'>
            <CardTitle className=''>Latest Outbound Data</CardTitle>
          </CardHeader>
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Outbound Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {data.map((item) => (
                      <TableRow key={item.no}>
                          <TableCell>{item.no}</TableCell>
                          <TableCell>{item.area}</TableCell>
                          <TableCell>{new Date(item.outbound_date).toLocaleDateString()}</TableCell>
                          <TableCell>{item.customer_name}</TableCell>
                          <TableCell className="text-right">{item.volume}</TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
      </div>
  );
};
