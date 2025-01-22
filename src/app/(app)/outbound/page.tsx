"use client";

import { useEffect, useState, useCallback } from "react";
import { Outbound, columns } from "./columns";
import { DataTable } from "@/components/DataTable";
import Loading from "@/components/ui/Loading";
import Heading from "@/components/ui/Heading";
import { ArrowDownToLine } from "lucide-react";

export default function OutboundPage() {
  const [data, setData] = useState<Outbound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const inboundOutboundFilters = [
    { id: "area", placeholder: "Filter warehouse..." },
    { id: "customer_name", placeholder: "Filter customer..." },
    { id: "shipper_name", placeholder: "Filter shipper..." },
    { id: "item_name", placeholder: "Filter item..." }
  ];

  // Fetch inbound data on component mount
  const fetchOutboundData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/outbound/table");
      if (!response.ok) {
        throw new Error("Failed to fetch outbound data");
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
    fetchOutboundData();
  }, [refreshTrigger]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
      <Heading text="Outbound" Icon={ArrowDownToLine} />
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="w-full h-[75vh] flex justify-center items-center">
            <Loading />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            onRefresh={handleRefresh}
            filters={inboundOutboundFilters}
            isInbound={false}
          />
        )}
        </div>
    </div>
  );
}
