// inbound/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Inbound, columns } from "./columns";
import { DataTable } from "@/components/DataTable";
import Loading from "@/components/ui/Loading";
import Heading from "@/components/ui/Heading";
import { ArrowDownToLine } from "lucide-react";
import { FilterConfig } from "@/components/types";

export default function InboundPage() {
  const [data, setData] = useState<Inbound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // In your page.tsx, update the filters configuration:
  const inboundOutboundFilters: FilterConfig[] = [
    { 
      id: "area", 
      placeholder: "Filter warehouse...", 
      type: 'multiSelect',
      options: [
        { value: 'CFS', label: 'CFS' },
        { value: 'FREEZONE AB', label: 'FZ AB' },
        { value: 'FREEZONE BRJ', label: 'FZ BRJ' },
        { value: 'GB', label: 'BONDED' },
        { value: 'PLB', label: 'PLB' },
      ],
      isPrimary: true 
    },
    {
      id: "inbound_date",
      placeholder: "Date range...",
      type: 'dateRange',
      isPrimary: true,
    },
    { 
      id: "customer_name", 
      placeholder: "Filter customer...",
      type: 'text',
    },
    { 
      id: "shipper_name", 
      placeholder: "Filter shipper...",
      type: 'text',
    },
    { 
      id: "item_name", 
      placeholder: "Filter item...",
      type: 'text',
    },
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
      <Heading text="Inbound" Icon={ArrowDownToLine} />
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
