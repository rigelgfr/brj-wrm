"use client";

import Heading from "@/components/ui/Heading";
import { TruckCountChart, LeadtimeTable, useTruckStats } from "./data";
import { Truck } from "lucide-react";

export default function TruckPage() {
    const { data, loading, error } = useTruckStats();

    if (error) return <div>Error: {error}</div>;
    if (!data?.success && !loading) return <div>No data available</div>;

    return (
        <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
            <Heading text="Truck" Icon={Truck} />
            <div className="flex-1 min-h-0 space-y-4">
                <TruckCountChart data={data?.data ?? {}} loading={loading} />
                <LeadtimeTable data={data?.data ?? {}} loading={loading} />
            </div>
        </div>
    );
}