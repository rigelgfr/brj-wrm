// app/api/outbound/edit/route.ts
export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateOutboundAggregates } from "../../operation_out/update/utils";

const EDITABLE_COLUMNS = [
  "area",
  "outbound_date",
  "outbound_time",
  "loading_date",
  "outbound_doc_type",
  "outbound_doc",
  "picking_doc",
  "loading_doc",
  "customer_name",
  "shipper_name",
  "item_code",
  "item_name",
  "doc_qty",
  "qty",
  "uom",
  "nett_weight",
  "gross_weight",
  "volume",
  "batch",
  "bl_do",
  "aju_no",
  "truck_type",
  "truck_no",
  "container_no",
  "seal_no",
  "vessel_name",
  "voyage_no",
  "destination",
  "recipient",
  "shipping_notes",
  "remark",
  "doc_status",
  "user_admin",
  "start_picking",
  "finish_picking",
  "user_picking",
  "start_loading",
  "finish_loading",
  "user_loading",
] as const;

type EditableColumn = typeof EDITABLE_COLUMNS[number];

// Helper function to format date fields
const formatDateValue = (key: string, value: any): Date | string | null => {
  if (!value) return null;

  try {
    // For date-only fields (YYYY-MM-DD)
    if (key.endsWith('_date')) {
      const date = new Date(value);
      return new Date(date.toISOString().split('T')[0]);
    }
    
    // For time-only field (HH:mm)
    if (key === 'outbound_time') {
      // Combine with current date to create a valid time
      const [hours, minutes] = value.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return value; // Return as HH:mm string for Prisma Time field
    }
    
    // For timestamp fields (YYYY-MM-DD HH:mm:ss)
    if (key.startsWith('start_') || key.startsWith('finish_')) {
      return new Date(value);
    }

    return value;
  } catch (error) {
    console.error(`Error formatting date for ${key}:`, error);
    return null;
  }
};

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { no, ...updateData } = body;

    // Filter out any non-editable fields and format date/time values
    const filteredUpdateData = Object.entries(updateData).reduce((acc, [key, value]) => {
      if (EDITABLE_COLUMNS.includes(key as EditableColumn)) {
        if (
          key.endsWith('_date') || 
          key === 'outbound_time' || 
          key.startsWith('start_') || 
          key.startsWith('finish_')
        ) {
          const formattedValue = formatDateValue(key, value);
          if (formattedValue !== null) {
            acc[key] = formattedValue;
          }
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    // Update the outbound record using Prisma
    const updatedOutbound = await prisma.outbound.update({
      where: {
        no: parseInt(no)
      },
      data: filteredUpdateData,
      select: {
        no: true,
        area: true,
        year: true,
        month: true,
        week_in_month: true,
        volume: true
      }
    });

    try {
      const result = await updateOutboundAggregates();
      console.log('Aggregate update result:', result);
    } catch (error) {
      console.error('Error updating aggregates:', error);
    }

    return NextResponse.json(updatedOutbound);
  } catch (error) {
    console.error("[OUTBOUND_EDIT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}