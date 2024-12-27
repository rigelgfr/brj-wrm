// components/GroupedBarChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GroupedBarChartProps {
  data: any[];
  weeks: string[];
  title: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

const GroupedBarChart = ({ data, weeks, title }: GroupedBarChartProps) => {
    console.log('Chart Data:', data);
  console.log('Weeks:', weeks);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="warehouse" 
                className="text-sm"
              />
              <YAxis
                className="text-sm"
                label={{ 
                  value: 'Total Truck Count', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip />
              <Legend />
              {weeks.map((week, index) => (
                <Bar 
                  key={week}
                  dataKey={week}
                  fill={COLORS[index % COLORS.length]}
                  name={`Week ${week.slice(1)}`}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupedBarChart;