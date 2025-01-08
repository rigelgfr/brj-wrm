"use client"

import * as React from "react"
import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/Button"
import { Input } from "@/components/ui/input"
import FileUploadDialog from './FileUploadDialog';
import { BetweenHorizonalStart, Plus, Upload } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRefresh?: () => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRefresh
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Enhance columns with onRefresh
  const enhancedColumns = React.useMemo(
    () => columns.map(col => {
      if (col.id === 'actions') {
        return {
          ...col,
          // Pass onRefresh through meta to avoid type issues
          meta: { ...col.meta, onRefresh }
        };
      }
      return col;
    }),
    [columns, onRefresh]
  );

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    }
  });

  const resetFiltersAndSorting = () => {
    setSorting([]); // Reset sorting
    setColumnFilters([]); // Reset all column filters
    table.resetSorting(); // Optional: ensure table state is in sync
    table.resetColumnFilters(); // Optional: ensure table state is in sync
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex space-x-2">
          <Input
            placeholder="Filter warehouse..."
            value={(table.getColumn("area")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("area")?.setFilterValue(event.target.value)
            }
            className="w-1/6"
          />
          <Input
            placeholder="Filter customer..."
            value={(table.getColumn("customer_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("customer_name")?.setFilterValue(event.target.value)
            }
            className="w-1/6"
          />
          <Input
            placeholder="Filter shipper..."
            value={(table.getColumn("shipper_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("shipper_name")?.setFilterValue(event.target.value)
            }
            className="w-1/6"
          />
          <Input
            placeholder="Filter item..."
            value={(table.getColumn("item_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("item_name")?.setFilterValue(event.target.value)
            }
            className="w-1/6"
          />
          <Button
            onClick={resetFiltersAndSorting}
            variant="outline"
            size="default"
            className="text-darkgrey-krnd"
          >
            Reset
          </Button>
        </div>
        <Button
          onClick={() => setShowUploadDialog(true)}
          variant={"default"}
          size={"default"}
          className="bg-green-krnd hover:bg-[#659c37] px-2"
        >
          <Upload />
          Upload CSV
        </Button>
      </div>

      <FileUploadDialog 
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onRefresh={onRefresh}
      />

       
      <div className="rounded-md border h-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isActions = header.id === "actions";
                  return (
                    <TableHead 
                        key={header.id}
                        className={`${
                          isActions 
                            ? "sticky right-0 bg-white drop-shadow-lg" 
                            : ""
                        }`}
                      >
                        {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isActions = cell.column.id === "actions";
                    return (
                      <TableCell 
                        key={cell.id}
                        className={`${
                          isActions 
                            ? "sticky right-0 bg-white drop-shadow-lg" 
                            : ""
                        }`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="bg-green-krnd text-white"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="bg-green-krnd text-white"
        >
          Next
        </Button>
      </div>
    </div>
    
  )
}
