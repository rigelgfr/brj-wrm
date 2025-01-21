// Types for the API response
export interface DashboardData {
  data: MonthlyData[];
  currentMonth: CurrentMonthData;
  lastMonth: LastMonthData;
  occupancy: OccupancyData;
  latestInbounds: InboundRecord[];
  latestOutbounds: OutboundRecord[];
}

export interface MonthlyData {
  month: string;
  inboundTrucks: number;
  outboundTrucks: number;
  inboundVolume: number;
  outboundVolume: number;
}

export interface CurrentMonthData {
  inboundTrucks: number;
  outboundTrucks: number;
  inboundVolume: number;
  outboundVolume: number;
}

export interface LastMonthData {
  inboundTrucks: number;
  outboundTrucks: number;
  inboundVolume: number;
  outboundVolume: number;
}

export interface OccupancyData {
  sqm: OccupancyMetric;
  volume: OccupancyMetric;
}

export interface OccupancyMetric {
  period: {
    year: number;
    month: string;
    week: number;
  };
  data: OccupancyRecord[];
}

export interface OccupancyRecord {
  wh_type: string;
  status: string;
  space: number;
}

export interface InboundRecord {
  no: number;
  area: string;
  inbound_date: string;
  customer_name: string;
  volume: number;
}

export interface OutboundRecord {
  no: number;
  area: string;
  outbound_date: string;
  customer_name: string;
  volume: number;
}

// Props interfaces for components
export interface TruckDataCardProps {
  lastMonth: LastMonthData | undefined;
}

export interface VolumeDataCardProps {
  lastMonth: LastMonthData | undefined;
}

export interface TrendChartProps {
  data: MonthlyData[];
  isLoading: boolean;
  error: string | null;
  maxTrucks: number;
}

export interface VolumeTrendChartProps {
  data: MonthlyData[];
  isLoading: boolean;
  error: string | null;
  maxVolume: number;
}

export interface OccupancyDonutProps {
  occupancyData: OccupancyMetric;
  title: string;
}

export interface OccupancyVolumeChartProps {
  occupancyData: OccupancyMetric;
  title: string;
}

export interface LatestInboundTableProps {
  data: InboundRecord[];
}

export interface LatestOutboundTableProps {
  data: OutboundRecord[];
}

// New interfaces for grouped data
export interface GroupedData {
  [whType: string]: {
    Occupied: number;
    Empty: number;
  };
}

export interface VolumeAccumulator {
  [whType: string]: {
    name: string;
    total: number;
    occupied: number;
    empty: number;
  };
}

export interface ProcessedVolumeData {
  name: string;
  Occupied: number;
  Empty: number;
  percentage: string;
}