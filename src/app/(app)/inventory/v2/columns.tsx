// inventorycolumns.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { ColumnDef, ColumnFiltersState, PaginationState } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StickyNote, MoreHorizontal, Plus } from "lucide-react";
import { BasicTable } from "@/components/Tables";
import Loading from "@/components/ui/Loading";
import { Row, Table } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EditDialog } from "@/components/EditDialog";
import { AddOccupancy2Dialog } from "@/components/AddDialog";

// Type for the occupancy data
export type Occupancy = {
    year: number;
    month: string;
    week: string;
    wh_type: string;
    section: string;
    occupied_sqm: number;
    empty_sqm: number;
    occupied_vol: number;
}

// Add this interface after your Occupancy type
interface ActionCellProps {
  row: Row<Occupancy>;
  table: Table<Occupancy>;
}

const ActionCell = ({ row, table }: ActionCellProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleSubmit = async (data: Partial<Occupancy>) => {
    try {
      const { year, month, week, wh_type, section } = row.original;

      const response = await fetch('/api/inventory/update2', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
          month,
          week,
          wh_type,
          section,
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

  const editableColumns = ["occupied_sqm", "occupied_vol"];

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
        columns={occupancyColumns}
        editableColumns={editableColumns}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSubmit={handleSubmit}
        primaryKeyField="year"
      />
    </>
  );
};

// Add this to your table meta interface declaration
declare module '@tanstack/table-core' {
  interface TableMeta<TData> {
    onRefresh?: () => void;
  }
}

// Create columns
const createColumns = (): ColumnDef<Occupancy>[] => [
  {
    accessorKey: "year",
    header: () => <div className="text-left">Year</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue("year")}</div>,
    enableColumnFilter: true,
  },
  {
    accessorKey: "month",
    header: () => <div className="text-center">Month</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("month")}</div>,
    enableColumnFilter: true,
  },
  {
    accessorKey: "week",
    header: () => <div className="text-center">Week</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("week")}</div>,
    enableColumnFilter: true,
  },
  {
    accessorKey: "wh_type",
    header: () => <div className="text-left">WH Type</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue("wh_type")}</div>,
    enableColumnFilter: true,
  },
  {
    accessorKey: "section",
    header: () => <div className="text-center">Section</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("section")}</div>,
    enableColumnFilter: true,
  },
  {
    accessorKey: "occupied_sqm",
    header: () => <div className="text-right">Occupied (sqm)</div>,
    cell: ({ row }) => <div className="text-right">{row.getValue("occupied_sqm")}</div>,
  },
  {
    accessorKey: "empty_sqm",
    header: () => <div className="text-right">Empty (sqm)</div>,
    cell: ({ row }) => <div className="text-right">{row.getValue("empty_sqm")}</div>,
  },
  {
    accessorKey: "occupied_vol",
    header: () => <div className="text-right">Used CBM</div>,
    cell: ({ row }) => <div className="text-right">{row.getValue("occupied_vol")}</div>,
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
      />
    ),
  }
];

export const occupancyColumns = createColumns();

export function InventoryTable() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [data, setData] = useState<Occupancy[]>([]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 21,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/inventory/table2");
      const result = await response.json();
      setData(result.occupancy);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetFilters = () => {
    setFilters([]);
  };

  return (
    <div className="space-y-2">
      {/* Filters and Add Button Section */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Input
            placeholder="Year"
            value={(filters.find(f => f.id === "year")?.value as string) || ""}
            onChange={(e) => {
              const value = e.target.value;
              setFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "year");
                if (value) newFilters.push({ id: "year", value });
                return newFilters;
              });
            }}
            className="w-24"
          />
          <Input
            placeholder="Month"
            value={(filters.find(f => f.id === "month")?.value as string) || ""}
            onChange={(e) => {
              const value = e.target.value;
              setFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "month");
                if (value) newFilters.push({ id: "month", value });
                return newFilters;
              });
            }}
            className="w-32"
          />
          <Input
            placeholder="Week"
            value={(filters.find(f => f.id === "week")?.value as string) || ""}
            onChange={(e) => {
              const value = e.target.value;
              setFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "week");
                if (value) newFilters.push({ id: "week", value });
                return newFilters;
              });
            }}
            className="w-32"
          />
          <Input
            placeholder="WH Type"
            value={(filters.find(f => f.id === "wh_type")?.value as string) || ""}
            onChange={(e) => {
              const value = e.target.value;
              setFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "wh_type");
                if (value) newFilters.push({ id: "wh_type", value });
                return newFilters;
              });
            }}
            className="w-32"
          />
           <Input
            placeholder="Section"
            value={(filters.find(f => f.id === "section")?.value as string) || ""}
            onChange={(e) => {
              const value = e.target.value;
              setFilters(prev => {
                const newFilters = prev.filter(f => f.id !== "section");
                if (value) newFilters.push({ id: "section", value });
                return newFilters;
              });
            }}
            className="w-32"
          />
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
          onClick={() => setShowAddDialog(true)}
          variant="default"
          size="default"
          className="bg-green-krnd hover:bg-green-krnd-hover px-2"
        >
          <Plus className="h-4 w-4" />
          Add data
        </Button>
      </div>

      <AddOccupancy2Dialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onRefresh={fetchData}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <div className="w-full">
          <BasicTable 
            columns={occupancyColumns}
            data={data}
            onRefresh={fetchData}
            columnFilters={filters}
            onColumnFiltersChange={setFilters}
            pagination={pagination}
            onPaginationChange={setPagination}
            pageSize={21}
            stripe={7}
          />
        </div>
      )}

      {/* Pagination Controls */}
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
              className="bg-green-krnd text-white hover:bg-green-krnd-hover hover:text-white"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={pagination.pageIndex === Math.ceil(data.length / pagination.pageSize) - 1}
              className="bg-green-krnd text-white hover:bg-green-krnd-hover hover:text-white"
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: Math.ceil(data.length / prev.pageSize) - 1 }))}
              disabled={pagination.pageIndex === Math.ceil(data.length / pagination.pageSize) - 1}
            >
              Last
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}