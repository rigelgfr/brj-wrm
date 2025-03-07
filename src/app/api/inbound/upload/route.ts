// api/inbound/upload/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse';
import { prisma } from '@/lib/prisma';
import { updateInboundAggregates } from '../../operations/in/update/utils';

interface CSVRow {
  'NO': string;
  'WH NAME': string;
  'AREA': string;
  'INBOUND DOC TYPE': string;
  'INBOUND DOC': string;
  'RECEIVING DOC': string;
  'CUSTOMER NAME': string;
  'SHIPPER NAME': string;
  'BL/DO': string;
  'AJU NO': string;
  'TRUCK TYPE': string;
  'PLAT NO': string;
  'CONTAINER NO': string;
  'SEAL NO': string;
  'ITEM CODE': string;
  'ITEM NAME': string;
  'QTY': string;
  'UOM': string;
  'NETT WEIGHT': string;
  'GROSS WEIGHT': string;
  'VOLUME': string;
  'BATCH': string;
  'NPE NO': string;
  'NPE DATE': string;
  'PEB NO': string;
  'PEB DATE': string;
  'REMARK': string;
  'DOCK NO': string;
  'DOC STATUS': string;
  'USER ADMIN': string;
  'START TALLY': string;
  'FINISH TALLY': string;
  'USER TALLY': string;
  'START PUTAWAY': string;
  'FINISH PUTAWAY': string;
  'USER PUTAWAY': string;
  'INBOUND DATE': string;
  'GATE IN': string;
}

interface ProcessedData {
  no?: number;
  wh_name: string;
  warehouses: {
    connect: {
      wh_name: string
    };
  };
  inbound_date: Date;  // We’ll handle this as a string for formatting
  gate_in: Date;
  inbound_doc_type: string;
  inbound_doc: string;
  receiving_doc: string;
  customer_name: string;
  shipper_name: string;
  bl_do: string;
  aju_no: string;
  truck_type: string;
  plat_no: string;
  container_no: string;
  seal_no: string;
  item_code: string;
  item_name: string;
  qty: number;
  uom: string;
  nett_weight: number;
  gross_weight: number;
  volume: number;
  batch: string;
  npe_no: string;
  npe_date: Date;
  peb_no: string;
  peb_date: Date;
  remark: string;
  dock_no: string;  
  doc_status: string;
  user_admin: string;
  start_tally: Date;
  finish_tally: Date;
  user_tally: string;
  start_putaway: Date;
  finish_putaway: Date;
  user_putaway: string;
}

// Helper function to convert string to number with comma handling
const processNumeric = (value: string | null | undefined): number => {
  if (!value || value.trim() === '') {
    return 0;
  }
  const cleaned = value.replace(/,/g, '');
  return parseFloat(cleaned) || 0;
};

// Helper function to process dates with default value
const processDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr || dateStr.trim() === '') {
    return new Date('2024-01-01');
  }
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date('2024-01-01') : date;
  } catch {
    return new Date('2024-01-01');
  }
};

// Enhanced helper function to process inbound date with multiple formats (DD-Mon-YYYY or DD-Mmm-YY)
const processInboundDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr || dateStr.trim() === '') {
    return new Date('2024-01-01');
  }
  
  try {
    // Parse date in either DD-Mon-YYYY or DD-Mmm-YY format
    const [day, month, yearPart] = dateStr.split('-');
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    // Handle both YY and YYYY formats
    let year: number;
    if (yearPart.length === 2) {
      // If YY format, convert to full year (assuming 20xx for simplicity)
      year = 2000 + parseInt(yearPart);
    } else {
      year = parseInt(yearPart);
    }
    
    // Create date using UTC to avoid timezone offset
    return new Date(Date.UTC(
      year,
      monthMap[month],
      parseInt(day),
      0, 0, 0
    ));
  } catch {
    return new Date('2024-01-01');
  }
};

// Helper function to process time values and convert to DateTime
const processTime = (timeStr: string | null | undefined): Date => {
  if (!timeStr || timeStr.trim() === '') {
    return new Date('2024-01-01T00:00:00.000Z');
  }
  try {
    // Create a base date and set the time components
    const baseDate = new Date('2024-01-01');
    const [hours, minutes, seconds = '00'] = timeStr.split(':');
    baseDate.setHours(parseInt(hours, 10));
    baseDate.setMinutes(parseInt(minutes, 10));
    baseDate.setSeconds(parseInt(seconds, 10));
    return baseDate;
  } catch {
    return new Date('2024-01-01T00:00:00.000Z');
  }
};

// Helper function to process timestamps
const processTimestamp = (timestampStr: string | null | undefined): Date => {
  if (!timestampStr || timestampStr.trim() === '') {
    return new Date('2024-01-01 00:00:00');
  }
  try {
    const timestamp = new Date(timestampStr);
    return isNaN(timestamp.getTime()) ? new Date('2024-01-01 00:00:00') : timestamp;
  } catch {
    return new Date('2024-01-01 00:00:00');
  }
};

const processCSVData = (csvData: CSVRow[]): Omit<ProcessedData, 'no'>[] => {
  return csvData
    .filter(row => row['AREA'] && row['AREA'].trim() !== '')
    .map(row => {
      // Create the processed data object WITHOUT the 'no' field
      const processedRow = {
        wh_name: row['WH NAME'] || '',
        warehouses: {
          connect: {
            wh_name: row['AREA'] || ''
          }
        },
        inbound_doc_type: row['INBOUND DOC TYPE'] || '',
        inbound_doc: row['INBOUND DOC'] || '',
        receiving_doc: row['RECEIVING DOC'] || '',
        customer_name: row['CUSTOMER NAME'] || '',
        shipper_name: row['SHIPPER NAME'] || '',
        bl_do: row['BL/DO'] || '',
        aju_no: row['AJU NO'] || '',
        truck_type: row['TRUCK TYPE'] || '',
        plat_no: row['PLAT NO'] || '',
        container_no: row['CONTAINER NO'] || '',
        seal_no: row['SEAL NO'] || '',
        item_code: row['ITEM CODE'] || '',
        item_name: row['ITEM NAME'] || '',
        uom: row['UOM'] || '',
        batch: row['BATCH'] || '',
        npe_no: row['NPE NO'] || '',
        peb_no: row['PEB NO'] || '',
        remark: row['REMARK'] || '',
        dock_no: row['DOCK NO'] || '',
        doc_status: row['DOC STATUS'] || '',
        user_admin: row['USER ADMIN'] || '',
        user_tally: row['USER TALLY'] || '',
        user_putaway: row['USER PUTAWAY'] || '',
        
        // Numeric fields with comma handling
        qty: parseInt(row['QTY'], 10) || 0,
        nett_weight: processNumeric(row['NETT WEIGHT']),
        gross_weight: processNumeric(row['GROSS WEIGHT']),
        volume: processNumeric(row['VOLUME']),
        
        // Date fields - using specific format for inbound_date
        inbound_date: processInboundDate(row['INBOUND DATE']),
        npe_date: processDate(row['NPE DATE']),
        peb_date: processDate(row['PEB DATE']),
        
        // Time field (converted to DateTime)
        gate_in: processTime(row['GATE IN']),
        
        // Timestamp fields
        start_tally: processTimestamp(row['START TALLY']),
        finish_tally: processTimestamp(row['FINISH TALLY']),
        start_putaway: processTimestamp(row['START PUTAWAY']),
        finish_putaway: processTimestamp(row['FINISH PUTAWAY'])
      };

      return processedRow;
    });
};

const BATCH_SIZE = 100; // Adjust based on your needs

async function processBatch(batch: Omit<ProcessedData, 'no'>[]) {
  return await prisma.$transaction(async (tx) => {
    const promises = batch.map(row => 
      tx.inbound.create({
        data: row  // Now the data won't include 'no', triggering auto-increment
      })
    );
    return await Promise.all(promises);
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    // Read and parse the CSV file
    const fileBuffer = await file.arrayBuffer();
    const fileContent = new TextDecoder().decode(fileBuffer);
    
    const records: CSVRow[] = [];
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    for await (const record of parser) {
      records.push(record);
    }

    // Process the CSV data
    const processedData = processCSVData(records);
    
    // Process in batches
    const batches = [];
    for (let i = 0; i < processedData.length; i += BATCH_SIZE) {
      batches.push(processedData.slice(i, i + BATCH_SIZE));
    }

    let processedCount = 0;
    let failedBatches = 0;

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      try {
        await processBatch(batches[i]);
        processedCount += batches[i].length;
        console.log(`Processed batch ${i + 1}/${batches.length}: ${processedCount} records complete`);
      } catch (error) {
        failedBatches++;
        console.error(`Error in batch ${i + 1}:`, error);
        // Continue processing other batches even if one fails
      }
    }

    // Update aggregates after all batches are processed
    try {
      const result = await updateInboundAggregates();
      console.log('Aggregate update result:', result);
    } catch (error) {
      console.error('Error updating aggregates:', error);
    }
    
    // Return response with detailed statistics
    return NextResponse.json({
      message: 'CSV file processing complete',
      totalRecords: processedData.length,
      processedRecords: processedCount,
      failedBatches,
      totalBatches: batches.length,
      success: failedBatches === 0
    });

  } catch (error) {
    console.error('Error processing CSV file:', error);
    return new NextResponse(
      'Error processing CSV file', 
      { status: 500 }
    );
  }
}