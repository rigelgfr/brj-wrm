import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import FileUploadDialog from "@/components/FileUploadDialog";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function BackupData() {
    const [showBackupDialog, setShowBackupDialog] = useState(false);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleBackup = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/backup/export', {
                method: 'POST',
            });
            
            if (!response.ok) {
                throw new Error(`Backup failed: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const date = new Date().toISOString().split('T')[0];
            const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `backup_${date}_${time}.sql`;
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            setShowBackupDialog(false);
        } catch (error) {
            console.error('Error during backup:', error);
            // Check if error is an instance of Error and access the message
            if (error instanceof Error) {
                alert('Failed to download backup: ' + error.message);
            } else {
                alert('Failed to download backup: An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-x-2">
            <Button
                variant="outline"
                className="border-green-krnd"
                size="lg"
                onClick={() => setShowBackupDialog(true)}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Backup...
                    </>
                ) : (
                    'Backup Data'
                )}
            </Button>
            <Button
                variant="default"
                className="bg-green-krnd"
                size="lg"
                onClick={() => setShowRestoreDialog(true)}
            >
                Restore Data
            </Button>

            <ConfirmDialog
                open={showBackupDialog}
                onOpenChange={setShowBackupDialog}
                onContinue={handleBackup}
                title="Confirm Database Backup"
                description="This will create a backup of your current database. The backup file will be downloaded to your computer. This might take a while for large databases."
                continueText="Download Backup"
                variant="success"
            />

            <FileUploadDialog
                open={showRestoreDialog}
                onOpenChange={setShowRestoreDialog}
                title="Restore Database"
                description="Select a database backup file (.sql) to restore. This will create the database if it doesn't exist."
                acceptedFileTypes=".sql"
                uploadEndpoint="/api/backup/import"
                fileTypeName="SQL backup file"
            />
        </div>
    );
}