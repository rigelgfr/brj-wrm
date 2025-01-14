import { InventoryTables } from "./columns";

export default function InventoryPage() {
  return (
    <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
          <div className="flex-none">
            <p className="text-xl font-bold text-green-krnd">Inventory</p>
          </div>
          <div className="flex-1 min-h-0">
            <InventoryTables />
          </div>
        </div>
  );
}