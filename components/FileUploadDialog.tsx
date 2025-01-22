import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
  title?: string;
  description?: string;
  acceptedFileTypes?: string;
  uploadEndpoint: string;
  fileTypeName?: string;
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  open,
  onOpenChange,
  onRefresh,
  title = "Upload File",
  description = "Upload a file to the system.",
  acceptedFileTypes = "*",
  uploadEndpoint,
  fileTypeName = "file"
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (acceptedFileTypes !== "*") {
        const fileTypes = acceptedFileTypes.split(",");
        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
        if (!fileTypes.includes(`.${fileExtension}`)) {
          setError(`Please select a valid ${fileTypeName}`);
          return;
        }
      }
      
      setFile(selectedFile);
      setError(null);
      setStatus('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setStatus('Starting upload...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Upload failed');
      }

      setStatus('Upload completed successfully!');
      
      // Close dialog and refresh after a brief delay to show success message
      setTimeout(() => {
        onOpenChange(false);
        if (onRefresh) {
          onRefresh();
        }
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setStatus('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept={acceptedFileTypes}
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-krnd
                hover:file:bg-green-100"
            />
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            {status && (
              <p className="text-green-600 text-sm">{status}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-green-krnd"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;