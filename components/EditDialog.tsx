import React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
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
import { DateTimePicker } from './ui/datetime-picker';
import { SimpleTimePicker } from './ui/time-picker';
import { format } from "date-fns";
import ConfirmDialog from './ui/ConfirmDialog';

type ColumnValue = string | number | Date | null;

interface AreaOption {
  value: string;
  label: string;
}

interface EditDialogProps<TData extends Record<string, ColumnValue>> {
  row: TData;
  columns: ColumnDef<TData, unknown>[];
  editableColumns: string[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TData>, identifier: TData[keyof TData]) => Promise<void>;
  primaryKeyField: keyof TData;
}

const AREA_OPTIONS: AreaOption[] = [
  { value: "CFS", label: "CFS" },
  { value: "FREEZONE AB", label: "FREEZONE AB" },
  { value: "FREEZONE BRJ", label: "FREEZONE BRJ" },
  { value: "GB", label: "BONDED" },
  { value: "PLB", label: "PLB" },
];

const EditDialog = <TData extends Record<string, ColumnValue>>({
  row,
  columns,
  editableColumns,
  isOpen,
  onClose,
  onSubmit,
  primaryKeyField
}: EditDialogProps<TData>) => {
  const [formData, setFormData] = useState<Partial<TData>>(() => {
    const initialData: Partial<TData> = {};
    editableColumns.forEach(key => {
      const value = row[key as keyof TData];
      if (value !== null && value !== undefined) {
        initialData[key as keyof TData] = value;
      }
    });
    return initialData;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (key: string, value: ColumnValue) => {
    if (value === '') {
      const newFormData = { ...formData };
      delete newFormData[key as keyof TData];
      setFormData(newFormData);
    } else {
      setFormData(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const getDateType = (columnName: string): 'date' | 'time' | 'datetime' | null => {
    if (columnName.includes('_date')) return 'date';
    if (columnName === 'gate_in' || columnName === 'outbound_time') return 'time';
    if (columnName.includes('start_') || columnName.includes('finish_')) return 'datetime';
    return null;
  };

  const getDisplayValue = (value: ColumnValue, dateType: 'date' | 'time' | 'datetime' | null): string => {
    if (!value) return '';
    
    try {
      const date = value instanceof Date ? value : new Date(value.toString());
      
      switch (dateType) {
        case 'date':
          return format(date, 'dd/MM/yyyy');
        case 'time':
          return format(date, 'HH:mm');
        case 'datetime':
          return format(date, 'dd/MM/yyyy HH:mm');
        default:
          return value.toString();
      }
    } catch {
      return '';
    }
  };

  const renderDateTimePicker = (accessorKey: string, currentValue: ColumnValue, dateType: 'date' | 'time' | 'datetime') => {
    const value = currentValue ? new Date(currentValue.toString()) : new Date();
    
    const commonProps = {
      value,
      onChange: (newDate: Date | undefined) => handleInputChange(accessorKey, newDate ?? null),
      clearable: true,
      classNames: {
        trigger: 'w-full'
      }
    };
  
    switch (dateType) {
      case 'date':
        return (
          <DateTimePicker
            {...commonProps}
            hideTime={true}
          />
        );
      case 'time':
        return (
          <SimpleTimePicker
            value={value}
            onChange={(date: Date) => handleInputChange(accessorKey, date)}
            disabled={false}
            modal={true}
          />
        );
      default: // datetime
        return (
          <DateTimePicker
            {...commonProps}
            hideTime={false}
            timePicker={{
              hour: true,
              minute: true,
              second: true
            }}
          />
        );
    }
  };

  const renderField = (accessorKey: string, isEditable: boolean, rawValue: ColumnValue) => {
    const dateType = getDateType(accessorKey);
    const currentValue = formData[accessorKey as keyof TData] ?? rawValue;
    
    // For non-editable fields
    if (!isEditable) {
      return (
        <div className="col-span-3 p-2 bg-gray-100 rounded">
          {getDisplayValue(currentValue, dateType)}
        </div>
      );
    }

    // For editable fields
    if (accessorKey === 'area') {
      return (
        <Select
          value={currentValue?.toString() ?? ''}
          onValueChange={(value) => handleInputChange(accessorKey, value)}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select warehouse area" />
          </SelectTrigger>
          <SelectContent>
            {AREA_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Handle different date/time types
    if (dateType) {
      return renderDateTimePicker(accessorKey, currentValue, dateType);
    }

    // For regular input fields
    return (
      <Input
        type={typeof rawValue === 'number' ? 'number' : 'text'}
        value={currentValue?.toString() ?? ''}
        onChange={(e) => {
          const newValue = e.target.value;
          if (typeof rawValue === 'number') {
            handleInputChange(accessorKey, newValue === '' ? null : parseFloat(newValue));
          } else {
            handleInputChange(accessorKey, newValue === '' ? null : newValue);
          }
        }}
        className="col-span-3"
      />
    );
  };

  const handleSubmit = async () => {
    setShowAlert(true);
  };

  const handleConfirmedSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(formData, row[primaryKeyField]);
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
      const value = row[key as keyof TData];
      if (value !== null && value !== undefined) {
        initialData[key as keyof TData] = value;
      }
    });
    setFormData(initialData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {columns.map(column => {
            const columnDef = column as { accessorKey?: string };
            const accessorKey = columnDef.accessorKey;
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
          <Button variant="outline" onClick={handleCancel}>
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
          variant='success'
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;