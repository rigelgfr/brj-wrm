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

import { Button } from "./ui/button"
import { Input } from "@/components/ui/input"
import FileUploadDialog from './FileUploadDialog';
import { Upload } from "lucide-react"

// Define the filter configuration type
interface FilterConfig {
  id: string
  placeholder: string
  width?: string
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRefresh?: () => void
  filters?: FilterConfig[] // Make filters optional
  showUpload?: boolean // Optional prop to control upload button visibility
  isInbound?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRefresh,
  filters = [], // Default to empty array if not provided
  showUpload = true, // Default to true to maintain backward compatibility
  isInbound
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const enhancedColumns = React.useMemo(
    () => columns.map(col => {
      if (col.id === 'actions') {
        return {
          ...col,
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
    },
    meta: {
      onRefresh
    }
  });

  const resetFiltersAndSorting = () => {
    setSorting([]);
    setColumnFilters([]);
    table.resetSorting();
    table.resetColumnFilters();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        {filters.length > 0 && (
          <div className="flex space-x-2">
            {filters.map((filter) => (
              <Input
                key={filter.id}
                placeholder={filter.placeholder}
                value={(table.getColumn(filter.id)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(filter.id)?.setFilterValue(event.target.value)
                }
                className={filter.width ? filter.width : "w-1/6"}
              />
            ))}
            <Button
              onClick={resetFiltersAndSorting}
              variant="outline"
              size="default"
              className="text-darkgrey-krnd"
            >
              Reset
            </Button>
          </div>
        )}
        {showUpload && (
          <Button
            onClick={() => setShowUploadDialog(true)}
            variant="default"
            size="default"
            className="bg-green-krnd hover:bg-[#659c37] px-2"
          >
            <Upload />
            Upload CSV
          </Button>
        )}
      </div>

      {showUpload && (
        <FileUploadDialog 
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          onRefresh={onRefresh}
          title="Upload CSV"
          description={`Upload a CSV file containing ${isInbound ? 'inbound' : 'outbound'} data. Make sure it follows the required format.`}
          acceptedFileTypes=".csv"
          uploadEndpoint={isInbound ? "/api/inbound/upload" : "/api/outbound/upload"}
          fileTypeName="CSV file"
        />
      )}

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
      <div className="grid grid-cols-2">
         <div className="flex items-center justify-start py-4">
            <p>Returned rows: {table.getFilteredRowModel().rows.length}</p>
         </div>
         <div className="flex items-center justify-end space-x-2 py-4">
          <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={table.getState().pagination.pageIndex === 0}
            >
              First
          </Button>
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
          <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
            >
              Last
          </Button>
        </div>
      </div>
       
    </div>
  )
}