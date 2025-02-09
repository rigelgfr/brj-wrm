import * as React from "react"
import { useState } from "react"
import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Filter, ChevronDown, ChevronUp } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FilterConfig } from "./types"

interface DataTableFilterProps<TData> {
  table: Table<TData>
  filters: FilterConfig[]
  onReset: () => void
}

export function DataTableFilter<TData>({
  table,
  filters,
  onReset,
}: DataTableFilterProps<TData>) {
  const [isExpanded, setIsExpanded] = useState(false);

  const primaryFilters = filters.filter(f => f.isPrimary);
  const secondaryFilters = filters.filter(f => !f.isPrimary);

  const renderFilter = (filter: FilterConfig) => {
    if (filter.type === 'select' && filter.options) {
      return (
        <Select
          onValueChange={(value) =>
            table.getColumn(filter.id)?.setFilterValue(value)
          }
          value={(table.getColumn(filter.id)?.getFilterValue() as string) ?? ""}
        >
          <SelectTrigger className={filter.width ? filter.width : "w-[180px]"}>
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        placeholder={filter.placeholder}
        value={(table.getColumn(filter.id)?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn(filter.id)?.setFilterValue(event.target.value)
        }
        className={filter.width ? filter.width : "w-[180px]"}
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Primary Filters - Always Visible */}
      <div className="flex items-center space-x-2">
        {primaryFilters.map((filter) => (
          <div key={filter.id} className="flex-shrink-0">
            {renderFilter(filter)}
          </div>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2"
        >
          <Filter className="h-4 w-4" />
          {isExpanded ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Secondary Filters - Expandable */}
      <div
        className={`grid gap-4 transition-all duration-200 ease-in-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            {secondaryFilters.map((filter) => (
              <div key={filter.id}>
                {renderFilter(filter)}
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
              className="text-darkgrey-krnd"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}