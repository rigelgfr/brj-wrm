"use client";

import { useEffect, useState } from "react";
import { Inbound, columns } from "./columns";
import { DataTable } from "@/src/components/DataTable";
import Loading from "@/src/components/ui/Loading";

export default function InboundPage() {
  const [data, setData] = useState<Inbound[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch inbound data on component mount
  useEffect(() => {
    const fetchInboundData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/inbound");
        if (!response.ok) {
          throw new Error("Failed to fetch inbound data");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching inbound data:", error);
        setData([]); // Set empty data on failure
      } finally {
        setIsLoading(false);
      }
    };

    fetchInboundData();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loading /> {/* Display a loading indicator */}
      </div>
    );
  }

  return (
    <div className="mx-[2em] p-4 flex flex-col space-y-4 bg-white shadow-md">
      <div className="flex-none">
        <p className="text-xl font-bold text-green-krnd">Inbound</p>
      </div>
      <div className="flex-1 min-h-0">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
