import { Inbound, columns } from "./columns";
import { DataTable } from "@/src/components/DataTable";
import { prisma } from "@/src/lib/prisma"; // assuming you have a prisma client setup

// Fetch data from your Prisma database
async function getData(): Promise<Inbound[]> {
  const data = await prisma.inbound.findMany({
    select: {
      no: true,
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
    },
  });

  return data.map(item => ({
    ...item,

    nett_weight: item.nett_weight ? Number(item.nett_weight) : null,
    gross_weight: item.gross_weight ? Number(item.gross_weight) : null,
    volume: item.volume ? Number(item.volume) : null,
  }));

}

export default async function InboundPage() {
  const data = await getData();

  return (

    <div className="mx-[2em] p-4 flex flex-col space-y-4 bg-white shadow-md">
      <div className="flex-none">
        <p className="text-xl font-bold text-green-krnd">Inbound</p>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable columns={columns} data={data} />
      </div>

    </div>
  );
}
