// app/api/backup/restore/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

// Helper function to execute commands with logging
async function execCommand(command: string, isWindows: boolean) {
    try {
        const { stdout, stderr } = await execAsync(command, {
            shell: isWindows ? 'cmd.exe' : '/bin/sh',
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        });
        
        if (stderr) {
            console.log('Command stderr:', stderr);
        }
        if (stdout) {
            console.log('Command stdout:', stdout);
        }
        
        return { stdout, stderr };
    } catch (error) {
        console.error('Command execution failed:', error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    const isWindows = process.platform === 'win32';
    let tempFilePath = '';

    try {
        console.log('Starting database restore process...');
        
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            throw new Error('No file provided');
        }

        // Get database connection details
        const {
            DATABASE_URL = '',
        } = process.env;

        const url = new URL(DATABASE_URL);
        const dbName = url.pathname.slice(1);
        const host = url.hostname;
        const port = url.port;
        const username = url.username;
        const password = url.password;

        console.log(`Preparing to restore database: ${dbName}`);

        // Create temporary file
        const tempDir = isWindows ? process.env.TEMP || 'C:\\Windows\\Temp' : '/tmp';
        tempFilePath = join(tempDir, `restore-${randomUUID()}.sql`);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(tempFilePath, buffer);
        
        console.log('Backup file saved to temporary location:', tempFilePath);

        // First, terminate all connections to the database
        const terminateCommand = isWindows
            ? `set PGPASSWORD=${password}&& psql -h ${host} -p ${port} -U ${username} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${dbName}' AND pid <> pg_backend_pid();"`
            : `PGPASSWORD=${password} psql -h ${host} -p ${port} -U ${username} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${dbName}' AND pid <> pg_backend_pid();"`;

        console.log('Terminating existing connections...');
        await execCommand(terminateCommand, isWindows);

        // Drop and recreate the database
        const dropDbCommand = isWindows
            ? `set PGPASSWORD=${password}&& dropdb -h ${host} -p ${port} -U ${username} --if-exists ${dbName}`
            : `PGPASSWORD=${password} dropdb -h ${host} -p ${port} -U ${username} --if-exists ${dbName}`;

        console.log('Dropping existing database...');
        await execCommand(dropDbCommand, isWindows);

        const createDbCommand = isWindows
            ? `set PGPASSWORD=${password}&& createdb -h ${host} -p ${port} -U ${username} ${dbName}`
            : `PGPASSWORD=${password} createdb -h ${host} -p ${port} -U ${username} ${dbName}`;

        console.log('Creating fresh database...');
        await execCommand(createDbCommand, isWindows);

        // Restore the database
        const restoreCommand = isWindows
            ? `set PGPASSWORD=${password}&& psql -h ${host} -p ${port} -U ${username} -d ${dbName} -f "${tempFilePath}"`
            : `PGPASSWORD=${password} psql -h ${host} -p ${port} -U ${username} -d ${dbName} -f "${tempFilePath}"`;

        console.log('Restoring database from backup...');
        await execCommand(restoreCommand, isWindows);

        // Clean up
        const cleanupCommand = isWindows ? `del "${tempFilePath}"` : `rm "${tempFilePath}"`;
        await execCommand(cleanupCommand, isWindows);

        console.log('Database restore completed successfully');

        return NextResponse.json({ 
            success: true, 
            message: 'Database restored successfully' 
        });

    } catch (error) {
        console.error('Restore failed:', error);
        
        // Attempt to clean up temp file if it exists
        if (tempFilePath) {
            try {
                const cleanupCommand = isWindows ? `del "${tempFilePath}"` : `rm "${tempFilePath}"`;
                await execCommand(cleanupCommand, isWindows);
            } catch (cleanupError) {
                console.error('Failed to clean up temporary file:', cleanupError);
            }
        }

        return NextResponse.json(
            { 
                error: 'Failed to restore database', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}