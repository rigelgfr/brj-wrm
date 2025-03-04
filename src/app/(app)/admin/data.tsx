// admin/data.tsx
'use client'

import { useEffect, useState, useCallback } from "react";
import { UsersTable } from "@/components/Tables";
import { User, columns } from "./columns";
import Loading from "@/components/ui/Loading";
import { FilterConfig } from "@/components/types";
import { Users } from "lucide-react";
import Heading from "@/components/ui/Heading";

export default function AdminPage() {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const usersFilters: FilterConfig[] = [
    { 
      id: "username", 
      placeholder: "Username",
      type: 'text',
      isPrimary: true
    },
    {
      id: "email",
      placeholder: "Email",
      type: 'text'
    },
    {
      id: "created_at",
      placeholder: "Created At",
      type: "dateRange",
    }
  ];

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
      <div className="mx-[1em] p-4 flex flex-col space-y-4">
        <Heading text="Users" Icon={Users} />
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-[75vh]">
              <Loading />
            </div>
          ) : (
            <UsersTable
              columns={columns}
              data={data}
              onRefresh={handleRefresh}
              filters={usersFilters}
              showAddUser={true}
            />
          )}
        </div>
      </div>
  );
}