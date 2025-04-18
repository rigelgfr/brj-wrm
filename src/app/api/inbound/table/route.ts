export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const inbounds = await prisma.inbound.findMany({
      orderBy: {
        no: "asc"
      },
      select: {
        no: true,
        wh_name: true,
        area: true,
        inbound_date: true,
        gate_in: true,
        inbound_doc_type: true,
        inbound_doc: true,
        receiving_doc: true,
        customer_name: true,
        shipper_name: true,
        bl_do: true,
        aju_no: true,
        truck_type: true,
        plat_no: true,
        container_no: true,
        seal_no: true,
        item_code: true,
        item_name: true,
        qty: true,
        uom: true,
        nett_weight: true,
        gross_weight: true,
        volume: true,
        batch: true,
        npe_no: true,
        npe_date: true,
        peb_no: true,
        peb_date: true,
        remark: true,
        dock_no: true,
        doc_status: true,
        user_admin: true,
        start_tally: true,
        finish_tally: true,
        user_tally: true,
        start_putaway: true,
        finish_putaway: true,
        user_putaway: true,
        id: true,
        year: true,
        month: true,
        week_no: true,
        week_in_month: true,
        leadtime_unload: true,
        leadtime_put: true,
      },
    });

    const formattedData = inbounds.map(item => ({
      ...item,
      nett_weight: item.nett_weight ? Number(item.nett_weight) : null,
      gross_weight: item.gross_weight ? Number(item.gross_weight) : null,
      volume: item.volume ? Number(item.volume) : null,
      leadtime_unload: item.leadtime_unload ? Number(item.leadtime_unload) : null,
      leadtime_put: item.leadtime_put ? Number(item.leadtime_put) : null,
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
