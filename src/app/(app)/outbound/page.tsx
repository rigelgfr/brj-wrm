"use client";

import { useEffect, useState, useCallback } from "react";
import { Outbound, columns } from "./columns";
import { DataTable } from "@/components/Tables";
import Loading from "@/components/ui/Loading";
import Heading from "@/components/ui/Heading";
import { ArrowDownToLine } from "lucide-react";
import { FilterConfig } from "@/components/types";

export default function OutboundPage() {
  const [data, setData] = useState<Outbound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const outboundFilters: FilterConfig[] = [
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
        id: "outbound_date",
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
        type: 'checkboxAuto',
        columnAccessor: "year",
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
        type: "checkboxAuto",
        placeholder: "W",
        columnAccessor: "week_in_month",
      },
      {
        id: "outbound_doc_type",
        type: "checkboxAuto",
        placeholder: "Doc Type",
        columnAccessor: "outbound_doc_type",
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

  // Fetch outbound data on component mount
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

  const handleBatchDelete = async (ids: string[]) => {
    setIsLoading(true);
    try {
      // Convert ids to numbers if your backend expects numeric IDs
      const response = await fetch("/api/outbound/delete/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to delete records");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting records:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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
            filters={outboundFilters}
            isInbound={false}
            onBatchDelete={handleBatchDelete}
          />
        )}
        </div>
    </div>
  );
}
