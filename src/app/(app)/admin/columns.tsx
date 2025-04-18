"use client";
import { useState } from "react";

import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { MoreHorizontal, User, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditUserDialog } from "@/components/EditDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Checkbox } from "@/components/ui/checkbox";

// Define the shape of the user data
export type User = {
  id: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date | null;
  role: string;
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
  row: Row<User>;
  table: Table<User>;
}

// Create a separate component for the actions cell
const ActionCell = ({ row, table }: ActionCellProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSubmit = async (data: Partial<User>, identifier: string | Date | number | null) => {
    try {
      if (typeof identifier !== 'string') {
        throw new Error('Invalid identifier type');
      }
  
      const response = await fetch(`/api/admin/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: identifier,
          ...data
        }),
      });
  
      if (!response.ok) {
        // Parse the error response to get detailed error message
        const errorData = await response.json();
        
        // Create an error object that includes both the response and error message
        const error = new Error(errorData.error || 'Failed to update record');
        (error as any).response = { data: errorData };
        throw error;
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
      const response = await fetch(`/api/admin/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: row.original.id
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
    "email",
    "username",
    "password",
    "role"
  ];

  return (
    <div>
      <div className="w-full flex justify-center">
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
      </div>
        
      <EditUserDialog
        row={row.original}
        columns={columns}
        editableColumns={editableColumns}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSubmit={handleSubmit}
        primaryKeyField="id"
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onContinue={handleDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action is irreversible."
        cancelText="No, Cancel"
        continueText="Yes, Delete"
        variant="destructive"
      />
    </div>
  );
};

export const columns: ColumnDefWithMeta<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Username
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Created At
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formattedDate = date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return <div className="text-center">{formattedDate}</div>;
    },
  },
  {
    id: "actions",
    header: () => (
      <div className="flex items-center">
        <User className="h-5 w-5 mx-auto" />
      </div>
    ),
    cell: ({ row, table }) => (
      <ActionCell row={row} table={table} />
    ),
  }
];