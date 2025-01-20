// inventorycolumns.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { ColumnDef, ColumnFiltersState, PaginationState, Row, Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StickyNote, MoreHorizontal, Plus } from "lucide-react";
import { BasicTable } from "@/components/BasicTable";
import AddOccupancyDialog from '@/components/AddOccupancyDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EditDialog from "@/components/EditDialog";
import Loading from "@/components/ui/Loading";

// Types remain the same
export type OccupancySqm = {
  year: number;
  month: string;
  week: string;
  wh_type: string;
  status: string;
  space: number;
};

export type OccupancyVol = {
  year: number;
  month: string;
  week: string;
  wh_type: string;
  status: string;
  space: number;
};

// Meta type for columns
interface ColumnMetaType {
  onRefresh?: () => void;
}

type ColumnDefWithMeta<T> = ColumnDef<T> & {
  meta?: ColumnMetaType;
};

interface ActionCellProps {
  row: Row<OccupancySqm | OccupancyVol>;
  table: Table<OccupancySqm | OccupancyVol>;
  tableType: 'sqm' | 'vol';
  unit: string;
}

const ActionCell = ({ row, table, tableType, unit }: ActionCellProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleSubmit = async (data: Partial<OccupancySqm | OccupancyVol>) => {
    try {
      const { year, month, week, wh_type, status } = row.original;

      const response = await fetch('/api/inventory/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableType,
          year,
          month,
          week,
          wh_type,
          status,
          ...data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      setShowEditDialog(false);

      if (table.options.meta?.onRefresh) {
        table.options.meta.onRefresh();
      }

    } catch (error) {
      console.error('Failed to update:', error);
      throw error;
    }
  };

  const editableColumns = ["space"];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)} className="hover:bg-gray-200">
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditDialog
        row={row.original}
        columns={createColumns(unit, tableType)}
        editableColumns={editableColumns}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSubmit={handleSubmit}
        primaryKeyField="year"
      />
    </>
  );
};

// Update the table meta interface
declare module '@tanstack/table-core' {
  interface TableMeta<TData> {
    onRefresh?: () => void;
  }
}

// Create columns with enableColumnFilter
const createColumns = (
  unit: string, 
  tableType: 'sqm' | 'vol',
  onRefresh?: () => void
): ColumnDef<OccupancySqm | OccupancyVol>[] => [
  {
    accessorKey: "year",
    header: "Year",
    cell: ({ row }) => <div className="text-center">{row.getValue("year")}</div>,
    enableColumnFilter: true,
    filterFn: (row: { getValue: (columnId: string) => any}, id: string, filterValue: any) => {
      const year = row.getValue(id).toString();
      const search = filterValue.toString();
      return year.includes(search);
    },
  },
  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => <div className="text-center">{row.getValue("month")}</div>,
    enableColumnFilter: true,
  },
  {
    accessorKey: "week",
    header: "Week",
    cell: ({ row }) => <div className="text-center">{row.getValue("week")}</div>,
    enableColumnFilter: true,
  },
  {
    accessorKey: "wh_type",
    header: "WH Type",
    cell: ({ row }) => <div className="text-left">{row.getValue("wh_type")}</div>,
    enableColumnFilter: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <div className="text-center">{row.getValue("status")}</div>,
    enableColumnFilter: true,
  },
  {
    accessorKey: "space",
    header: `Space (${unit})`,
    cell: ({ row }) => <div className="text-right">{row.getValue("space")}</div>,
  },
  {
    id: "actions",
    header: () => (
      <div className="flex items-center">
        <StickyNote className="h-4 w-4 mx-auto" />
      </div>
    ),
    cell: ({ row, table }) => (
      <ActionCell 
        row={row}
        table={table}
        tableType={tableType}
        unit={unit}
      />
    ),
  }
];

export const occupancySqmColumns = createColumns("m²", 'sqm');
export const occupancyVolColumns = createColumns("m³", 'vol');

export function InventoryTables() {
  const [showAddRowDialog, setShowAddRowDialog] = useState(false);
  const [sqmData, setSqmData] = useState<OccupancySqm[]>([]);
  const [volData, setVolData] = useState<OccupancyVol[]>([]);
  const [sqmFilters, setSqmFilters] = useState<ColumnFiltersState>([]);
  const [volFilters, setVolFilters] = useState<ColumnFiltersState>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 20,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    console.log('Loading started'); // Add this debug log

    try {
      const response = await fetch("/api/inventory/table");
      const data = await response.json();
      setSqmData(data.occupancySqm);
      setVolData(data.occupancyVol);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    } finally {
      setIsLoading(false)    
    }
  }, []);

   // Simple refresh handler
   const handleRefresh = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetFilters = () => {
    setSqmFilters([]);
    setVolFilters([]);
  };

  return (
    <div className="space-y-2">
      {/* Filters and Upload Section */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
        <Input
            placeholder="Year"
            value={(sqmFilters.find(f => f.id === "year")?.value as number) || ""}
            onChange={(e) => {
              const value = e.target.value;
              
              setSqmFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "year");
                if (value) newFilters.push({ id: "year", value });
                return newFilters;
              });

              setVolFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "year");
                if (value) newFilters.push({ id: "year", value });
                return newFilters;
              });
            }}
            className="w-24"
          />
          <Input
            placeholder="Month"
            value={(sqmFilters.find(f => f.id === "month")?.value as string) || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSqmFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "month");
                if (value) newFilters.push({ id: "month", value });
                return newFilters;
              });
              setVolFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "month");
                if (value) newFilters.push({ id: "month", value });
                return newFilters;
              });
            }}
            className="w-32"
          />
          <Input
            placeholder="Week"
            value={(sqmFilters.find(f => f.id === "week")?.value as string) || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSqmFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "week");
                if (value) newFilters.push({ id: "week", value });
                return newFilters;
              });
              setVolFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "week");
                if (value) newFilters.push({ id: "week", value });
                return newFilters;
              });
            }}
            className="w-32"
          />
          <Input
            placeholder="WH Type"
            value={(sqmFilters.find(f => f.id === "wh_type")?.value as string) || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSqmFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "wh_type");
                if (value) newFilters.push({ id: "wh_type", value });
                return newFilters;
              });
              setVolFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "wh_type");
                if (value) newFilters.push({ id: "wh_type", value });
                return newFilters;
              });
            }}
            className="w-32"
          />
          <Input
            placeholder="Status"
            value={(sqmFilters.find(f => f.id === "status")?.value as string) || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSqmFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "status");
                if (value) newFilters.push({ id: "status", value });
                return newFilters;
              });
              setVolFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "status");
                if (value) newFilters.push({ id: "status", value });
                return newFilters;
              });
            }}
            className="w-32"
          />
          {/* Similar pattern for week, wh_type, and status inputs */}
          <Button
            onClick={resetFilters}
            variant="outline"
            size="default"
            className="text-darkgrey-krnd"
          >
            Reset
          </Button>
        </div>
        <Button
          onClick={() => setShowAddRowDialog(true)}
          variant="default"
          size="default"
          className="bg-green-krnd hover:bg-[#659c37] px-2"
        >
          <Plus className="h-4 w-4" />
          Add data
        </Button>
      </div>

      <AddOccupancyDialog 
        isOpen={showAddRowDialog}
        onClose={() => setShowAddRowDialog(false)}
        onRefresh={fetchData}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <div className="flex flex-row space-x-4 w-full">
        <div className="w-1/2 flex flex-col">
          <h2 className="text-md font-semibold mb-2">SQM Occupancy</h2>
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <BasicTable 
                columns={occupancySqmColumns}
                data={sqmData}
                onRefresh={handleRefresh}
                columnFilters={sqmFilters}
                onColumnFiltersChange={setSqmFilters}
                pagination={pagination}
                onPaginationChange={setPagination}
                pageSize={20}
              />
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col">
          <h2 className="text-md font-semibold mb-2">Volume Occupancy</h2>
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <BasicTable 
                columns={occupancyVolColumns}
                data={volData}
                onRefresh={handleRefresh}
                columnFilters={volFilters}
                onColumnFiltersChange={setVolFilters}
                pagination={pagination}
                onPaginationChange={setPagination}
                pageSize={20}
              />
            </div>
          </div>
        </div>
        </div>
      )}

      <div className="w-full mt-4 border-t pt-4">
        <div className="flex items-center justify-end px-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: 0 }))}
              disabled={pagination.pageIndex === 0}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
              disabled={pagination.pageIndex === 0}
              className="bg-green-krnd text-white"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={pagination.pageIndex === Math.ceil(Math.max(sqmData.length, volData.length) / pagination.pageSize) - 1}
              className="bg-green-krnd text-white"
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: Math.ceil(Math.max(sqmData.length, volData.length) / prev.pageSize) - 1 }))}
              disabled={pagination.pageIndex === Math.ceil(Math.max(sqmData.length, volData.length) / pagination.pageSize) - 1}
            >
              Last
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}