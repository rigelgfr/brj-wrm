// inbound/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Inbound, columns } from "./columns";
import { DataTable } from "@/components/DataTable";
import Loading from "@/components/ui/Loading";

export default function InboundPage() {
  const [data, setData] = useState<Inbound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const inboundOutboundFilters = [
    { id: "area", placeholder: "Filter warehouse..." },
    { id: "customer_name", placeholder: "Filter customer..." },
    { id: "shipper_name", placeholder: "Filter shipper..." },
    { id: "item_name", placeholder: "Filter item..." },
  ];

  // Fetch inbound data on component mount
  const fetchInboundData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/inbound/table");
      if (!response.ok) {
        throw new Error("Failed to fetch inbound data");
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching inbound data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInboundData();
  }, [refreshTrigger]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
      <div className="flex-none">
        <p className="text-xl font-bold text-green-krnd">Inbound</p>
      </div>
        {isLoading ? (
          <div className="w-full h-[75vh] flex justify-center items-center">
            <Loading />
          </div>
          ) : (
          <div className="flex-1 min-h-0">
            <DataTable
              columns={columns}
              data={data}
              onRefresh={handleRefresh}
              filters={inboundOutboundFilters}
              isInbound={true}
            />
          </div>
        )}
    </div>
  );
}
