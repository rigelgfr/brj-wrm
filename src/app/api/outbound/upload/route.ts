// api/inbound/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse';
import { prisma } from '@/src/lib/prisma';
import { updateOutboundAggregates } from '../../operation_out/update/route';

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

// Helper function to process date with format "DD Mon YYYY" (e.g., "01 Jan 2024")
const processOutboundDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr || dateStr.trim() === '') {
    return new Date('2024-01-01');
  }
  try {
    // Parse date in "DD Mon YY" format (e.g., "01 Jan 24")
    const [day, month, shortYear] = dateStr.split(' ');
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    // Convert 2-digit year to 4-digit year (assuming 20XX for now)
    const fullYear = 2000 + parseInt(shortYear);
    
    // Create date using UTC to avoid timezone offset
    return new Date(Date.UTC(
      fullYear,
      monthMap[month],
      parseInt(day),
      0, 0, 0
    ));
  } catch (error) {
    console.error('Error processing date:', dateStr, error);
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

       // Remove the direct area field and add the relation
       warehouses: {
        connect: {
          wh_name: row['AREA'] || ''
        }
      },

      outbound_doc_type: row['OUTBOUND DOC TYPE'] || '',
      outbound_doc: row['OUTBOUND DOC'] || '',
      picking_doc: row['PICKING DOC'] || '',
      loading_doc: row['LOADING DOC'] || '',
      customer_name: row['CUSTOMER NAME'] || '',
      shipper_name: row['SHIPPER NAME'] || '',
      item_code: row['ITEM CODE'] || '',
      item_name: row['ITEM NAME'] || '',
      uom: row['UOM'] || '',
      batch: row['BATCH'] || '',
      bl_do: row['BL/DO'] || '',
      aju_no: row['AJU NO'] || '',
      truck_type: row['TRUCK TYPE'] || '',
      truck_no: row['TRUCK NO'] || '',
      container_no: row['CONTAINER NO'] || '',
      seal_no: row['SEAL NO'] || '',
      vessel_name: row['VESSEL NAME'] || '',
      voyage_no: row['VOYAGE NO'] || '',
      destination: row['DESTINATION'] || '',
      recipient: row['RECIPIENT'] || '',
      shipping_notes: row['SHIPPING NOTES'] || '',
      remark: row['REMARK'] || '',
      doc_status: row['DOC STATUS'] || '',
      user_admin: row['USER ADMIN'] || '',
      user_picking: row['USER PICKING'] || '',
      user_loading: row['USER LOADING'] || '',
      
      // Numeric fields with comma handling
      doc_qty: parseInt(row['DOC QTY'], 10) || 0,
      qty: parseInt(row['QTY'], 10) || 0,
      nett_weight: processNumeric(row['NETT WEIGHT']),
      gross_weight: processNumeric(row['GROSS WEIGHT']),
      volume: processNumeric(row['VOLUME']),
      
      // Date fields - using specific format for inbound_date
      outbound_date: processOutboundDate(row['OUTBOUND DATE']),
      loading_date: processDate(row['LOADING DATE']),
      
      // Time field (converted to DateTime)
      outbound_time: processTime(row['OUTBOUND_TIME']),
      
      // Timestamp fields
      start_picking: processTimestamp(row['START PICKING']),
      finish_picking: processTimestamp(row['FINISH PICKING']),
      start_loading: processTimestamp(row['START LOADING']),
      finish_loading: processTimestamp(row['FINISH LOADING'])
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
        await tx.outbound.create({ data: row });
      }
    });

    try {
      const result = await updateOutboundAggregates();
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