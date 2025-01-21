"use client";

import { TruckCountChart, LeadtimeTable, useTruckStats } from "./data";

export default function TruckPage() {
    const { data, loading, error } = useTruckStats();

    if (error) return <div>Error: {error}</div>;
    if (!data?.success && !loading) return <div>No data available</div>;

    return (
        <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
             <div className="flex-none">
                <p className="text-xl font-bold text-green-krnd">Trucks</p>
            </div>
            <div className="flex-1 min-h-0 space-y-4">
                <TruckCountChart data={data?.data ?? {}} loading={loading} />
                <LeadtimeTable data={data?.data ?? {}} loading={loading} />
            </div>
        </div>
    );
}