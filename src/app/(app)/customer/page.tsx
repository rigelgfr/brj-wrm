import Heading from "@/components/ui/Heading";
import { Users } from "lucide-react";
import { TrendTable } from "./data";

export default function CustomerPage() {
    return (
        <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
          <Heading text="Client Trend" Icon={Users} />
              <div className="flex-1 min-h-0">
                <TrendTable />
              </div>
        </div>
      );
}