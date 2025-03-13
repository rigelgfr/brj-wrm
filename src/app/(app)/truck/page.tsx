"use client";

import Heading from "@/components/ui/Heading";
import { TruckDashboard } from "./data";
import { Truck } from "lucide-react";

export default function TruckPage() {
    return (
        <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
            <Heading text="Truck" Icon={Truck} />
            <div className="flex-1 min-h-0">
                <TruckDashboard />
            </div>
        </div>
    );
}