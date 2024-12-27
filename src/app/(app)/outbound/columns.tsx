"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/src/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define the shape of the outbound data
export type Outbound = {
  no: number;
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
  start_picking: Date | null;
  finish_picking: Date | null;
  user_picking: string | null;
  start_loading: Date | null;
  finish_loading: Date | null;
  user_loading: string | null;
  id: string;
  year: number;
  month: string;
  week_no: string;
  week_in_month: string;
};

export const columns: ColumnDef<Outbound>[] = [
    {
      accessorKey: "no",
      header: "No",
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
          const dateObject = new Date(timeValue);
      
          // Extract hh:mm using built-in methods
          const formattedTime = `${dateObject.getHours().toString().padStart(2, "0")}:${dateObject.getMinutes().toString().padStart(2, "0")}`;
      
          return <div className="text-right">{formattedTime}</div>;
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
          // Ensure the value is a Date object
          const dateObject = new Date(timeValue);
      
          // Extract hh:mm using built-in methods
          const formattedTime = `${dateObject.getHours().toString().padStart(2, "0")}:${dateObject.getMinutes().toString().padStart(2, "0")}`;
      
          return <div className="text-right">{formattedTime}</div>;
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
          // Ensure the value is a Date object
          const dateObject = new Date(timeValue);
      
          // Extract hh:mm using built-in methods
          const formattedTime = `${dateObject.getHours().toString().padStart(2, "0")}:${dateObject.getMinutes().toString().padStart(2, "0")}`;
      
          return <div className="text-right">{formattedTime}</div>;
        } catch {
          // Handle invalid Date cases
          return <div>Invalid Time</div>;
        }
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
          // Ensure the value is a Date object
          const dateObject = new Date(timeValue);
      
          // Extract hh:mm using built-in methods
          const formattedTime = `${dateObject.getHours().toString().padStart(2, "0")}:${dateObject.getMinutes().toString().padStart(2, "0")}`;
      
          return <div className="text-right">{formattedTime}</div>;
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
          // Ensure the value is a Date object
          const dateObject = new Date(timeValue);
      
          // Extract hh:mm using built-in methods
          const formattedTime = `${dateObject.getHours().toString().padStart(2, "0")}:${dateObject.getMinutes().toString().padStart(2, "0")}`;
      
          return <div className="text-right">{formattedTime}</div>;
        } catch {
          // Handle invalid Date cases
          return <div>Invalid Time</div>;
        }
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
      cell: ({ row }) => {
        const payment = row.original
   
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];
