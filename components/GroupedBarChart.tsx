// components/GroupedBarChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer, Legend, YAxis } from 'recharts';

interface WarehouseData {
  warehouse: string;
  [key: string]: string | number; // For dynamic week keys like 'W1', 'W2', etc.
}

interface GroupedBarChartProps {
  data: WarehouseData[];
  weeks: string[];
  title: string;
}

const COLORS = ['#94d454', '#54cccc', '#fcc404', '#acd48c', '#e3cb8c'];

// Helper function to sort weeks
const sortWeeks = (weeks: string[]): string[] => {
  return [...weeks].sort((a, b) => {
    const weekA = parseInt(a.slice(1));
    const weekB = parseInt(b.slice(1));
    return weekA - weekB;
  });
};

// Helper function to sort warehouses alphabetically
const sortWarehouses = (data: WarehouseData[]): WarehouseData[] => {
  return [...data].sort((a, b) => a.warehouse.localeCompare(b.warehouse));
};

// Helper function to calculate max value
const calculateMaxValue = (data: WarehouseData[], weeks: string[]): number => {
  const maxValue = Math.max(...data.flatMap(entry => 
    weeks.map(week => (typeof entry[week] === 'number' ? entry[week] : 0) as number)
  ));
  return maxValue * 1.1; // Add 10% padding
};

const GroupedBarChart = ({ data, weeks, title }: GroupedBarChartProps) => {
  const sortedWeeks = sortWeeks(weeks);
  const sortedData = sortWarehouses(data);
  const maxValuePadded = calculateMaxValue(data, weeks);

  return (
    <Card className='bg-slate-50'>
      <CardHeader>
        <CardTitle className='text-darkgrey-krnd'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              barCategoryGap={"10%"}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="warehouse" 
                className="text-sm"
              />
              <YAxis
                domain={[0, maxValuePadded]} // Set Y-axis range explicitly
                hide // Hide the Y-axis visually
              />
              <Tooltip />
              <Legend />
              {sortedWeeks.map((week, index) => (
                <Bar 
                  key={week}
                  dataKey={week}
                  fill={COLORS[index % COLORS.length]}
                  name={`W${week.slice(1)}`}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                >
                  <LabelList 
                    dataKey={week} 
                    position="top" 
                    className="text-xs"
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupedBarChart;