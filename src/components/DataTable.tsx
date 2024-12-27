"use client"

import * as React from "react"
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

import { Button } from "./ui/Button"
import { Input } from "@/components/ui/input"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const table = useReactTable({
    data,
    columns,
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
      <div className="flex mb-2">
        <Input
            placeholder="Filter warehouse..."
            value={(table.getColumn("area")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("area")?.setFilterValue(event.target.value)
            }
            className="w-1/6 mr-2"
          />
            <Input
            placeholder="Filter customer..."
            value={(table.getColumn("customer_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("customer_name")?.setFilterValue(event.target.value)
            }
            className="w-1/6 mr-2"
          />
            <Input
            placeholder="Filter shipper..."
            value={(table.getColumn("shipper_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("shipper_name")?.setFilterValue(event.target.value)
            }
            className="w-1/6 mr-2"
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
            size="sm"
            className="ml-auto bg-green-krnd text-white"
          >
            Reset
          </Button>
      </div>
       
      <div className="rounded-md border h-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
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
