// Create api/inbound/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { prisma } from '@/src/lib/prisma';

// Helper function to process CSV data similar to your Python script
const processCSVData = async (csvData: any[]) => {
  return csvData.map(row => {
    // Process numeric fields
    const numericFields = ['NETT WEIGHT', 'GROSS WEIGHT', 'VOLUME'];
    numericFields.forEach(field => {
      if (row[field]) {
        row[field] = row[field].replace(/,/g, '');
        row[field] = row[field] || '0';
      }
    });

    // Process date fields
    const dateFields = [
      'NPE DATE', 'PEB DATE', 'START TALLY', 
      'FINISH TALLY', 'START PUTAWAY', 'FINISH PUTAWAY'
    ];
    const defaultDate = '2024-01-01T00:00:00Z';
    
    dateFields.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        row[field] = defaultDate;
      }
    });

    return row;
  }).filter(row => row['AREA'] && row['AREA'].trim() !== '');
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    // Read file contents
    const fileBuffer = await file.arrayBuffer();
    const fileContent = new TextDecoder().decode(fileBuffer);

    // Parse CSV
    const records: any[] = [];
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    for await (const record of parser) {
      records.push(record);
    }

    // Process the data
    const processedData = await processCSVData(records);

    // Insert into database using Prisma transaction
    await prisma.$transaction(async (tx) => {
      for (const row of processedData) {
        await tx.inbound.create({
          data: {
            // Map your CSV columns to your database schema
            area: row['AREA'],
            inbound_date: new Date(row['INBOUND DATE']),
            // ... map other fields
          },
        });
      }
    });

    return NextResponse.json({ 
      message: 'File processed successfully',
      recordCount: processedData.length 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse('Error processing file', { status: 500 });
  }
}