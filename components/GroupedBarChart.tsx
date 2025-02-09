import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer, YAxis } from 'recharts';

interface WarehouseData {
  warehouse: string;
  [key: string]: string | number;
}

interface GroupedBarChartProps {
  data: WarehouseData[];
  weeks: string[];
  title: string;
}

const COLORS = ['#94d454', '#54cccc', '#fcc404', '#acd48c', '#e3cb8c'];

const sortWeeks = (weeks: string[]): string[] => {
  return [...weeks].sort((a, b) => {
    const weekA = parseInt(a.slice(1));
    const weekB = parseInt(b.slice(1));
    return weekA - weekB;
  });
};

const sortWarehouses = (data: WarehouseData[]): WarehouseData[] => {
  return [...data].sort((a, b) => a.warehouse.localeCompare(b.warehouse));
};

const calculateMaxValue = (data: WarehouseData[], weeks: string[]): number => {
  const maxValue = Math.max(...data.flatMap(entry => 
    weeks.map(week => (typeof entry[week] === 'number' ? entry[week] : 0) as number)
  ));
  return maxValue * 1.1;
};

const CustomBarLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (typeof x !== 'number' || typeof width !== 'number' || !value) return null;
  
  return (
    <text
      x={x + width / 2}
      y={y - 10}
      fill="#666"
      fontSize={12}
      textAnchor="middle"
    >
      {value}
    </text>
  );
};

const GroupedBarChart = ({ data, weeks, title }: GroupedBarChartProps) => {
  const sortedWeeks = sortWeeks(weeks);
  const sortedData = sortWarehouses(data);
  const maxValuePadded = calculateMaxValue(data, weeks);

  // Transform data to show each week as a separate bar
  const transformedData = sortedData.map(warehouse => {
    const weekData = sortedWeeks.map(week => ({
      week: `W${week.slice(1)}`,
      value: warehouse[week] || 0
    }));
    
    return {
      warehouse: warehouse.warehouse,
      weeks: weekData
    };
  }).map(item => ({
    name: item.warehouse,
    ...item.weeks.reduce((acc, curr, idx) => ({
      ...acc,
      [`W${idx + 1}`]: curr.value,
      [`weekLabel${idx + 1}`]: curr.week
    }), {})
  }));

  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <CardTitle className="text-darkgrey-krnd">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={transformedData}
              margin={{ top: 20, right: 10, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                interval={0}
                tick={{ fontSize: 12 }}
                dy={20}
              />
              <YAxis hide domain={[0, maxValuePadded]} />
              <Tooltip />
              {sortedWeeks.map((_, index) => (
                <Bar
                  key={`W${index + 1}`}
                  dataKey={`W${index + 1}`}
                  fill={COLORS[index % COLORS.length]}
                  barSize={20}
                >
                  <LabelList content={CustomBarLabel} />
                  <LabelList
                    dataKey={`weekLabel${index + 1}`}
                    position="bottom"
                    offset={10}
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