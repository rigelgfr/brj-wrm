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
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  onContinue,
  title = 'Confirm Changes',
  description = 'Are you sure you want to save these changes? This action cannot be undone.',
  cancelText = 'Cancel',
  continueText = 'Continue',
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex place-items-center">
          <AlertDialogCancel className='mb-2 border-gray-400'>{cancelText}</AlertDialogCancel>
          <AlertDialogAction className='bg-green-krnd hover:bg-green-900' onClick={onContinue}>{continueText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
