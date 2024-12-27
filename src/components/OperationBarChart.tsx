import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OperationData {
  warehouse: string;
  value: number;
}

interface OperationBarChartProps {
  data: OperationData[];
  title: string;
  metricLabel: string;
  formatValue?: (value: number) => string;
}

const OperationBarChart = ({ 
  data, 
  title,
  metricLabel,
  formatValue = (value) => value.toString()
}: OperationBarChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-full">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="warehouse" 
                className="text-sm" 
              />
              <YAxis 
                className="text-sm"
                label={{ 
                  value: metricLabel, 
                  angle: -90, 
                  position: 'insideLeft' 
                }} 
              />
              <Tooltip 
                formatter={(value: number) => formatValue(value)}
              />
              <Bar 
                dataKey="value" 
                fill="#2563eb" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationBarChart;