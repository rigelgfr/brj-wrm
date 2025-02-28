// inbound/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Inbound, columns } from "./columns";
import { DataTable } from "@/components/Tables";
import Loading from "@/components/ui/Loading";
import Heading from "@/components/ui/Heading";
import { ArrowDownToLine } from "lucide-react";
import { FilterConfig } from "@/components/types";

export default function InboundPage() {
  const [data, setData] = useState<Inbound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const inboundOutboundFilters: FilterConfig[] = [
    { 
      id: "area", 
      placeholder: "WH Type", 
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
      placeholder: "Date range",
      type: 'dateRange',
      isPrimary: true,
    },
    {
      id: "customer_name",
      type: "searchDropdown",
      placeholder: "Customer",
      columnAccessor: "customer_name"  // The name of the column in your data to extract values from
    },
    { 
      id: "shipper_name", 
      placeholder: "Shipper",
      type: 'searchDropdown',
      columnAccessor: "shipper_name",
    },
    { 
      id: "item_name", 
      placeholder: "Item",
      type: 'text',
    },
    { 
      id: "year", 
      placeholder: "Year", 
      type: 'multiSelect',
      options: [
        { value: '2023', label: '2023' },
        { value: '2024', label: '2024' },
      ], 
    },
    {
      id: "month",
      type: "multiSelectAuto",
      placeholder: "Month",
      columnAccessor: "month",
    },
    { 
      id: "week_no", 
      placeholder: "Week in Year",
      type: 'multiSelectAuto',
      columnAccessor: "week_no",
    },
    {
      id: "week_in_month",
      type: "multiSelectAuto",
      placeholder: "Week in Month",
      columnAccessor: "week_in_month",
    },
    {
      id: "inbound_doc_type",
      type: "multiSelectAuto",
      placeholder: "Doc Type",
      columnAccessor: "inbound_doc_type",
    },
    {
      id: "uom",
      type: "multiSelectAuto",
      placeholder: "UOM",
      columnAccessor: "uom",
    },
    {
      id: "truck_type",
      type: "searchDropdown",
      placeholder: "Truck Type",
      columnAccessor: "truck_type",
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
          <div className="w-full h-full flex justify-center items-center">
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
