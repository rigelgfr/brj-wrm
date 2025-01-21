export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const outbounds = await prisma.outbound.findMany({
      orderBy: {
        no: "asc"
      },
      select: {
        no: true,
        area: true,
        outbound_date: true,
        outbound_time: true,
        loading_date: true,
        outbound_doc_type: true,
        outbound_doc: true,
        picking_doc: true,
        loading_doc: true,
        customer_name: true,
        shipper_name: true,
        item_code: true,
        item_name: true,
        doc_qty: true,
        qty: true,
        uom: true,
        nett_weight: true,
        gross_weight: true,
        volume: true,
        batch: true,
        bl_do: true,
        aju_no: true,
        truck_type: true,
        truck_no: true,
        container_no: true,
        seal_no: true,
        vessel_name: true,
        voyage_no: true,
        destination: true,
        recipient: true,
        shipping_notes: true,
        remark: true,
        doc_status: true,
        user_admin: true,
        start_picking: true,
        finish_picking: true,
        user_picking: true,
        start_loading: true,
        finish_loading: true,
        user_loading: true,
        id: true,
        year: true,
        month: true,
        week_no: true,
        week_in_month: true,
        leadtime_picking: true,
        leadtime_load: true,
      },
    });

    const formattedData = outbounds.map(item => ({
      ...item,
      nett_weight: item.nett_weight ? Number(item.nett_weight) : null,
      gross_weight: item.gross_weight ? Number(item.gross_weight) : null,
      volume: item.volume ? Number(item.volume) : null,
      leadtime_unload: item.leadtime_picking ? Number(item.leadtime_picking) : null,
      leadtime_put: item.leadtime_load ? Number(item.leadtime_load) : null,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching inbound data:", error);
    return NextResponse.json(
      { error: "Failed to fetch inbound data" },
      { status: 500 }
    );
  }
}
