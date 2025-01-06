import React from 'react';
import { useState } from 'react';
import { Button } from "@/src/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmDialog from './ui/ConfirmDialog';

interface EditDialogProps<TData> {
  row: TData;
  columns: ColumnDef<TData, any>[];
  editableColumns: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<TData>) => Promise<void>;
  onSubmit: (data: Partial<TData>, identifier: any) => Promise<void>;
  primaryKeyField: keyof TData;
}

const AREA_OPTIONS = [
  { value: "CFS", label: "CFS" },
  { value: "FREEZONE AB", label: "FREEZONE AB" },
  { value: "FREEZONE BRJ", label: "FREEZONE BRJ" },
  { value: "GB", label: "BONDED" },
  { value: "PLB", label: "PLB" },
];

const EditDialog = <TData,>({
  row,
  columns,
  editableColumns,
  isOpen,
  onClose,
  onSave,
  onSubmit,
  primaryKeyField
}: EditDialogProps<TData>) => {
  const [formData, setFormData] = useState<Partial<TData>>(() => {
    const initialData: Partial<TData> = {};
    editableColumns.forEach(key => {
      initialData[key as keyof TData] = row[key as keyof TData];
    });
    return initialData;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async () => {
    setShowAlert(true);
  };

  const handleConfirmedSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(formData, row[primaryKeyField]); // Call the passed down onSubmit function
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
      setShowAlert(false);
    }
  };

  const handleCancel = () => {
    const initialData: Partial<TData> = {};
    editableColumns.forEach(key => {
      initialData[key as keyof TData] = row[key as keyof TData];
    });
    setFormData(initialData);
    onClose();
  };

  const getDateType = (columnName: string): 'date' | 'time' | 'datetime' | null => {
    if (columnName.includes('_date')) {
      return 'date';
    }
    if (columnName === 'gate_in' || columnName === 'outbound_time') {
      return 'time';
    }
    if (columnName.includes('start_') || columnName.includes('finish_')) {
      return 'datetime';
    }
    return null;
  };

  const formatValue = (value: any, dateType: 'date' | 'time' | 'datetime' | null): string => {
    if (!value) return '';

    try {
      const date = new Date(value);
      
      switch (dateType) {
        case 'date':
          return date.toISOString().split('T')[0];
        case 'time':
          return date.toTimeString().slice(0, 5);
        case 'datetime':
          return `${date.toISOString().split('.')[0].slice(0, -3)}`;
        default:
          return value?.toString() || '';
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return value?.toString() || '';
    }
  };

  const getInputType = (columnName: string): string => {
    const dateType = getDateType(columnName);
    switch (dateType) {
      case 'date':
        return 'date';
      case 'time':
        return 'time';
      case 'datetime':
        return 'datetime-local';
      default:
        const value = row[columnName as keyof TData];
        return typeof value === 'number' ? 'number' : 'text';
    }
  };

  const renderField = (accessorKey: string, isEditable: boolean, rawValue: any) => {
    const dateType = getDateType(accessorKey);
    const inputType = getInputType(accessorKey);
    const displayValue = formatValue(rawValue, dateType);

    if (!isEditable) {
      return (
        <div className="col-span-3 p-2 bg-gray-200 rounded">
          {displayValue}
        </div>
      );
    }

    if (accessorKey === 'area') {
      return (
        <Select
          value={formData[accessorKey as keyof TData]?.toString() || ''}
          onValueChange={(value) => handleInputChange(accessorKey, value)}
        >
          <SelectTrigger className="col-span-3 border-green-krnd">
            <SelectValue placeholder="Select warehouse area" />
          </SelectTrigger>
          <SelectContent>
            {AREA_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="flex items-start space-x-4 px-2 hover:bg-gray-100" // Ensure proper spacing and alignment of the checkmark and label
              >
                <span>{option.label}</span> {/* Label */}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        id={accessorKey}
        name={accessorKey}
        type={inputType}
        value={formatValue(formData[accessorKey as keyof TData], dateType)}
        onChange={(e) => handleInputChange(accessorKey, 
          inputType === 'number' ? parseFloat(e.target.value) : e.target.value
        )}
        className="col-span-3 border-green-krnd"
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {columns.map(column => {
            const accessorKey = column.accessorKey as string;
            if (!accessorKey) return null;

            const isEditable = editableColumns.includes(accessorKey);
            const rawValue = row[accessorKey as keyof TData];
            
            if (!isEditable && !rawValue) return null;

            return (
              <div key={accessorKey} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={accessorKey} className="text-right">
                  {typeof column.header === 'string' 
                    ? column.header 
                    : accessorKey.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                </Label>
                {renderField(accessorKey, isEditable, rawValue)}
              </div>
            );
          })}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} className='border-gray-400'>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </DialogFooter>
          
        <ConfirmDialog
          open={showAlert}
          onOpenChange={setShowAlert}
          onContinue={handleConfirmedSubmit}
          title="Save Changes"
          description="Do you want to save your changes? This action is irreversible."
          cancelText="No, Cancel"
          continueText="Yes, Save"
        />
        
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;