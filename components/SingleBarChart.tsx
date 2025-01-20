import React from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';

interface SingleBarChartProps {
  data: Array<{
    week: string;
    occupied: number;
  }>;
  title: string;
  selectedWeeks: string[];
  maxCapacity?: number; // Added maxCapacity prop
}

const SingleBarChart = ({ data, title, selectedWeeks, maxCapacity }: SingleBarChartProps) => {
  const maxValue = Math.max(...data.map(d => d.occupied));

  return (
    <Card className='bg-slate-50'>
      <div className="flex justify-between items-center p-6 pb-0">
        <CardTitle className='text-darkgrey-krnd'>{title}</CardTitle>
        {maxCapacity !== undefined && (
          <div className="text-sm text-gray-600">
            Max. Capacity: {maxCapacity.toLocaleString()} m³
          </div>
        )}
      </div>
      <CardContent className='pt-0 px-0'>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
              barCategoryGap={"30%"}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="week"
                className="text-sm"
              />
              <YAxis
                domain={[0, maxValue * 1.1]}
                hide
              />
              <Tooltip />
              <Bar 
                dataKey="occupied"
                name="Volume"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={selectedWeeks.includes(entry.week) ? '#94d454' : '#c5e7a7'}
                  />
                ))}
                <LabelList 
                  dataKey="occupied" 
                  position="top" 
                  className="text-xs"
                  formatter={(value: number) => value.toLocaleString()}
                  style={{ fill: '#4b5563' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SingleBarChart;