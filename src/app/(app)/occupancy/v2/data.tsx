'use client';

import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  CellContext
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect, useMemo, Fragment, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronDown } from "lucide-react";
import Loading from "@/components/ui/Loading";
import { PieChart } from "@/components/Charts";
import CopyTableAsImage from "@/components/CopyTable";

interface WeekData {
  occupied_sqm: number;
  occupied_vol: number;
  empty_sqm: number;
}

export interface OccupancyData {
  area: string;
  wh_type: string;
  section: string;
  total_sqm: number;
  [key: `W${number}`]: WeekData;
}

interface ApiResponse {
  success: boolean;
  data: OccupancyData[];
  metadata: {
    year: number;
    month: string;
    weeks: number[];
    total_records: number;
  };
}

const YEARS = [2023, 2024, 2025, 2026];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function OccupancyTable() {
  const [data, setData] = useState<OccupancyData[]>([]);
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState('Jan');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeks, setWeeks] = useState<number[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/occupancy/v2?year=${year}&month=${month}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const jsonData = await response.json() as ApiResponse;
        
        setData(jsonData.data);
        setWeeks(jsonData.metadata.weeks);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [year, month]);

  // Group data by wh_type
  const groupedData = useMemo(() => {
    const groups = new Map<string, OccupancyData[]>();
    
    data.forEach(row => {
      if (!groups.has(row.wh_type)) {
        groups.set(row.wh_type, []);
      }
      groups.get(row.wh_type)!.push(row);
    });
    
    return groups;
  }, [data]);

  // Calculate group totals
  const groupTotals = useMemo(() => {
    const totals = new Map<string, { [key: string]: number }>();
    
    groupedData.forEach((rows, whType) => {
      const groupTotal: { [key: string]: number } = {
        total_sqm: 0
      };
      
      weeks.forEach(week => {
        groupTotal[`W${week}`] = rows.reduce((sum, row) => {
          const weekData = row[`W${week}`];
          return sum + (weekData?.occupied_sqm || 0);
        }, 0);
      });
      
      groupTotal.total_sqm = rows.reduce((sum, row) => sum + row.total_sqm, 0);
      totals.set(whType, groupTotal);
    });
    
    return totals;
  }, [groupedData, weeks]);

  const toggleGroup = (whType: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(whType)) {
        next.delete(whType);
      } else {
        next.add(whType);
      }
      return next;
    });
  };

  const columns = useMemo<ColumnDef<OccupancyData>[]>(() => {
    const baseColumns: ColumnDef<OccupancyData>[] = [
      {
        id: "area",
        accessorFn: (row: OccupancyData) => row.area,
        header: "Area",
        size: 100,
        cell: ({ row }) => {
          const isFirstInArea = data.findIndex(r => r.area === row.original.area) === data.indexOf(row.original);
          return isFirstInArea ? row.original.area : '';
        },
      },
      {
        id: "wh_type",
        accessorFn: (row: OccupancyData) => row.wh_type,
        header: "WH Type",
        size: 100,
        cell: ({ row }) => {
          const isFirstInGroup = groupedData.get(row.original.wh_type)![0] === row.original;
          if (!isFirstInGroup) return null;
          
          const isCollapsed = collapsedGroups.has(row.original.wh_type);
          return (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleGroup(row.original.wh_type)}
                className="hover:text-green-krnd"
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {row.original.wh_type}
            </div>
          );
        },
      },
      {
        id: "section",
        accessorFn: (row: OccupancyData) => row.section,
        header: "Section",
        size: 150,
      },
      {
        id: "total_sqm",
        accessorFn: (row: OccupancyData) => row.total_sqm,
        header: "Total Sqm",
        size: 100,
        cell: (props: CellContext<OccupancyData, number>) => (
          <div className="text-right">
            {Number(props.getValue()).toFixed(0)}
          </div>
        ),
      },
    ];
  
    const weekColumns: ColumnDef<OccupancyData>[] = weeks.map(week => ({
      id: `W${week}`,
      header: `W${week}`,
      columns: [
        {
          id: `W${week}_occupied`,
          header: "Occupied",
          accessorFn: (row: OccupancyData) => row[`W${week}`]?.occupied_sqm ?? 0,
          cell: ({ getValue }: { getValue: () => number }) => (
            <div className="text-right">
              {Number(getValue()).toFixed(0)}
            </div>
          ),
        },
        {
          id: `W${week}_cbm`,
          header: "Cbm",
          accessorFn: (row: OccupancyData) => row[`W${week}`]?.occupied_vol ?? 0,
          cell: ({ getValue }: { getValue: () => number }) => (
            <div className="text-right">
              {Number(getValue()).toFixed(0)}
            </div>
          ),
        },
        {
          id: `W${week}_empty`,
          header: "Empty",
          accessorFn: (row: OccupancyData) => row[`W${week}`]?.empty_sqm ?? 0,
          cell: ({ getValue }: { getValue: () => number }) => (
            <div className="text-right">
              {Number(getValue()).toFixed(0)}
            </div>
          ),
        },
      ],
    }));
  
    return [...baseColumns, ...weekColumns];
  }, [weeks, groupedData, collapsedGroups, data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) {
    return (
      <Card className="p-6 text-center text-red-600">
        {error}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((monthName) => (
              <SelectItem key={monthName} value={monthName}>
                {monthName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <CopyTableAsImage
          tableRef={tableRef}
          className="ml-auto"
          filename={`warehouse-occupancy-${year}-${month}`}
          onCopySuccess={() => console.log("Table copied successfully")}
          onCopyError={(err) => console.error("Error copying table:", err)}
        />
      </div>
  
      <div className="w-full overflow-x-auto" ref={tableRef}>
        <Table>
          <TableHeader>
            {/* First header row with base columns and week numbers */}
            <TableRow>
              <TableHead colSpan={4} className="text-left bg-lightgreen-header">
                Warehouse Occupancy
              </TableHead>
              {weeks.map(week => (
                <TableHead 
                  key={`W${week}`} 
                  colSpan={3} 
                  className="text-center bg-lightgreen-header border-b-2 border-x-2 border-darkgreen-header w-60"
                >
                  {week}
                </TableHead>
              ))}
            </TableRow>
  
            {/* Second header row with column names */}
            <TableRow>
              <TableHead className="bg-lightgreen-header">Area</TableHead>
              <TableHead className="bg-lightgreen-header">WH Type</TableHead>
              <TableHead className="bg-lightgreen-header">Section</TableHead>
              <TableHead className="bg-lightgreen-header text-right">Total Sqm</TableHead>
              {weeks.map(week => (
                <Fragment key={`W${week}_subheaders`}>
                  <TableHead className="text-center border-l bg-lightgreen-header border-x-2 border-darkgreen-header">Occupied<br/>(sqm)</TableHead>
                  <TableHead className="text-center bg-lightgreen-header border-x-2 border-darkgreen-header">Occupied<br/>(cbm)</TableHead>
                  <TableHead className="text-center bg-lightgreen-header border-x-2 border-darkgreen-header">Empty<br/>(sqm)</TableHead>
                </Fragment>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  <Loading />
                </TableCell>
              </TableRow>
            ) : Array.from(groupedData.entries()).length ? (
              <>
                {Array.from(groupedData.entries()).map(([whType, rows]) => (
                  <Fragment key={whType}>
                    {collapsedGroups.has(whType) ? (
                      // Show summary row when collapsed
                      <TableRow className="h-4 py-0.5">
                        <TableCell>
                          {rows[0].area}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => toggleGroup(whType)}
                              className="hover:text-green-krnd"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            {whType}
                          </div>
                        </TableCell>
                        <TableCell className="italic text-sm">
                          ({rows.length} sections)
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          {groupTotals.get(whType)!.total_sqm.toFixed(0)}
                        </TableCell>
                        {weeks.map(week => (
                          <Fragment key={week}>
                            <TableCell className="text-right pr-4">
                              {(groupTotals.get(whType)![`W${week}`] || 0).toFixed(0)}
                            </TableCell>
                            <TableCell className="text-right pr-4">
                              {rows.reduce((sum, row) => sum + (row[`W${week}`]?.occupied_vol || 0), 0).toFixed(0)}
                            </TableCell>
                            <TableCell className="text-right pr-4">
                              {rows.reduce((sum, row) => sum + (row[`W${week}`]?.empty_sqm || 0), 0).toFixed(0)}
                            </TableCell>
                          </Fragment>
                        ))}
                      </TableRow>
                    ) : (
                      // Show all rows when expanded
                      rows.map((row, index) => (
                        <TableRow 
                          key={index}
                          className="h-4 py-0.5"
                        >
                          <TableCell>
                            {index === 0 || rows[index - 1].area !== row.area ? row.area : ''}
                          </TableCell>
                          <TableCell>
                            {index === 0 && (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => toggleGroup(whType)}
                                  className="hover:text-green-krnd"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                {whType}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{row.section}</TableCell>
                          <TableCell className="text-right pr-4">
                            {row.total_sqm.toFixed(0)}
                          </TableCell>
                          {weeks.map(week => (
                            <Fragment key={week}>
                              <TableCell className="text-right pr-4 border-x-2 border-darkgreen-header">
                                {(row[`W${week}`]?.occupied_sqm || 0).toFixed(0)}
                              </TableCell>
                              <TableCell className="text-right pr-4 border-x-2 border-darkgreen-header">
                                {(row[`W${week}`]?.occupied_vol || 0).toFixed(0)}
                              </TableCell>
                              <TableCell className="text-right pr-4 border-x-2 border-darkgreen-header">
                                {(row[`W${week}`]?.empty_sqm || 0).toFixed(0)}
                              </TableCell>
                            </Fragment>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </Fragment>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-4">
        <OccupancyCharts data={data} weeks={weeks} />
      </div>
    </div>
  );
}

interface OccupancyChartsProps {
  data: OccupancyData[];
  weeks: number[];
}

interface GroupedData {
  occupied: number;
  empty: number;
}

const OccupancyCharts = ({ data, weeks }: OccupancyChartsProps) => {
    const [selectedWeek, setSelectedWeek] = useState(weeks[0]?.toString());
  
    // Group by wh_type and section
    const getGroupedData = (): [string, GroupedData][] => {
      const grouped = new Map<string, GroupedData>();
  
      data.forEach((row: OccupancyData) => {
        const key = `${row.wh_type} - ${row.section}`;
        const weekKey = `W${selectedWeek}` as keyof OccupancyData;
        const weekData = row[weekKey] as WeekData | undefined;
  
        const existingData = grouped.get(key) || { occupied: 0, empty: 0 };
        grouped.set(key, {
          occupied: existingData.occupied + (weekData?.occupied_sqm || 0),
          empty: existingData.empty + (weekData?.empty_sqm || 0),
        });
      });
  
      return Array.from(grouped.entries()).slice(0, 7); // Limit to 7 charts
    };
  
    const chartsData = getGroupedData();
  
    return (
      <div className="mt-8 space-y-6">
        <div className="flex items-center gap-4">
          <span className="font-medium">Select Week:</span>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
              {weeks.map((week) => (
                <SelectItem key={week} value={week.toString()}>
                  {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {chartsData.map(([key, data]) => (
            <div key={key} className="col-span-1">
              <PieChart data={data} title={key} />
            </div>
          ))}
        </div>
      </div>
    );
};
  

