import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardTitle } from "@/components/ui/card"

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

export function PieChart({ data, title }: PieChartProps) {
  const chartData = [
    { name: 'Occupied', value: data.occupied, color: '#a9d18e' },
    { name: 'Empty', value: data.empty, color: '#e5e7eb' }
  ]
  
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

