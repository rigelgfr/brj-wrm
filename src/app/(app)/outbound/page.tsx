import { Outbound, columns } from "./columns";
import { DataTable } from "@/src/components/DataTable";
import { prisma } from "@/src/lib/prisma"; // assuming you have a prisma client setup

// Fetch data from your Prisma database
async function getData(): Promise<Outbound[]> {
  const data = await prisma.outbound.findMany({
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
    },
  });

  return data.map(item => ({
    ...item,

    nett_weight: item.nett_weight ? Number(item.nett_weight) : null,
    gross_weight: item.gross_weight ? Number(item.gross_weight) : null,
    volume: item.volume ? Number(item.volume) : null,
  }));

}

export default async function OutboundPage() {
  const data = await getData();

  return (
    <div className="mx-[2em] p-4 flex flex-col space-y-4 bg-white shadow-md">
      <div className="flex-none">
        <p className="text-xl font-bold text-green-krnd">Outbound</p>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable columns={columns} data={data} />
      </div>

    </div>
  );
}
