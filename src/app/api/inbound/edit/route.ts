// app/api/inbound/edit/route.ts
export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateInboundAggregates } from "../../operation_in/update/utils";

const EDITABLE_COLUMNS = [
  "area",
  "inbound_date",
  "gate_in",
  "inbound_doc_type",
  "inbound_doc",
  "receiving_doc",
  "customer_name",
  "shipper_name",
  "item_code",
  "item_name",
  "qty",
  "uom",
  "nett_weight",
  "gross_weight",
  "volume",
  "batch",
  "npe_no",
  "npe_date",
  "peb_no",
  "peb_date",
  "bl_do",
  "aju_no",
  "truck_type",
  "plat_no",
  "container_no",
  "remark",
  "dock_no",
  "doc_status",
  "user_admin",
  "start_tally",
  "finish_tally",
  "user_tally",
  "start_putaway",
  "finish_putaway",
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
    if (key === 'gate_in') {
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
          key === 'gate_in' || 
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

    // Update the inbound record using Prisma
    const updatedInbound = await prisma.inbound.update({
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
      const result = await updateInboundAggregates();
      console.log('Aggregate update result:', result);
    } catch (error) {
      console.error('Error updating aggregates:', error);
    }

    return NextResponse.json(updatedInbound);
  } catch (error) {
    console.error("[INBOUND_EDIT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}