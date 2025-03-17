'use client'

import { useState, useMemo, useCallback } from "react"
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
import { Button } from "./ui/button"
import FileUploadDialog from './FileUploadDialog';
import { AddUsersDialog } from "./AddDialog"
import { Upload, UserPlus, Download, Trash } from "lucide-react"
import { DataTableFilter } from "./DataTableFilter"
import { FilterConfig } from "./types"
import { Input } from "./ui/input"
import ConfirmDialog from "./ui/ConfirmDialog"

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
  const [sorting, setSorting] = useState<SortingState>([])

  const enhancedColumns = useMemo(
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
    <div className="flex flex-col h-[calc(100vh-230px)]"> {/* Container with fixed height */}
      <div className="rounded-md border flex-grow overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-white hover:bg-white">
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
    </div>
  )
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onRefresh?: () => void
    filters?: FilterConfig[] // Make filters optional
    showUpload?: boolean // Optional prop to control upload button visibility
    isInbound?: boolean
    onBatchDelete?: (ids: string[]) => Promise<void> // Add this prop for batch delete
}
  
export function DataTable<TData, TValue>({
columns,
data,
onRefresh,
filters = [], // Default to empty array if not provided
showUpload = true, // Default to true to maintain backward compatibility
isInbound,
onBatchDelete
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);

  const enhancedColumns = useMemo(
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
      onRowSelectionChange: setRowSelection,
      state: {
      sorting,
      columnFilters,
      rowSelection,
      },
      meta: {
      onRefresh
      }
  });

  // Add this to handle batch delete
  const handleBatchDelete = async () => {
    try {
      // Get selected row IDs
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      // Use type assertion or optional chaining to safely access the id
      const selectedIds = selectedRows.map(row => (row.original as any).no);
      
      // Call the onBatchDelete function if provided
      if (onBatchDelete && selectedIds.length > 0) {
        await onBatchDelete(selectedIds);
        // Reset selection after deletion
        setRowSelection({});
        // Refresh the table
        if (onRefresh) onRefresh();
      }
      
      setShowBatchDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete records:", error);
    }
  };

  const resetFiltersAndSorting = () => {
      setSorting([]);
      setColumnFilters([]);
      table.resetSorting();
      table.resetColumnFilters();
  };

  const exportToCSV = () => {
    // Get the filtered rows
    const filteredRows = table.getFilteredRowModel().rows;
    
    // Define the CSV headers according to the specified format
    const inboundHeaders = [
      "NO", "WH NAME", "AREA", "INBOUND DATE", "GATE IN", "INBOUND DOC TYPE", 
      "INBOUND DOC", "RECEIVING DOC", "CUSTOMER NAME", "SHIPPER NAME", "BL/DO", 
      "AJU NO", "TRUCK TYPE", "PLAT NO", "CONTAINER NO", "SEAL NO", "ITEM CODE", 
      "ITEM NAME", "QTY", "UOM", "NETT WEIGHT", "GROSS WEIGHT", "VOLUME", "BATCH", 
      "NPE NO", "NPE DATE", "PEB NO", "PEB DATE", "REMARK", "DOCK NO", "DOC. STATUS", 
      "USER ADMIN", "START TALLY", "FINISH TALLY", "USER TALLY", "START PUTAWAY", 
      "FINISH PUTAWAY", "USER PUTAWAY", "ID", "YEAR", "MONTH", "WEEK NO", "WEEK IN MONTH",
      "LEADTIME UNLOAD", "LEADTIME PUTAWAY"
    ];
    
    const outboundHeaders = [
      "NO", "WH NAME", "AREA", "OUTBOUND DATE", "OUTBOUND TIME", "LOADING DATE", "OUTBOUND DOC TYPE", 
      "OUTBOUND DOC", "PICKING DOC", "LOADING DOC", "CUSTOMER NAME", "SHIPPER NAME", 
      "ITEM CODE", "ITEM NAME", "DOC QTY", "QTY", "UOM", "NETT WEIGHT", "GROSS WEIGHT", "VOLUME", "BATCH",
      "BL DO", "AJU NO", "TRUCK TYPE", "TRUCK NO", "CONTAINER NO", "SEAL NO", "VESSEL NAME",
      "VOYAGE NO", "DESTINATION", "RECIPIENT", "SHIPPING NOTES", "REMARK", "DOC STATUS", 
      "USER ADMIN", "START PICKING", "FINISH PICKING", "USER PICKING", "START LOADING", 
      "FINISH LOADING", "USER LOADING", "ID", "YEAR", "MONTH", "WEEK NO", "WEEK IN MONTH",
      "LEADTIME PICKING", "LEADTIME LOAD"
    ];
    
    // Use the appropriate headers based on isInbound flag
    const headers = isInbound ? inboundHeaders : outboundHeaders;
    
    // Map header names to data keys
    const inboundHeaderToKeyMap = {
      "NO": "no",
      "WH NAME": "wh_name",
      "AREA": "area",
      "INBOUND DATE": "inbound_date",
      "GATE IN": "gate_in",
      "INBOUND DOC TYPE": "inbound_doc_type",
      "INBOUND DOC": "inbound_doc",
      "RECEIVING DOC": "receiving_doc",
      "CUSTOMER NAME": "customer_name",
      "SHIPPER NAME": "shipper_name",
      "BL/DO": "bl_do",
      "AJU NO": "aju_no",
      "TRUCK TYPE": "truck_type",
      "PLAT NO": "plat_no",
      "CONTAINER NO": "container_no",
      "SEAL NO": "seal_no",
      "ITEM CODE": "item_code",
      "ITEM NAME": "item_name",
      "QTY": "qty",
      "UOM": "uom",
      "NETT WEIGHT": "nett_weight",
      "GROSS WEIGHT": "gross_weight",
      "VOLUME": "volume",
      "BATCH": "batch",
      "NPE NO": "npe_no",
      "NPE DATE": "npe_date",
      "PEB NO": "peb_no",
      "PEB DATE": "peb_date",
      "REMARK": "remark",
      "DOCK NO": "dock_no",
      "DOC. STATUS": "doc_status",
      "USER ADMIN": "user_admin",
      "START TALLY": "start_tally",
      "FINISH TALLY": "finish_tally",
      "USER TALLY": "user_tally",
      "START PUTAWAY": "start_putaway",
      "FINISH PUTAWAY": "finish_putaway",
      "USER PUTAWAY": "user_putaway",
      "ID": "id",
      "YEAR": "year",
      "MONTH": "month",
      "WEEK NO": "week_no",
      "WEEK IN MONTH": "week_in_month",
      "LEADTIME UNLOAD": "leadtime_unload",
      "LEADTIME PUTAWAY": "leadtime_putaway"
    };
    
    const outboundHeaderToKeyMap = {
      "NO": "no",
      "WH NAME": "wh_name",
      "AREA": "area",
      "OUTBOUND DATE": "outbound_date",
      "OUTBOUND TIME": "outbound_time",
      "LOADING DATE": "loading_date",
      "OUTBOUND DOC TYPE": "outbound_doc_type",
      "OUTBOUND DOC": "outbound_doc",
      "PICKING DOC": "picking_doc",
      "LOADING DOC": "loading_doc",
      "CUSTOMER NAME": "customer_name",
      "SHIPPER NAME": "shipper_name",
      "ITEM CODE": "item_code",
      "ITEM NAME": "item_name",
      "DOC QTY": "doc_qty",
      "QTY": "qty",
      "UOM": "uom",
      "NETT WEIGHT": "nett_weight",
      "GROSS WEIGHT": "gross_weight",
      "VOLUME": "volume",
      "BATCH": "batch",
      "BL DO": "bl_do",
      "AJU NO": "aju_no",
      "TRUCK TYPE": "truck_type",
      "TRUCK NO": "truck_no",
      "CONTAINER NO": "container_no",
      "SEAL NO": "seal_no",
      "VESSEL NAME": "vessel_name",
      "VOYAGE NO": "voyage_no",
      "DESTINATION": "destination",
      "RECIPIENT": "recipient",
      "SHIPPING NOTES": "shipping_notes",
      "REMARK": "remark",
      "DOC STATUS": "doc_status",
      "USER ADMIN": "user_admin",
      "START PICKING": "start_picking",
      "FINISH PICKING": "finish_picking",
      "USER PICKING": "user_picking",
      "START LOADING": "start_loading",
      "FINISH LOADING": "finish_loading",
      "USER LOADING": "user_loading",
      "ID": "id",
      "YEAR": "year",
      "MONTH": "month",
      "WEEK NO": "week_no",
      "WEEK IN MONTH": "week_in_month",
      "LEADTIME PICKING": "leadtime_picking",
      "LEADTIME LOAD": "leadtime_load"
    };
    
    // Use the appropriate mapping based on isInbound flag
    const headerToKeyMap = isInbound ? inboundHeaderToKeyMap : outboundHeaderToKeyMap;
    
    // Format dates for CSV
    const formatDate = (date: Date | null | undefined) => {
      if (!date) return "";
      if (typeof date === "string") date = new Date(date);
      
      if (date instanceof Date && !isNaN(date.getTime())) {
        if (isInbound) {
          // DD-Mmm-YYYY format for inbound (e.g., 01-Dec-2024)
          const day = date.getDate().toString().padStart(2, '0');
          const month = date.toLocaleString('en-US', { month: 'short' });
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        } else {
          // DD Mmm YY format for outbound (e.g., 01 Dec 24)
          const day = date.getDate().toString().padStart(2, '0');
          const month = date.toLocaleString('en-US', { month: 'short' });
          const year = date.getFullYear().toString().slice(-2);
          return `${day} ${month} ${year}`;
        }
      }
      return "";
    };

    const formatTime = (time: string | Date | null | undefined) => {
      if (!time) return "";
      
      // Handle Date objects
      if (time instanceof Date) {
        return !isNaN(time.getTime())
          ? time.toTimeString().split(' ')[0] // HH:MM:SS format
          : "";
      }
      
      // Handle strings
      if (typeof time === "string") {
        // If already in HH:MM:SS format, return as is
        if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
          return time;
        }
        
        // Try to parse as Date
        const date = new Date(time);
        if (!isNaN(date.getTime())) {
          return date.toTimeString().split(' ')[0]; // HH:MM:SS format
        }
        
        // Try to parse as seconds
        const seconds = Number(time);
        if (!isNaN(seconds)) {
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          const secs = Math.floor(seconds % 60);
          
          return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
          ].join(':');
        }
      }
      
      return "";
    };
    
    // Format datetime for CSV
    const formatDateTime = (datetime: string | Date | null | undefined) => {
      if (!datetime) return "";
      if (typeof datetime === "string" && !datetime.includes("Invalid")) {
        try {
          const date = new Date(datetime);
          return date instanceof Date && !isNaN(date.getTime())
            ? date.toISOString().replace('T', ' ').split('.')[0] // YYYY-MM-DD HH:MM:SS format
            : datetime;
        } catch {
          return datetime;
        }
      }
      return datetime;
    };
    
    // Generate CSV rows from filtered data
    const csvData = filteredRows.map(row => {
      const rowData = row.original;
      return headers.map(header => {
        const key = headerToKeyMap[header as keyof typeof headerToKeyMap];
        if (!key) return "";
        
        const value = rowData[key as keyof typeof rowData];
        
        // Format based on field type
        if (isInbound) {
          if (key === "inbound_date" || key === "npe_date" || key === "peb_date" || key === "outbound_date" || key === "loading_date" ) {
            return formatDate(value as Date);
          } else if (key === "start_tally" || key === "finish_tally" || 
                    key === "start_putaway" || key === "finish_putaway") {
            return formatDateTime(value as string);
          } else if (key === "gate_in" || key === "duration" || key === "elapsed_time") {
            return formatTime(value as string);
          }
        } else {
          if (key === "outbound_date" || key === "exp_date" || key === "inv_date") {
            return formatDate(value as Date);
          } else if (key === "start_picking" || key === "finish_picking" || 
                    key === "start_loading" || key === "finish_loading") {
            return formatDateTime(value as string);
          } else if (key === "gate_out" || key === "duration" || key === "elapsed_time") {
            return formatTime(value as string);
          }
        }
        
        // Return raw value
        return value !== null && value !== undefined ? String(value) : "";
      });
    });
    
    // Create CSV content with headers and data
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${isInbound ? 'inbound' : 'outbound'}-data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  //datatable
  return (
    <div className="flex flex-col h-[calc(100vh-130px)]"> {/* Adjust 80px based on your header/nav height */}
      <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
          {filters.length > 0 && (
              <DataTableFilter
              table={table}
              filters={filters}
              onReset={resetFiltersAndSorting}
              />
          )}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowBatchDeleteDialog(true)}
              variant="destructive"
              size="default"
              className="px-2"
              disabled={table.getFilteredSelectedRowModel().rows.length === 0}
            >
              <Trash />
            </Button>
            {showUpload && (
              <Button
                onClick={() => setShowUploadDialog(true)}
                variant="default"
                size="default"
                className="bg-green-krnd hover:bg-green-krnd-hover px-2"
              >
                <Upload className="mr-1" />
                Upload CSV
              </Button>          
            )}
            <Button
              onClick={exportToCSV}
              variant="default"
              size="default"
              className="bg-green-krnd hover:bg-green-krnd-hover px-2"
            >
              <Download className="mr-1" />
              Export CSV
            </Button>
          </div>
      </div>
  
      {/* Add Confirm Dialog for batch delete */}
      <ConfirmDialog
        open={showBatchDeleteDialog}
        onOpenChange={setShowBatchDeleteDialog}
        onContinue={handleBatchDelete}
        title="Delete Selected Records"
        description={`Are you sure you want to delete ${table.getFilteredSelectedRowModel().rows.length} selected records? This action is irreversible.`}
        cancelText="No, Cancel"
        continueText="Yes, Delete"
        variant="destructive"
      />
  
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
  
      {/* Table container with flex-grow to fill available space */}
      <div className="rounded-md border flex-grow overflow-auto">
          <Table>
          <TableHeader className="sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-lightgreen-header hover:bg-lightgreen-header">
                  {headerGroup.headers.map((header) => {
                  const isActions = header.id === "actions";
                  return (
                      <TableHead 
                          key={header.id}
                          className={`${
                          isActions 
                              ? "sticky right-0 bg-lightgreen-header" 
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
      
      {/* Pagination with fixed height */}
      <div className="grid grid-cols-2 py-4">
          <div className="flex items-center justify-start">
              <p>Returned rows: {table.getFilteredRowModel().rows.length}</p>
          </div>
          <div className="flex items-center justify-end space-x-2">
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
          <div className="relative w-auto">
              <Input
              type="number"
              value={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : 0;
                  if (value <= 0) {
                  // Go to first page if value <= 0
                  table.setPageIndex(0);
                  } else if (value > table.getPageCount()) {
                  // Go to last page if value > max
                  table.setPageIndex(table.getPageCount() - 1);
                  } else {
                  // Otherwise go to the specified page
                  table.setPageIndex(value - 1);
                  }
              }}
              className="text-center px-2"
              style={{
                  // Pure dynamic width based solely on content
                  width: `${String(table.getState().pagination.pageIndex + 1).length * 12 + 24}px`,
                  minWidth: "54px"
              }}
              min={1}
              max={table.getPageCount()}
              />
          </div>
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

interface UsersTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRefresh?: () => void
  filters?: FilterConfig[] // Make filters optional
  showAddUser?: boolean // Optional prop to control add user button visibility
  onBatchDelete?: (ids: string[]) => Promise<void> // Add this prop for batch delete
}

export function UsersTable<TData, TValue>({
columns,
data,
onRefresh,
filters = [], // Default to empty array if not provided
showAddUser = true, // Default to true to maintain backward compatibility
onBatchDelete,
}: UsersTableProps<TData, TValue>) {
const [sorting, setSorting] = useState<SortingState>([])
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
const [showAddUserDialog, setShowAddUserDialog] = useState(false);
const [rowSelection, setRowSelection] = useState({});
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);

// Define a safe onRefresh function that will never be undefined
const handleRefresh = useCallback(() => {
  if (onRefresh) {
    onRefresh();
  }
}, [onRefresh]);

const enhancedColumns = useMemo(
  () => columns.map(col => {
    if (col.id === 'actions') {
      return {
        ...col,
        meta: { ...col.meta, onRefresh: handleRefresh }
      };
    }
    return col;
  }),
  [columns, handleRefresh]
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
  onRowSelectionChange: setRowSelection,
  state: {
    sorting,
    columnFilters,
    rowSelection,
  },
  meta: {
    onRefresh: handleRefresh
  }
});

const handleBatchDelete = async () => {
  try {
    // Get selected row IDs
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    // Use type assertion or optional chaining to safely access the id
    const selectedIds = selectedRows.map(row => (row.original as any).id);
    
    // Call the onBatchDelete function if provided
    if (onBatchDelete && selectedIds.length > 0) {
      await onBatchDelete(selectedIds);
      // Reset selection after deletion
      setRowSelection({});
      // Refresh the table
      if (onRefresh) onRefresh();
    }
    
    setShowBatchDeleteDialog(false);
  } catch (error) {
    console.error("Failed to delete records:", error);
  }
};

const resetFiltersAndSorting = () => {
  setSorting([]);
  setColumnFilters([]);
  table.resetSorting();
  table.resetColumnFilters();
};

return (
  <div>
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">
        {filters.length > 0 && (
          <DataTableFilter
            table={table}
            filters={filters}
            onReset={resetFiltersAndSorting}
          />
        )}
      </div>
      <div className="flex space-x-2">
        <Button
          onClick={() => setShowBatchDeleteDialog(true)}
          variant="destructive"
          size="default"
          className="px-2"
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
        >
          <Trash />
        </Button>

        {showAddUser && (
          <Button
            onClick={() => setShowAddUserDialog(true)}
            variant="default"
            size="default"
            className="bg-green-krnd hover:bg-green-krnd-hover px-2 ml-4"
          >
            <UserPlus />
            Add User
          </Button>
        )}
      </div>
    </div>

    <ConfirmDialog
      open={showBatchDeleteDialog}
      onOpenChange={setShowBatchDeleteDialog}
      onContinue={handleBatchDelete}
      title="Delete Selected Records"
      description={`Are you sure you want to delete ${table.getFilteredSelectedRowModel().rows.length} selected records? This action is irreversible.`}
      cancelText="No, Cancel"
      continueText="Yes, Delete"
      variant="destructive"
    />

    {showAddUser && (
      <AddUsersDialog 
        isOpen={showAddUserDialog}
        onClose={() => setShowAddUserDialog(false)}
        onRefresh={handleRefresh}
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
        <div className="relative w-auto">
          <Input
            type="number"
            value={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : 0;
              if (value <= 0) {
                // Go to first page if value <= 0
                table.setPageIndex(0);
              } else if (value > table.getPageCount()) {
                // Go to last page if value > max
                table.setPageIndex(table.getPageCount() - 1);
              } else {
                // Otherwise go to the specified page
                table.setPageIndex(value - 1);
              }
            }}
            className="text-center px-2"
            style={{
              // Pure dynamic width based solely on content
              width: `${String(table.getState().pagination.pageIndex + 1).length * 12 + 24}px`,
              minWidth: "54px"
            }}
            min={1}
            max={table.getPageCount()}
          />
        </div>
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