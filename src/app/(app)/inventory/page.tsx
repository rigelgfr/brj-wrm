import Heading from "@/components/ui/Heading";
import { InventoryTables } from "./columns";
import { Database } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
          <Heading text="Inventory" Icon={Database} />
          <div className="flex-1 min-h-0">
            <InventoryTables />
          </div>
        </div>
  );
}