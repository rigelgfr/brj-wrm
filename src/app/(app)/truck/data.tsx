import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  YAxis,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatLeadtime } from "../utils";

// Updated Types to match our new API response
interface LeadtimeAverage {
  truck_type: string;
  leadtime_put: number | null;
  leadtime_unload: number | null;
  leadtime_picking: number | null;
  leadtime_load: number | null;
}

interface TruckCount {
  truck_type: string;
  inbound: number;
  outbound: number;
  total_count: number;
}

interface ApiResponse {
  timeframe: {
    year: number;
    month: string | null;
    week: number | null;
  };
  truck_counts: TruckCount[];
  leadtime_averages: LeadtimeAverage[];
}

// New interface for the truck/by response
interface TruckByAreaResponse {
  timeframe: {
    year: number;
    month: string | null;
    week: number | null;
  };
  truck_counts_by_area: {
    area: string;
    truck_types: {
      truck_type: string;
      inbound: number;
      outbound: number;
      total: number;
    }[];
    leadtimes: {
      truck_type: string;
      leadtime_put: number | null;
      leadtime_unload: number | null;
      leadtime_picking: number | null;
      leadtime_load: number | null;
    }[];
    totals: {
      inbound: number;
      outbound: number;
      total: number;
    };
  }[];
  all_truck_types: string[];
}

// For backward compatibility with the existing components
interface TransformedTruckStats {
  total_count: number;
  inbound: {
    count: number;
    unload: { avg: number };
    putaway: { avg: number };
  };
  outbound: {
    count: number;
    picking: { avg: number };
    load: { avg: number };
  };
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

// Fixed list of truck types based on standardization function
const TRUCK_TYPES = [
  "Wing Box",
  "40ft",
  "20ft",
  "CDD",
  "CDE",
  "Tronton",
  "Box",
  "Motor",
  "Mobil",
  "Flatbed",
  "Fuso",
  "Unknown"
];

const weeks = [
  { value: "W1", label: "W1" },
  { value: "W2", label: "W2" },
  { value: "W3", label: "W3" },
  { value: "W4", label: "W4" },
  { value: "W5", label: "W5" }
];

// Updated data fetching hook to work with our new API
export const useTruckStats = (
  viewMode: string = "overall",
  periodMode: string = "yearly",
  selectedYear: string = new Date().getFullYear().toString(),
  selectedMonth: string | null = null,
  selectedWeek: string | null = null,
  selectedVehicleType: string | null = null
) => {
  const [data, setData] = useState<{ success: boolean, data: Record<string, TransformedTruckStats> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableVehicleTypes, setAvailableVehicleTypes] = useState<string[]>(TRUCK_TYPES);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Build the API URL based on parameters
        const apiUrl = viewMode === "overall" ? "/api/truck/overall" : "/api/truck/by";
        const params = new URLSearchParams();
        
        // Add the year parameter
        params.append("year", selectedYear);
        
        // Add month parameter if periodMode is monthly
        if ((periodMode === "monthly" || periodMode === "weekly") && selectedMonth) {
          params.append("month", new Date(2000, parseInt(selectedMonth) - 1, 1).toLocaleString('default', { month: 'long' }));
        }
        
        // Add week parameter if periodMode is weekly
        if (periodMode === "weekly" && selectedWeek) {
          params.append("week", selectedWeek);
        }
        
        // Add vehicle_type parameter if in by-vehicle mode and a specific type is selected
        if (viewMode === "by-vehicle" && selectedVehicleType) {
          params.append("vehicle_type", selectedVehicleType);
        }
        
        const fullUrl = `${apiUrl}?${params.toString()}`;
        console.log("Fetching from URL:", fullUrl);
        
        const response = await fetch(fullUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        if (viewMode === "overall") {
          // Handle the overall endpoint response
          const apiResult: ApiResponse = await response.json();
          console.log("Overall API Response:", apiResult);
          
          // Transform the API response to match the expected format in components
          const transformedData: Record<string, TransformedTruckStats> = {};
          
          apiResult.truck_counts.forEach(count => {
            // Find corresponding leadtime data
            const leadtime = apiResult.leadtime_averages.find(lt => lt.truck_type === count.truck_type);
            
            transformedData[count.truck_type] = {
              total_count: count.total_count,
              inbound: {
                count: count.inbound,
                unload: { avg: leadtime?.leadtime_unload || 0 },
                putaway: { avg: leadtime?.leadtime_put || 0 },
              },
              outbound: {
                count: count.outbound,
                picking: { avg: leadtime?.leadtime_picking || 0 },
                load: { avg: leadtime?.leadtime_load || 0 },
              },
            };
          });

          console.log("Transformed Data (Overall):", transformedData);
          setData({ success: true, data: transformedData });
        } else {
          // Handle the by-vehicle endpoint response
          const apiResult: TruckByAreaResponse = await response.json();
          console.log("By-Vehicle API Response:", apiResult);
          
          // Transform data for areas
          const transformedData: Record<string, TransformedTruckStats> = {};
          
          apiResult.truck_counts_by_area.forEach(areaData => {
            if (selectedVehicleType) {
              // Find the truck type data for this area and the selected vehicle type
              const truckTypeData = areaData.truck_types.find(
                type => type.truck_type === selectedVehicleType
              );
              
              // Find the leadtime data for this area and truck type
              const leadtimeData = areaData.leadtimes.find(
                lt => lt.truck_type === selectedVehicleType
              );
              
              if (truckTypeData) {
                transformedData[areaData.area] = {
                  total_count: truckTypeData.total,
                  inbound: {
                    count: truckTypeData.inbound,
                    unload: { avg: leadtimeData?.leadtime_unload || 0 },
                    putaway: { avg: leadtimeData?.leadtime_put || 0 },
                  },
                  outbound: {
                    count: truckTypeData.outbound,
                    picking: { avg: leadtimeData?.leadtime_picking || 0 },
                    load: { avg: leadtimeData?.leadtime_load || 0 },
                  },
                };
              }
            } else {
              // If no vehicle type selected, show total for each area
              transformedData[areaData.area] = {
                total_count: areaData.totals.total,
                inbound: {
                  count: areaData.totals.inbound,
                  unload: { avg: 0 }, // We don't have aggregated leadtimes for all types
                  putaway: { avg: 0 },
                },
                outbound: {
                  count: areaData.totals.outbound,
                  picking: { avg: 0 },
                  load: { avg: 0 },
                },
              };
            }
          });
          
          console.log("Transformed Data (By Vehicle):", transformedData);
          setData({ success: true, data: transformedData });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        console.error("Error fetching truck data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewMode, periodMode, selectedYear, selectedMonth, selectedWeek, selectedVehicleType]);

  return { data, loading, error, availableVehicleTypes };
};

// Bar Chart Component - No changes needed
const TruckCountChart = ({ 
  data, 
  loading 
}: { 
  data: Record<string, TransformedTruckStats>; 
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
              <YAxis 
                domain={[0, maxValuePadded]} 
                axisLine={false} 
                tickLine={false} 
                tick={false} 
                width={0}
              />
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

// Leadtime Table Component - No changes needed
const LeadtimeTable = ({ 
  data, 
  loading 
}: { 
  data: Record<string, TransformedTruckStats>; 
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
              <TableHead></TableHead>
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

// Main TruckDashboard component - updated to include weekly selection
export const TruckDashboard = () => {
  const [viewMode, setViewMode] = useState<string>("overall");
  const [periodMode, setPeriodMode] = useState<string>("yearly");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [selectedWeek, setSelectedWeek] = useState<string>("W1");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);
  
  // Use the updated hook with all filter parameters including week
  const { data, loading, error, availableVehicleTypes } = useTruckStats(
    viewMode,
    periodMode,
    selectedYear,
    periodMode === "monthly" || periodMode === "weekly" ? selectedMonth : null,
    periodMode === "weekly" ? selectedWeek : null,
    selectedVehicleType
  );
  
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-red-500">Error loading truck data: {error}</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-start gap-2 flex-wrap">
        <Select
          value={viewMode}
          onValueChange={(value) => {
            setViewMode(value);
            // Reset vehicle type when switching views
            setSelectedVehicleType(null);
          }}
        >
          <SelectTrigger className="w-[120px] bg-green-krnd text-white">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overall">Overall</SelectItem>
            <SelectItem value="by-vehicle">By Vehicle Type</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={periodMode} 
          onValueChange={(value) => {
            setPeriodMode(value);
            // Reset to default values when changing period mode
            if (value === "weekly") {
              setSelectedWeek("W1");
            }
          }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yearly">Yearly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 flex-wrap">
          {/* Year selector - shown for all combinations */}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025].map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Month selector - shown when periodMode is 'monthly' */}
          {(periodMode === "monthly" || periodMode === "weekly") &&  (
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <SelectItem key={month} value={month.toString()}>
                    {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {periodMode === "weekly" && (
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Week" />
              </SelectTrigger>
              <SelectContent>
                {weeks.map(week => (
                  <SelectItem key={week.value} value={week.value}>
                    {week.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Vehicle Type selector - shown when viewMode is 'by-vehicle' */}
          {viewMode === "by-vehicle" && (
            <Select 
              value={selectedVehicleType || "all_types"} 
              onValueChange={(value) => setSelectedVehicleType(value === "all_types" ? null : value)}
              disabled={loading}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Vehicle Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_types">All Types</SelectItem>
                {availableVehicleTypes.map(vehicleType => (
                  <SelectItem key={vehicleType} value={vehicleType}>
                    {vehicleType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {data && !loading ? (
        <>
          <TruckCountChart data={data.data} loading={loading} />
          <LeadtimeTable data={data.data} loading={loading} />
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
};