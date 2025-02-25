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

const ROLE_OPTIONS: string[] = ["ADMIN", "SUPER_ADMIN"];

const AREA_OPTIONS: AreaOption[] = [
  { value: "CFS", label: "CFS" },
  { value: "FREEZONE AB", label: "FREEZONE AB" },
  { value: "FREEZONE BRJ", label: "FREEZONE BRJ" },
  { value: "GB", label: "BONDED" },
  { value: "PLB", label: "PLB" },
];

export const EditDialog = <TData extends Record<string, ColumnValue>>({
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

export const EditUserDialog = <TData extends Record<string, ColumnValue>>({
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

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string) => {
    // Username should be at least 3 characters and contain only alphanumeric chars and underscores
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    return usernameRegex.test(username);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate email if it exists in form data
    if (formData.email && !validateEmail(formData.email.toString())) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Validate username if it exists in form data
    if (formData.username && !validateUsername(formData.username.toString())) {
      newErrors.username = "Username must be at least 3 characters and contain only letters, numbers, and underscores";
    }
    
    // Validate old password is provided if new password is entered
    if (passwordData.newPassword && !passwordData.oldPassword) {
      newErrors.oldPassword = "Please enter your current password";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (key: string, value: ColumnValue) => {
    // Clear any existing error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }

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

  const handlePasswordChange = (field: 'oldPassword' | 'newPassword', value: string) => {
    // Clear any existing error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const renderField = (accessorKey: string, isEditable: boolean, rawValue: ColumnValue) => {
    const currentValue = formData[accessorKey as keyof TData] ?? rawValue;
    
    // For non-editable fields with date-looking values
    if (!isEditable) {
      if (typeof currentValue === 'string' && 
          (currentValue.includes('T') || currentValue.includes('Z'))) {
        return (
          <div className="col-span-3 p-2 bg-gray-100 rounded">
            {formatDate(currentValue)}
          </div>
        );
      }
      
      return (
        <div className="col-span-3 p-2 bg-gray-100 rounded">
          {currentValue?.toString() || ''}
        </div>
      );
    }

    if (accessorKey === 'role') {
      return (
        <div className="col-span-3">
          <Select
            value={currentValue?.toString() ?? ''}
            onValueChange={(value) => handleInputChange(accessorKey, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors[accessorKey] && <p className="text-sm text-red-500 mt-1">{errors[accessorKey]}</p>}
        </div>
      );
    }

    // For email field
    if (accessorKey === 'email') {
      return (
        <div className="col-span-3">
          <Input
            type="email"
            value={currentValue?.toString() ?? ''}
            onChange={(e) => handleInputChange(accessorKey, e.target.value)}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>
      );
    }

    // For username field
    if (accessorKey === 'username') {
      return (
        <div className="col-span-3">
          <Input
            type="text"
            value={currentValue?.toString() ?? ''}
            onChange={(e) => handleInputChange(accessorKey, e.target.value)}
            className={errors.username ? "border-red-500" : ""}
          />
          {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
        </div>
      );
    }

    // For regular input fields
    return (
      <div className="col-span-3">
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
          className={errors[accessorKey] ? "border-red-500" : ""}
        />
        {errors[accessorKey] && <p className="text-sm text-red-500 mt-1">{errors[accessorKey]}</p>}
      </div>
    );
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setShowAlert(true);
    }
  };

  const handleConfirmedSubmit = async () => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      // Create a submission object that combines form data with password data
      const submissionData = {
        ...formData
      };
      
      // Only pass password data if new password is provided
      if (passwordData.newPassword) {
        // Use type assertion to add password fields to the submission data
        (submissionData as any).oldPassword = passwordData.oldPassword;
        (submissionData as any).newPassword = passwordData.newPassword;
      }
      
      try {
        await onSubmit(submissionData as Partial<TData>, row[primaryKeyField]);
        onClose();
      } catch (error: any) {
        // The error structure depends on how your API client is implemented
        // This handling covers both axios and fetch style errors
        if (error.response?.data?.error) {
          // Axios style error response
          setFormError(error.response.data.error);
        } else if (error.error) {
          // Direct error object
          setFormError(error.error);
        } else if (typeof error.json === 'function') {
          // Fetch style response
          const data = await error.json();
          setFormError(data.error || "Failed to save changes");
        } else if (error.message) {
          // Error with message property
          setFormError(error.message);
        } else {
          // Fallback
          setFormError("Failed to save changes");
        }
        setShowAlert(false);
      }
    } finally {
      setIsSubmitting(false);
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
    setPasswordData({ oldPassword: '', newPassword: '' });
    setErrors({});
    setFormError(null);
    onClose();
  };

  // Determine which columns should be shown (filter out non-essential ones)
  const displayableColumns = columns.filter(column => {
    const columnDef = column as { accessorKey?: string };
    const accessorKey = columnDef.accessorKey;
    
    if (!accessorKey) return false;
    if (accessorKey === 'password') return false;
    
    const rawValue = row[accessorKey as keyof TData];
    const isEditable = editableColumns.includes(accessorKey);
    
    // Show editable fields or non-editable fields with values
    return isEditable || (rawValue !== null && rawValue !== undefined);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {displayableColumns.map(column => {
            const columnDef = column as { accessorKey?: string };
            const accessorKey = columnDef.accessorKey;
            if (!accessorKey) return null;

            const isEditable = editableColumns.includes(accessorKey);
            const rawValue = row[accessorKey as keyof TData];

            return (
              <div key={accessorKey} className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor={accessorKey} className="text-right text-sm font-medium">
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
          
          {/* Password Change Section */}
          <div className="mt-6 mb-2">
            <h3 className="font-medium text-base">Change Password</h3>
            <p className="text-xs text-gray-500">Leave blank if you don't want to change your password</p>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="oldPassword" className="text-right text-sm font-medium">
              Current
            </Label>
            <div className="col-span-3">
              <Input
                type="password"
                id="oldPassword"
                value={passwordData.oldPassword}
                onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                className={errors.oldPassword ? "border-red-500" : ""}
              />
              {errors.oldPassword && <p className="text-xs text-red-500 mt-1">{errors.oldPassword}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="newPassword" className="text-right text-sm font-medium">
              New
            </Label>
            <div className="col-span-3">
              <Input
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className={errors.newPassword ? "border-red-500" : ""}
              />
              {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-4 flex-col items-end">
          {formError && (
            <p className="text-sm text-red-500 mb-2 w-full text-right">{formError}</p>
          )}
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={handleCancel} size="sm">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="sm"
            >
              Save Changes
            </Button>
          </div>
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