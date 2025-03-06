// outbound/columns.tsx
"use client";
import { useState } from "react";

import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { MoreHorizontal, StickyNote, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditDialog } from "@/components/EditDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import { formatLeadtime } from "../utils";

// Define the shape of the outbound data
export type Outbound = {
  no: number;
  wh_name: string | null;
  area: string | null;
  outbound_date: Date | null;  // We’ll handle this as a string for formatting
  outbound_time: string | null;
  loading_date: Date | null;
  outbound_doc_type: string | null;
  outbound_doc: string | null;
  picking_doc: string | null;
  loading_doc: string | null;
  customer_name: string | null;
  shipper_name: string | null;
  item_code: string | null;
  item_name: string | null;
  doc_qty: number | null;
  qty: number | null;
  uom: string | null;
  nett_weight: number | null;
  gross_weight: number | null;
  volume: number | null;
  batch: string | null;
  bl_do: string | null;
  aju_no: string | null;
  truck_type: string | null;
  truck_no: string | null;
  container_no: string | null;
  seal_no: string | null;
  vessel_name: string | null;
  voyage_no: string | null;
  destination: string | null;
  recipient: string | null;
  shipping_notes: string | null;
  remark: string | null;
  doc_status: string | null;
  user_admin: string | null;
  start_picking: string | null;
  finish_picking: string | null;
  user_picking: string | null;
  start_loading: string | null;
  finish_loading: string | null;
  user_loading: string | null;
  id: string;
  year: number;
  month: string;
  week_no: string;
  week_in_month: string;
  leadtime_picking: number | null;
  leadtime_load: number | null;
};

// Define the meta type for columns
interface ColumnMetaType {
  onRefresh?: () => void;
}

// Add this type to extend the base ColumnDef type
type ColumnDefWithMeta<T> = ColumnDef<T> & {
  meta?: ColumnMetaType;
};

interface ActionCellProps {
  row: Row<Outbound>;
  table: Table<Outbound>;
}

const ActionCell = ({ row, table }: ActionCellProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleSubmit = async (data: Partial<Outbound>, identifier: string | Date | number | null) => {
    try {
      if (typeof identifier !== 'number') {
        throw new Error('Invalid identifier type');
      }

      const response = await fetch(`/api/outbound/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          no: identifier,
          ...data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      if (table.options.meta?.onRefresh) {
        table.options.meta.onRefresh();
      }

    } catch (error) {
      console.error('Failed to update:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/outbound/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          no: row.original.no
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete record');
      }

      setShowDeleteDialog(false);

      if (table.options.meta?.onRefresh) {
        table.options.meta.onRefresh();
      }

    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };
  
  // Specify which columns should be editable
  const editableColumns = [
      "area",
      "outbound_date",
      "outbound_time",
      "loading_date",
      "outbound_doc_type",
      "outbound_doc",
      "picking_doc",
      "loading_doc",
      "customer_name",
      "shipper_name",
      "item_code",
      "item_name",
      "doc_qty",
      "qty",
      "uom",
      "nett_weight",
      "gross_weight",
      "volume",
      "batch",
      "bl_do",
      "aju_no",
      "truck_type",
      "truck_no",
      "container_no",
      "seal_no",
      "vessel_name",
      "voyage_no",
      "destination",
      "recipient",
      "shipping_notes",
      "remark",
      "doc_status",
      "user_admin",
      "start_picking",
      "finish_picking",
      "user_picking",
      "start_loading",
      "finish_loading",
      "user_loading",
  ];

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
          <DropdownMenuItem 
            className="text-red-600 hover:bg-gray-200"
            onClick={() => setShowDeleteDialog(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditDialog
        row={row.original}
        columns={columns}
        editableColumns={editableColumns}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSubmit={handleSubmit}
        primaryKeyField="no"
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onContinue={handleDelete}
        title="Delete Record"
        description="Are you sure you want to delete this record? This action is irreversible."
        cancelText="No, Cancel"
        continueText="Yes, Delete"
        variant="destructive"
      />
    </>
  );
}

export const columns: ColumnDefWithMeta<Outbound>[] = [
    {
      accessorKey: "no",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-2"
          >
            No
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-center">{row.getValue("no")}</div>,
    },
    {
        accessorKey: "id",
        header: "ID",
    },
    {
      accessorKey: "area",
      header: "WH Type",
      cell: ({ row }) => <div className="text-center">{row.getValue("area")}</div>,
    },
    {
      accessorKey: "outbound_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Outbound Date
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("outbound_date")); // Assuming date is a timestamp or a string in a parsable format
        const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }); // Format date as desired
        return <div className="text-right">{formattedDate}</div>;
      },
    },
    {
      accessorKey: "outbound_time",
      header: "Outbound Time",
      cell: ({ row }) => {
        const timeValue = row.getValue("outbound_time"); // Expected to be a Date object or null
      
        if (!timeValue) {
          // Handle null or undefined values
          return <div>-</div>;
        }
      
        try {
          // Ensure the value is a Date object
          if (typeof timeValue === "string" || typeof timeValue === "number" || timeValue instanceof Date) {
            const dateObject = new Date(timeValue)

            if (isNaN(dateObject.getTime())) {
              return <div>Invalid time</div>
            }

          // Extract hh:mm using built-in methods
          const formattedTime = `${dateObject.getHours().toString().padStart(2, "0")}:${dateObject.getMinutes().toString().padStart(2, "0")}`;
          return <div className="text-right">{formattedTime}</div>;
          }

          return <div>Invalid Time</div>;
        } catch {
          // Handle invalid Date cases
          return <div>Invalid Time</div>;
        }
      },
    },
    {
      accessorKey: "loading_date",
      header: "Loading Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("loading_date")); // Assuming date is a timestamp or a string in a parsable format
        const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }); // Format date as desired
        return <div className="text-right">{formattedDate}</div>;
      },
    },
    {
      accessorKey: "outbound_doc_type",
      header: "Outbound Doc Type",
    },
    {
      accessorKey: "outbound_doc",
      header: "Outbound Doc",
    },
    {
      accessorKey: "picking_doc",
      header: "Picking Doc",
    },
    {
      accessorKey: "loading_doc",
      header: "Loading Doc",
    },
    {
      accessorKey: "customer_name",
      header: "Customer Name",
    },
    {
      accessorKey: "shipper_name",
      header: "Shipper Name",
    },
    {
      accessorKey: "item_code",
      header: "Item Code",
    },
    {
      accessorKey: "item_name",
      header: "Item Name",
    },
    {
      accessorKey: "doc_qty",
      header: "Doc QTY",
      cell: ({ row }) => <div className="text-right">{row.getValue("doc_qty")}</div>,
    },
    {
      accessorKey: "qty",
      header: "QTY",
      cell: ({ row }) => <div className="text-right">{row.getValue("qty")}</div>,
    },
    {
      accessorKey: "uom",
      header: "UOM",
    },
    {
      accessorKey: "nett_weight",
      header: "Nett Weight",
      cell: ({ row }) => {
        const decimalValue = parseFloat(row.getValue("nett_weight"));
        const formattedDecimal = decimalValue.toFixed(3);
        return <div className="text-right">{formattedDecimal}</div>;
      },
    },
    {
      accessorKey: "gross_weight",
      header: "Gross Weight",
      cell: ({ row }) => {
        const decimalValue = parseFloat(row.getValue("gross_weight"));
        const formattedDecimal = decimalValue.toFixed(3);
        return <div className="text-right">{formattedDecimal}</div>;
      },
    },
    {
      accessorKey: "volume",
      header: "Volume",
      cell: ({ row }) => {
        const decimalValue = parseFloat(row.getValue("volume"));
        const formattedDecimal = decimalValue.toFixed(3);
        return <div className="text-right">{formattedDecimal}</div>;
      },
    },
    {
      accessorKey: "batch",
      header: "Batch",
    },
    {
      accessorKey: "bl_do",
      header: "BL DO",
    },
    {
      accessorKey: "aju_no",
      header: "AJU No",
    },
    {
      accessorKey: "truck_type",
      header: "Truck Type",
    },
    {
      accessorKey: "truck_no",
      header: "Truck No",
    },
    {
      accessorKey: "container_no",
      header: "Container No",
    },
    {
      accessorKey: "seal_no",
      header: "Seal No",
    },
    {
      accessorKey: "vessel_name",
      header: "Vessel Name",
    },
    {
      accessorKey: "voyage_no",
      header: "Voyage No",
    },
    {
      accessorKey: "destination",
      header: "Destination",
    },
    {
      accessorKey: "recipient",
      header: "Recipient",
    },
    {
      accessorKey: "shipping_notes",
      header: "Shipping Notes",
    },
    {
      accessorKey: "remark",
      header: "Remark",
    },
    {
      accessorKey: "doc_status",
      header: "Doc Status",
    },
    {
      accessorKey: "user_admin",
      header: "User Admin",
    },
    {
      accessorKey: "start_picking",
      header: "Start Picking",
      cell: ({ row }) => {
        const timeValue = row.getValue("start_picking"); // Expected to be a Date object or null
      
        if (!timeValue) {
          // Handle null or undefined values
          return <div>-</div>;
        }
      
        try {
          if (typeof timeValue === "string" || typeof timeValue === "number" || timeValue instanceof Date) {
            const dateObject = new Date(timeValue)

            if (isNaN(dateObject.getTime())) {
              return <div>Invalid time</div>
            }

            const formattedDateTime = `${dateObject.getFullYear()}-${(dateObject.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${dateObject.getDate().toString().padStart(2, "0")} ${dateObject
            .getHours()
            .toString()
            .padStart(2, "0")}:${dateObject.getMinutes().toString().padStart(2, "0")}:${dateObject
            .getSeconds()
            .toString()
            .padStart(2, "0")}`;
    
            return <div className="text-right">{formattedDateTime}</div>;
          }

          // If timeValue is of an unsupported type
          return <div>Invalid Time</div>
        } catch {
          // Handle invalid Date cases
          return <div>Invalid Time</div>;
        }
      },
    },
    {
      accessorKey: "finish_picking",
      header: "Finish Picking",
      cell: ({ row }) => {
        const timeValue = row.getValue("finish_picking"); // Expected to be a Date object or null
      
        if (!timeValue) {
          // Handle null or undefined values
          return <div>-</div>;
        }
      
        try {
          if (typeof timeValue === "string" || typeof timeValue === "number" || timeValue instanceof Date) {
            const dateObject = new Date(timeValue)

            if (isNaN(dateObject.getTime())) {
              return <div>Invalid time</div>
            }

            const formattedDateTime = `${dateObject.getFullYear()}-${(dateObject.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${dateObject.getDate().toString().padStart(2, "0")} ${dateObject
            .getHours()
            .toString()
            .padStart(2, "0")}:${dateObject.getMinutes().toString().padStart(2, "0")}:${dateObject
            .getSeconds()
            .toString()
            .padStart(2, "0")}`;
    
            return <div className="text-right">{formattedDateTime}</div>;
          }

          // If timeValue is of an unsupported type
          return <div>Invalid Time</div>
        } catch {
          // Handle invalid Date cases
          return <div>Invalid Time</div>;
        }
      },
    },
    {
      accessorKey: "leadtime_picking",
      header: "Leadtime Picking",
      cell: ({ row }) => {
        const value = row.getValue("leadtime_picking");
        return <div className="text-right">{formatLeadtime(value as number | null)}</div>;
      },
    },
    {
      accessorKey: "user_picking",
      header: "User Picking",
    },
    {
      accessorKey: "start_loading",
      header: "Start Loading",
      cell: ({ row }) => {
        const timeValue = row.getValue("start_loading"); // Expected to be a Date object or null
      
        if (!timeValue) {
          // Handle null or undefined values
          return <div>-</div>;
        }
      
        try {
          if (typeof timeValue === "string" || typeof timeValue === "number" || timeValue instanceof Date) {
            const dateObject = new Date(timeValue)

            if (isNaN(dateObject.getTime())) {
              return <div>Invalid time</div>
            }

            const formattedDateTime = `${dateObject.getFullYear()}-${(dateObject.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${dateObject.getDate().toString().padStart(2, "0")} ${dateObject
            .getHours()
            .toString()
            .padStart(2, "0")}:${dateObject.getMinutes().toString().padStart(2, "0")}:${dateObject
            .getSeconds()
            .toString()
            .padStart(2, "0")}`;
    
            return <div className="text-right">{formattedDateTime}</div>;
          }

          // If timeValue is of an unsupported type
          return <div>Invalid Time</div>
        } catch {
          // Handle invalid Date cases
          return <div>Invalid Time</div>;
        }
      },
    },
    {
      accessorKey: "finish_loading",
      header: "Finish Loading",
      cell: ({ row }) => {
        const timeValue = row.getValue("finish_loading"); // Expected to be a Date object or null
      
        if (!timeValue) {
          // Handle null or undefined values
          return <div>-</div>;
        }
      
        try {
          if (typeof timeValue === "string" || typeof timeValue === "number" || timeValue instanceof Date) {
            const dateObject = new Date(timeValue)

            if (isNaN(dateObject.getTime())) {
              return <div>Invalid time</div>
            }

            const formattedDateTime = `${dateObject.getFullYear()}-${(dateObject.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${dateObject.getDate().toString().padStart(2, "0")} ${dateObject
            .getHours()
            .toString()
            .padStart(2, "0")}:${dateObject.getMinutes().toString().padStart(2, "0")}:${dateObject
            .getSeconds()
            .toString()
            .padStart(2, "0")}`;
    
            return <div className="text-right">{formattedDateTime}</div>;
          }

          // If timeValue is of an unsupported type
          return <div>Invalid Time</div>
        } catch {
          // Handle invalid Date cases
          return <div>Invalid Time</div>;
        }
      },
    },
    {
      accessorKey: "leadtime_load",
      header: "Leadtime Load",
      cell: ({ row }) => {
        const value = row.getValue("leadtime_load");
        return <div className="text-right">{formatLeadtime(value as number | null)}</div>;
      },
    },
    {
      accessorKey: "user_loading",
      header: "User Loading",
    },
    {
      accessorKey: "year",
      header: "Year",
      cell: ({ row }) => <div className="text-center">{row.getValue("year")}</div>,
    },
    {
      accessorKey: "month",
      header: "Month",
      cell: ({ row }) => <div className="text-center">{row.getValue("month")}</div>,

    },
    {
      accessorKey: "week_no",
      header: "Week No",
      cell: ({ row }) => <div className="text-center">{row.getValue("week_no")}</div>,

    },
    {
      accessorKey: "week_in_month",
      header: "Week in Month",
      cell: ({ row }) => <div className="text-center">{row.getValue("week_in_month")}</div>,

    },
    {
      id: "actions",
      header: () => (
        <div className="flex items-center">
          <StickyNote className="h-5 w-5 mx-auto" /> {/* The icon with styling */}
        </div>
      ),
      cell: ({ row, table }) => (
        <ActionCell row={row} table={table} />
      )
    }
  ];
