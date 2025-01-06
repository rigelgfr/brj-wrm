"use client";
import { useState } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, StickyNote } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/src/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import EditDialog from "@/src/components/EditDialog";
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";

// Define the shape of the inbound data
export type Inbound = {
  no: number;
  area: string | null;
  inbound_date: Date | null;  // We’ll handle this as a string for formatting
  gate_in: Date | null;
  inbound_doc_type: string | null;
  inbound_doc: string | null;
  receiving_doc: string | null;
  customer_name: string | null;
  shipper_name: string | null;
  bl_do: string | null;
  aju_no: string | null;
  truck_type: string | null;
  plat_no: string | null;
  container_no: string | null;
  seal_no: string | null;
  item_code: string | null;
  item_name: string | null;
  qty: number | null;
  uom: string | null;
  nett_weight: number | null;
  gross_weight: number | null;
  volume: number | null;
  batch: string | null;
  npe_no: string | null;
  npe_date: Date | null;
  peb_no: string | null;
  peb_date: Date | null;
  remark: string | null;
  dock_no: string | null;  
  doc_status: string | null;
  user_admin: string | null;
  start_tally: string | null;
  finish_tally: string | null;
  user_tally: string | null;
  start_putaway: string | null;
  finish_putaway: string | null;
  user_putaway: string | null;
  id: string;
  year: number;
  month: string;
  week_no: string;
  week_in_month: string;
};

export const columns: ColumnDef<Inbound>[] = [
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
      accessorKey: "inbound_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-2"
          >
            Inbound Date
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("inbound_date")); // Assuming date is a timestamp or a string in a parsable format
        const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }); // Format date as desired
        return <div className="text-right">{formattedDate}</div>;
      },
    },
    {
      accessorKey: "gate_in",
      header: "Gate In",
      cell: ({ row }) => {
        const timeValue = row.getValue("gate_in"); // Expected to be a Date object or null
      
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
      accessorKey: "inbound_doc_type",
      header: "Inbound Doc Type",
    },
    {
      accessorKey: "inbound_doc",
      header: "Inbound Doc",
    },
    {
      accessorKey: "receiving_doc",
      header: "Receiving Doc",
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
      accessorKey: "npe_no",
      header: "NPE No",
    },
    {
        accessorKey: "npe_date",
        header: "NPE Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("npe_date")); // Assuming date is a timestamp or a string in a parsable format
            const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }); // Format date as desired
            return <div className="text-right">{formattedDate}</div>;
        },
      },
    {
      accessorKey: "peb_no",
      header: "PEB No",
    },  
    {
        accessorKey: "peb_date",
        header: "PEB Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("peb_date")); // Assuming date is a timestamp or a string in a parsable format
            const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }); // Format date as desired
            return <div className="text-right">{formattedDate}</div>;
        },
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
      accessorKey: "plat_no",
      header: "Plat No",
    },
    {
      accessorKey: "container_no",
      header: "Container No",
    },
    {
      accessorKey: "remark",
      header: "Remark",
    },
    {
        accessorKey: "dock_no",
        header: "Dock No",
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
      accessorKey: "start_tally",
      header: "Start Tally",
      cell: ({ row }) => {
        const timeValue = row.getValue("start_tally"); // Expected to be a Date object or null
    
        if (!timeValue) {
          // Handle null or undefined values
          return <div>-</div>;
        }
    
        try {
          // Ensure the value is a Date object
          const dateObject = new Date(timeValue);
    
          // Format as yyyy-mm-dd hh:mm:ss
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
        } catch {
          // Handle invalid Date cases
          return <div>Invalid Date/Time</div>;
        }
      },
    },    
    {
      accessorKey: "finish_tally",
      header: "Finish Tally",
      cell: ({ row }) => {
        const timeValue = row.getValue("finish_tally"); // Expected to be a Date object or null
    
        if (!timeValue) {
          // Handle null or undefined values
          return <div>-</div>;
        }
    
        try {
          // Ensure the value is a Date object
          const dateObject = new Date(timeValue);
    
          // Format as yyyy-mm-dd hh:mm:ss
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
        } catch {
          // Handle invalid Date cases
          return <div>Invalid Date/Time</div>;
        }
      },
    },
    {
      accessorKey: "user_tally",
      header: "User Tally",
    },
    {
      accessorKey: "start_putaway",
      header: "Start Putaway",
      cell: ({ row }) => {
        const timeValue = row.getValue("start_putaway"); // Expected to be a Date object or null
    
        if (!timeValue) {
          // Handle null or undefined values
          return <div>-</div>;
        }
    
        try {
          // Ensure the value is a Date object
          const dateObject = new Date(timeValue);
    
          // Format as yyyy-mm-dd hh:mm:ss
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
        } catch {
          // Handle invalid Date cases
          return <div>Invalid Date/Time</div>;
        }
      },
    },
    {
      accessorKey: "finish_putaway",
      header: "Finish Putaway",
      cell: ({ row }) => {
        const timeValue = row.getValue("finish_putaway"); // Expected to be a Date object or null
    
        if (!timeValue) {
          // Handle null or undefined values
          return <div>-</div>;
        }
    
        try {
          // Ensure the value is a Date object
          const dateObject = new Date(timeValue);
    
          // Format as yyyy-mm-dd hh:mm:ss
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
        } catch {
          // Handle invalid Date cases
          return <div>Invalid Date/Time</div>;
        }
      },
    },
    {
      accessorKey: "user_putaway",
      header: "User Putaway",
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
      cell: ({ row, column }) => {
        const [showEditDialog, setShowEditDialog] = useState(false);
        const [showDeleteDialog, setShowDeleteDialog] = useState(false);

        const onRefresh = column.columnDef.meta?.onRefresh;

        const handleSubmit = async (data: Partial<Inbound>, no: number) => {
          try {
            const response = await fetch(`/api/inbound/edit`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                no, // Use the 'no' field as identifier
                ...data
              }),
            });
      
            if (!response.ok) {
              throw new Error('Failed to update record');
            }

             // Call onRefresh after successful update
            if (onRefresh) {
              onRefresh();
            }
      
          } catch (error) {
            console.error('Failed to update:', error);
            throw error;
          }
        };

        const handleDelete = async () => {
          try {
            const response = await fetch(`/api/inbound/delete`, {
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
        
            // Close the delete dialog
            setShowDeleteDialog(false);
        
            // Refresh the table
            if (onRefresh) {
              onRefresh();
            }
        
          } catch (error) {
            console.error('Failed to delete:', error);
          }
        };
        
        // Specify which columns should be editable
        const editableColumns = [
          "area",
          "inbound_date",
          "inbound_doc_type",
          "inbound_doc",
          "receiving_doc",
          "customer_name",
          "shipper_name",
          "item_code",
          "item_name",
          "qty",
          "uom",
          "nett_weight",
          "gross_weight",
          "volume",
          "batch",
          "npe_no",
          "npe_date",
          "peb_no",
          "peb_date",
          "bl_do",
          "aju_no",
          "truck_type",
          "plat_no",
          "container_no",
          "remark",
          "dock_no",
          "doc_status",
          "user_admin",
          "user_tally",
          "user_putaway"
        ];
    
        const handleSave = async (updatedData: Partial<Inbound>) => {
          try {
            // Add your update API call here
            console.log('Updating record:', row.original.id, updatedData);
            // await updateRecord(row.original.id, updatedData);
          } catch (error) {
            console.error('Failed to update:', error);
            throw error;
          }
        };
    
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
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
              onSave={handleSave}
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
      },
    }
  ];
