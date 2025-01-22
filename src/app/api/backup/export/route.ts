// app/api/backup/export/route.ts
export const dynamic = 'force-dynamic';

import { exec } from 'child_process';
import { promisify } from 'util';
import { NextResponse } from 'next/server';

const execAsync = promisify(exec);

export async function POST() {
    try {
        // Get database connection details from environment variables
        const {
            DATABASE_URL = '',
        } = process.env;

        // Parse connection URL to get credentials
        const url = new URL(DATABASE_URL);
        const dbName = url.pathname.slice(1);
        const host = url.hostname;
        const port = url.port;
        const username = url.username;
        const password = url.password;

        // Check if running on Windows
        const isWindows = process.platform === 'win32';

        // Create pg_dump command based on platform
        let command;
        if (isWindows) {
            command = `set PGPASSWORD=${password}&& pg_dump -h ${host} -p ${port} -U ${username} -F p ${dbName}`;
        } else {
            command = `PGPASSWORD=${password} pg_dump -h ${host} -p ${port} -U ${username} -F p ${dbName}`;
        }

        // Execute pg_dump with increased buffer size (100MB)
        const { stdout, stderr } = await execAsync(command, {
            shell: isWindows ? 'cmd.exe' : '/bin/sh',
            maxBuffer: 100 * 1024 * 1024 // 100MB buffer
        });

        if (stderr) {
            console.error('pg_dump stderr:', stderr);
            if (stderr.toLowerCase().includes('error')) {
                throw new Error(stderr);
            }
        }

        // Return the SQL dump as a downloadable file
        const headers = new Headers();
        headers.append('Content-Type', 'application/sql');
        headers.append('Content-Disposition', 'attachment; filename=backup.sql');

        return new NextResponse(stdout, {
            status: 200,
            headers,
        });

    } catch (error: any) {
        console.error('Backup failed:', error);
        return NextResponse.json(
            { error: 'Failed to create backup', details: error.message },
            { status: 500 }
        );
    }
}