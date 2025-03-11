'use client';

import React, { FC, useState, useEffect } from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { Clipboard, Check } from "lucide-react";
import html2canvas from "html2canvas";

interface CopyTableAsImageProps extends Omit<ButtonProps, 'onClick'> {
  tableRef: React.RefObject<HTMLElement>;
  filename?: string;
  buttonText?: string;
  showIcon?: boolean;
  onCopySuccess?: () => void;
  onCopyError?: (error: Error) => void;
}

const CopyTableAsImage: FC<CopyTableAsImageProps> = ({
  tableRef,
  filename = 'table-export',
  buttonText = 'Copy as Image',
  showIcon = true,
  onCopySuccess,
  onCopyError,
  className,
  ...buttonProps
}) => {
  // Only track success state
  const [success, setSuccess] = useState(false);
  
  // Effect to reset button state after success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (success) {
      timer = setTimeout(() => {
        setSuccess(false);
      }, 1000); // Reset after 1 second as requested
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success]);

  const copyTableAsImage = async () => {
    if (!tableRef.current) {
      const error = new Error('Table reference is not available');
      onCopyError?.(error);
      return;
    }

    try {
      // Create a clone of the table to modify without affecting the displayed table
      const tableContainer = tableRef.current.cloneNode(true) as HTMLElement;
      
      // Apply compact styling to the cloned table
      const table = tableContainer.querySelector('table');
      if (table) {
        table.style.width = 'auto'; // Make table width fit its content
        table.style.tableLayout = 'auto';
        
        // Make all cells take minimum required width
        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => {
          (cell as HTMLElement).style.width = 'auto';
          (cell as HTMLElement).style.whiteSpace = 'nowrap';
        });
      }
      
      // Append the clone to the body temporarily for rendering
      // Use a container to isolate it
      const renderContainer = document.createElement('div');
      renderContainer.style.position = 'absolute';
      renderContainer.style.left = '-9999px';
      renderContainer.style.top = '0';
      renderContainer.appendChild(tableContainer);
      document.body.appendChild(renderContainer);
      
      // Render to canvas
      const canvas = await html2canvas(tableContainer, {
        scale: 2, // Increase resolution
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      // Remove the temporary element
      document.body.removeChild(renderContainer);
      
      // Convert to Blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          const error = new Error('Failed to create blob from canvas');
          onCopyError?.(error);
          return;
        }
        
        try {
          // Use Clipboard API to copy the image
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ]);
          
          console.log('Table copied to clipboard as image');
          setSuccess(true);
          onCopySuccess?.();
        } catch (err) {
          console.error('Failed to copy image to clipboard:', err);
          
          // Fallback: Download the image if clipboard access fails
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.png`;
          a.click();
          URL.revokeObjectURL(url);
          setSuccess(true); // Still consider it a success since we fell back to download
          onCopySuccess?.();
        }
      }, 'image/png', 0.95);
    } catch (error) {
      console.error('Error copying table as image:', error);
      onCopyError?.(error as Error);
    }
  };

  // Render button content based on state
  const renderButtonContent = () => {
    if (success) {
      return (
        <>
          <Check className="w-4 h-4 mr-2" />
          <span className="animate-fadeIn">Table copied to clipboard</span>
        </>
      );
    } else {
      // Initial state - just the icon
      return showIcon ? <Clipboard className="w-4 h-4" /> : buttonText;
    }
  };

  return (
    <Button
      onClick={copyTableAsImage}
      variant="outline"
      size="default"
      className={`transition-all duration-200 ${className || ''}`}
      {...buttonProps}
      disabled={success}
    >
      {renderButtonContent()}
    </Button>
  );
};

export default CopyTableAsImage;