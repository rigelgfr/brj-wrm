// admin/data.tsx
'use client'

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/DataTable";
import { Users, columns } from "./columns";
import Loading from "@/components/ui/Loading";

export default function AdminPage() {
  const [data, setData] = useState<Users[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchUsersData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/table");
      if (!response.ok) {
        throw new Error("Failed to fetch inbound data");
      }
      const result = await response.json();
      setData(result);
      console.log("Fetched data:", result);
    } catch (error) {
      console.error("Error fetching inbound data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, [refreshTrigger]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
      <div className="mx-auto p-4 flex flex-col space-y-4 bg-white">
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-[75vh]">
              <Loading />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data}
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </div>
  );
}