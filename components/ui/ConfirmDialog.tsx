import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'; // Adjust this to your components' import path

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  title?: string;
  description?: string;
  cancelText?: string;
  continueText?: string;
  variant?: 'default' | 'destructive' | 'success';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  onContinue,
  title = 'Confirm Changes',
  description = 'Are you sure you want to save these changes? This action cannot be undone.',
  cancelText = 'Cancel',
  continueText = 'Continue',
  variant = 'default',
}) => {

  // Define button styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      default:
        return 'bg-green-krnd hover:bg-green-900 focus:ring-green-500';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex place-items-center">
          <AlertDialogCancel className='border-gray-400'>{cancelText}</AlertDialogCancel>
          <AlertDialogAction 
            className={`${getButtonStyles()} text-white`} 
            onClick={onContinue}
          >
            {continueText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
