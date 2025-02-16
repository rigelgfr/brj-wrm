// BasicTable.tsx
import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  PaginationState,
  getPaginationRowModel,
  OnChangeFn,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface BasicTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRefresh?: () => void
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  pageSize?: number
  stripe?: number
}

export function BasicTable<TData, TValue>({
  columns,
  data,
  onRefresh,
  columnFilters = [],
  onColumnFiltersChange,
  pagination,
  onPaginationChange,
  pageSize = 50,
  stripe = 5, // Default to alternating every row
}: BasicTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

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
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange,
    onPaginationChange,
    state: {
      sorting,
      columnFilters,
      pagination: pagination ?? {
        pageIndex: 0,
        pageSize: pageSize,
      },
    },
    meta: { onRefresh },
  });

  return (
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
                className={`${
                  Math.floor(row.index / stripe) % 2 === 0 
                    ? "bg-lightgreen-header"
                    : "bg-white"
                }`}
              >
                {row.getVisibleCells().map((cell) => {
                  const isActions = cell.column.id === "actions";
                  return (
                    <TableCell 
                      key={cell.id}
                      className={`${
                        isActions 
                          ? "sticky right-0 bg-inherit text-center" 
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
  )
}