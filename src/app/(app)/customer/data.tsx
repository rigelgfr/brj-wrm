'use client';

import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  Row,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect, useMemo, Fragment, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronDown } from "lucide-react";
import Loading from "@/components/ui/Loading";
import CopyTableAsImage from "@/components/CopyTable";

export interface WarehouseData {
  wh_type: string;
  customer_name: string;
  [key: string]: string | number | boolean;
  grandTotal: number;
  isFirstInGroup: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = [2023, 2024, 2025, 2026];

export function TrendTable() {
  const [data, setData] = useState<WarehouseData[]>([]);
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState('October');
  const [dataType, setDataType] = useState<'inbound' | 'outbound'>('inbound');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekColumns, setWeekColumns] = useState<string[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [prevMonths, setPrevMonths] = useState<string[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/customer/${dataType}?year=${year}&month=${month}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const { data: newData, prevMonths: months } = await response.json();
        
        if (newData.length > 0) {
          setPrevMonths(months);
          const weekKeys = Object.keys(newData[0])
            .filter(key => key.startsWith('W'))
            .sort((a, b) => {
              const numA = parseInt(a.slice(1));
              const numB = parseInt(b.slice(1));
              return numA - numB;
            });
          setWeekColumns(weekKeys);
        }
        console.log('Fetched data:', newData);
        setData(newData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [year, month, dataType]);

  // Calculate totals for the summary row
  const summaryRow = useMemo(() => {
    if (!data.length) return null;

    const totals: { [key: string]: number } = {
      grandTotal: 0
    };

    // Initialize all columns with 0
    [...prevMonths, ...weekColumns].forEach(col => {
      totals[col] = 0;
    });

    // Sum up all values
    data.forEach(row => {
      // Sum previous months
      prevMonths.forEach(month => {
        totals[month] += Number(row[month]) || 0;
      });

      // Sum weeks
      weekColumns.forEach(week => {
        totals[week] += Number(row[week]) || 0;
      });

      totals.grandTotal += row.grandTotal || 0;
    });

    return totals;
  }, [data, weekColumns, prevMonths]);

  // Group data by warehouse type
  const groupedData = useMemo(() => {
    const groups = new Map<string, WarehouseData[]>();
    let currentGroup: string | null = null;
    
    data.forEach(row => {
      if (row.wh_type) {
        currentGroup = row.wh_type;
      }
      if (currentGroup) {
        if (!groups.has(currentGroup)) {
          groups.set(currentGroup, []);
        }
        groups.get(currentGroup)!.push(row);
      }
    });
    
    return groups;
  }, [data]);

  // Calculate group totals
  const groupTotals = useMemo(() => {
    const totals = new Map<string, { [key: string]: number }>();
    
    groupedData.forEach((rows, whType) => {
      const groupTotal: { [key: string]: number } = {
        grandTotal: 0
      };
      
      [...prevMonths, ...weekColumns].forEach(col => {
        groupTotal[col] = rows.reduce((sum, row) => sum + (Number(row[col]) || 0), 0);
      });
      
      groupTotal.grandTotal = rows.reduce((sum, row) => sum + (row.grandTotal || 0), 0);
      totals.set(whType, groupTotal);
    });
    
    return totals;
  }, [groupedData, weekColumns, prevMonths]);

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

  const columns = useMemo<ColumnDef<WarehouseData>[]>(() => {
    const baseColumns: ColumnDef<WarehouseData>[] = [
      {
        id: "wh_type",
        accessorFn: row => row.wh_type,
        header: "WH Type",
        size: 150,
        cell: ({ row }) => {
          if (!row.original.wh_type) return null;
          const isCollapsed = collapsedGroups.has(row.original.wh_type);
          return (
            <button 
              onClick={() => toggleGroup(row.original.wh_type)}
              className="flex items-center gap-2 hover:text-green-krnd"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {row.original.wh_type}
            </button>
          );
        },
      },
      {
        id: "customer_name",
        accessorFn: row => row.customer_name,
        header: "Consignee / Client",
        size: 300,
        cell: ({ row }) => (
          <div className="text-sm">
            {row.getValue("customer_name")}
          </div>
        ),
      },
    ];

    // Add previous months columns
    const prevMonthCols: ColumnDef<WarehouseData>[] = prevMonths.map(monthKey => ({
      id: monthKey,
      accessorFn: (row: WarehouseData) => row[monthKey],
      header: () => (
        <div className="text-right">
          {monthKey.substring(0, 3)}
        </div>
      ),
      size: 80,
      cell: ({ row }: { row: Row<WarehouseData> }) => (
        <div className="text-right">
          {Number(row.getValue(monthKey)).toFixed(1)}
        </div>
      ),
    }));

    return [
      ...baseColumns,
      ...prevMonthCols,
      ...weekColumns.map(weekKey => ({
        id: weekKey,
        accessorFn: (row: WarehouseData) => row[weekKey],
        header: () => `${weekKey.slice(1)}`,  // Convert 'WW1' to 'W1'
        size: 80,
        cell: ({ row }: { row: Row<WarehouseData> }) => (
          <div className="text-right">
            {Number(row.getValue(weekKey)).toFixed(1)}
          </div>
        ),
      })),
      {
        id: "grandTotal",
        accessorFn: row => row.grandTotal,
        header: "Grand Total",
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {Number(row.getValue("grandTotal")).toFixed(1)}
          </div>
        ),
      },
    ];
  }, [weekColumns, collapsedGroups, prevMonths]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: undefined,
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

        <Select value={dataType} onValueChange={(value: 'inbound' | 'outbound') => setDataType(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Data Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inbound">Inbound</SelectItem>
            <SelectItem value="outbound">Outbound</SelectItem>
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

      <div className="w-full" ref={tableRef}>
        <Table>
          <TableHeader>
            <TableRow className="bg-lightgreen-header hover:bg-lightgreen h-2 py-0">
              <TableHead colSpan={2} className="text-left h-2! py-0">
                {dataType === 'inbound' ? (
                  'Sum of Received CBM'
                ) : (
                  'Sum of Shipped CBM'
                )}
              </TableHead>
              {/* Blank cells for previous months */}
              {prevMonths.map(month => (
                <TableHead key={`group-${month}`} className="h-4 py-0"/>
              ))}
              {/* Week of Month spanning all week columns */}
              <TableHead colSpan={weekColumns.length} className="text-center h-4 py-0 ">
                Week of {month}
              </TableHead>
              {/* Blank cell for grand total */}
              <TableHead />
            </TableRow>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-t-0 h-4">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    style={{ width: header.getSize() }}
                    className={`h-2 py-0.5 ${header.id.includes('W') || header.id === 'grandTotal' ? 'text-right' : ''} bg-lightgreen-header`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
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
                        <TableRow>
                          <TableCell className="py-0.5">
                            <button 
                              onClick={() => toggleGroup(whType)}
                              className="flex items-center gap-2 hover:text-green-krnd"
                            >
                              <ChevronRight className="w-4 h-4" />
                              {whType}
                            </button>
                          </TableCell>
                          <TableCell className="py-0.5 italic text-sm">
                            Group Total ({rows.length} clients)
                          </TableCell>
                          {prevMonths.map(month => (
                            <TableCell key={month} className="py-0.5 text-right">
                              {groupTotals.get(whType)![month].toFixed(1)}
                            </TableCell>
                          ))}
                          {weekColumns.map(week => (
                            <TableCell key={week} className="py-0.5 text-right">
                              {groupTotals.get(whType)![week].toFixed(1)}
                            </TableCell>
                          ))}
                          <TableCell className="py-0.5 text-right font-medium">
                            {groupTotals.get(whType)!.grandTotal.toFixed(1)}
                          </TableCell>
                        </TableRow>
                    ) : (
                      // Show all rows when expanded
                      rows.map((row, index) => (
                        <TableRow 
                          key={index} 
                          className={index === 0 ? '' : 'border-l-[24px] border-l-transparent'}
                        >
                          {columns.map((col, colIndex) => (
                            <TableCell key={colIndex} className="py-0.5">
                              {colIndex === 0 && index === 0 ? (
                                <button 
                                  onClick={() => toggleGroup(whType)}
                                  className="flex items-center gap-2 hover:text-green-krnd"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                  {whType}
                                </button>
                              ) : colIndex === 1 ? (
                                <div className="text-sm">{row.customer_name}</div>
                              ) : colIndex === 0 ? null : (
                                <div className="text-right">
                                  {Number(row[col.id as keyof WarehouseData] || 0).toFixed(1)}
                                </div>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </Fragment>
                ))}
                {/* Grand Total Row */}
                {summaryRow && (
                  <TableRow className="text-darkgrey-krnd font-bold bg-lightgreen-header">
                    <TableCell className="py-0.5">Grand Total</TableCell>
                    <TableCell className="py-0.5"></TableCell>
                    {prevMonths.map(month => (
                      <TableCell key={month} className="py-0.5 text-right">
                        {summaryRow[month].toFixed(1)}
                      </TableCell>
                    ))}
                    {weekColumns.map(week => (
                      <TableCell key={week} className="py-0.5 text-right">
                        {summaryRow[week].toFixed(1)}
                      </TableCell>
                    ))}
                    <TableCell className="py-0.5 text-right">
                      {summaryRow.grandTotal.toFixed(1)}
                    </TableCell>
                  </TableRow>
                )}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-16 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}