import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Timer } from "lucide-react";
import Loading from "@/components/ui/Loading";

import { formatLeadtime } from "../utils";

// Types
interface TruckStats {
  total_count: number;
  inbound: {
    count: number;
    unload: { avg: number; min: number; max: number };
    putaway: { avg: number; min: number; max: number };
  };
  outbound: {
    count: number;
    picking: { avg: number; min: number; max: number };
    load: { avg: number; min: number; max: number };
  };
}

interface ApiResponse {
  success: boolean;
  data: Record<string, TruckStats>;
}

// Custom tooltip for the bar chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow border">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm">Inbound: {data.inbound}</p>
        <p className="text-sm">Outbound: {data.outbound}</p>
        <p className="text-sm font-medium">Total: {data.total}</p>
      </div>
    );
  }
  return null;
};

// Data fetching hook
export const useTruckStats = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/truck");
        const result: ApiResponse = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

// Bar Chart Component
export const TruckCountChart = ({ 
  data, 
  loading 
}: { 
  data: Record<string, TruckStats>; 
  loading: boolean;
}) => {
  if (loading) return <Loading />;

  const chartData = Object.entries(data).map(([type, stats]) => ({
    name: type,
    total: stats.total_count,
    inbound: stats.inbound.count,
    outbound: stats.outbound.count,
  }));

  // Calculate max value with 10% padding
  const maxValuePadded = Math.max(...chartData.map(entry => entry.total)) * 1.1;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Truck Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="#94d454">
                <LabelList
                  dataKey="total"
                  position="top"
                  className="text-xs"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Leadtime Table Component
export const LeadtimeTable = ({ 
  data, 
  loading 
}: { 
  data: Record<string, TruckStats>; 
  loading: boolean;
}) => {
  if (loading) return <Loading />;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Average Leadtimes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Truck Type</TableHead>
              <TableHead className="text-right">Unload</TableHead>
              <TableHead className="text-right">Putaway</TableHead>
              <TableHead className="text-right">Picking</TableHead>
              <TableHead className="text-right">Load</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(data).map(([type, stats]) => (
              <TableRow key={type}>
                <TableCell className="font-medium">{type}</TableCell>
                <TableCell className="text-right">
                  {formatLeadtime(stats.inbound.unload.avg)}
                </TableCell>
                <TableCell className="text-right">
                  {formatLeadtime(stats.inbound.putaway.avg)}
                </TableCell>
                <TableCell className="text-right">
                  {formatLeadtime(stats.outbound.picking.avg)}
                </TableCell>
                <TableCell className="text-right">
                  {formatLeadtime(stats.outbound.load.avg)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};