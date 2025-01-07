// api/inbound/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse';
import { prisma } from '@/src/lib/prisma';
import { updateInboundAggregates } from '../../operation_in/update/route';

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

// Helper function to process inbound date with specific format (DD-Mon-YYYY)
const processInboundDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr || dateStr.trim() === '') {
    return new Date('2024-01-01');
  }
  try {
    // Parse date in DD-Mon-YYYY format
    const [day, month, year] = dateStr.split('-');
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    // Create date using UTC to avoid timezone offset
    return new Date(Date.UTC(
      parseInt(year),
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

const processCSVData = (csvData: any[]) => {
  return csvData
    // Filter out rows with empty AREA
    .filter(row => row['AREA'] && row['AREA'].trim() !== '')
    .map(row => ({
      // Primary key - convert to number
      no: parseInt(row['NO'], 10) || 0,
      
      // String fields
      wh_name: row['WH NAME'] || '',
      area: row['AREA'],
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
    }));
};

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
    
    const records: any[] = [];
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    for await (const record of parser) {
      records.push(record);
    }

    // Process the CSV data
    const processedData = processCSVData(records);

    // Insert into database using Prisma transaction
    await prisma.$transaction(async (tx) => {
      for (const row of processedData) {
        await tx.inbound.create({ data: row });
      }
    });

    try {
      const result = await updateInboundAggregates();
      console.log('Aggregate update result:', result);
    } catch (error) {
      console.error('Error updating aggregates:', error);
    }
    
    return NextResponse.json({
      message: 'CSV file processed successfully',
      recordCount: processedData.length
    });

  } catch (error) {
    console.error('Error processing CSV file:', error);
    return new NextResponse(
      'Error processing CSV file', 
      { status: 500 }
    );
  }
}