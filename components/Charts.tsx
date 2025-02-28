import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer, YAxis, PieChart as RechartsChart, Pie, Cell, } from 'recharts';

interface WarehouseData {
  warehouse: string;
  [key: string]: string | number;
}

interface GroupedBarChartProps {
  data: WarehouseData[];
  weeks: string[];
  title: string;
}

export const GroupedBarChart = ({ data, weeks, title }: GroupedBarChartProps) => {
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
        <div className="h-[340px] -mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={transformedData}
              margin={{ top: 20, right: 10, left: 10, bottom: 40 }}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                interval={0}
                tick={{ fontSize: 12 }}
                dy={0}
              />
              <YAxis hide domain={[0, maxValuePadded]} />
              <Tooltip />
              {sortedWeeks.map((_, index) => (
                <Bar
                  key={`W${index + 1}`}
                  dataKey={`W${index + 1}`}
                  fill={COLORS[index % COLORS.length]}
                  barSize={18}
                >
                  <LabelList content={CustomBarLabel} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Table */}
        <div className="overflow-x-auto -mt-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left font-medium text-lightgrey-krnd"></th>
                {sortedData.map((warehouse) => (
                  <th key={warehouse.warehouse} className="py-2 px-4 text-right font-medium text-lightgrey-krnd">
                    {warehouse.warehouse}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedWeeks.map((week, index) => (
                <tr key={week} className="border-b">
                  <td className="py-1 px-4 text-left flex items-center gap-2">
                    <div 
                      className="w-4 h-4" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    W{week.slice(1)}
                  </td>
                  {sortedData.map((warehouse) => (
                    <td key={`${week}-${warehouse.warehouse}`} className="py-1 px-4 text-right">
                      {warehouse[week] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

interface PieChartProps {
    data: {
      occupied: number
      empty: number
    }
    title: string
  }
  
// Define the interface for the label props
interface CustomLabelProps {
cx: number
cy: number
midAngle: number
innerRadius: number
outerRadius: number
percent: number
index: number
}

export function PieChart({ data, title }: PieChartProps) {
const chartData = [
    { name: 'Occupied', value: data.occupied, color: '#a9d18e' },
    { name: 'Empty', value: data.empty, color: '#e5e7eb' }
]

const customLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomLabelProps) => {
const RADIAN = Math.PI / 180;
const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
const x = cx + radius * Math.cos(-midAngle * RADIAN);
const y = cy + radius * Math.sin(-midAngle * RADIAN);

return (
    <text 
    x={x} 
    y={y} 
    fill="#333"
    textAnchor="middle" 
    dominantBaseline="central"
    fontSize="14"
    fontWeight="bold"
    >
    {`${(percent * 100).toFixed(0)}%`}
    </text>
);
};

return (
    <Card className="bg-transparent shadow-none border-none">
    <CardContent>
        <div className="h-[200px]">
        <CardTitle className=''>{title}</CardTitle>
        <ResponsiveContainer width="100%" height="100%">
            <RechartsChart>
            <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={customLabel}
                outerRadius={80}
                dataKey="value"
            >
                {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Pie>
            <Tooltip 
                formatter={(value: number) => `${value.toLocaleString()} m²`}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                itemStyle={{ color: '#333' }}
            />
            </RechartsChart>
        </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4">
        {chartData.map((entry, index) => (
            <Card key={index} className="py-1 w-2/5" style={{ backgroundColor: entry.color }}>
            <CardContent className="p-0">
                <div className="text-center">
                <div className="text-gray-800">{entry.name}</div>
                <div className="font-bold text-gray-800">{entry.value.toLocaleString()} m²</div>
                </div>
            </CardContent>
            </Card>
        ))}
        </div>
    </CardContent>
    </Card>
)
}

interface SingleBarChartProps {
  data: Array<{
    week: string;
    occupied: number;
  }>;
  title: string;
  selectedWeeks: string[];
  maxCapacity?: number; // Added maxCapacity prop
}

export const SingleBarChart = ({ data, title, selectedWeeks, maxCapacity }: SingleBarChartProps) => {
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
  
