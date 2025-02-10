import * as React from "react"
import { useState } from "react"
import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Filter, ChevronDown, ChevronUp, Check } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DateTimePicker } from "./ui/datetime-picker"
import { FilterConfig } from "./types"

interface DataTableFilterProps<TData> {
  table: Table<TData>
  filters: FilterConfig[]
  onReset: () => void
}

interface DateRangeFilterProps {
  value: { from: Date | undefined; to: Date | undefined }
  onChange: (dates: { from: Date | undefined; to: Date | undefined }) => void
  placeholder: string
  className?: string
}

function MultiSelectFilter({
  options,
  value,
  onChange,
  placeholder,
  className,
}: {
  options: { value: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const selectedLabels = options
    .filter(option => value.includes(option.value))
    .map(option => option.label)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : value.length === 1 ? (
            selectedLabels[0]
          ) : (
            `${selectedLabels[0]} +${value.length - 1}`
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0" 
        align="start"
        style={{ width: 'var(--radix-popover-trigger-width)' }} // This line makes it match the trigger width
      >
        <div className="flex flex-wrap gap-1 p-2">
          {options.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              className={cn(
                "flex items-center justify-between border-2 transition-colors w-full",
                value.includes(option.value)
                  ? "border-green-krnd bg-green-50 text-green-krnd"
                  : "border-gray-200 hover:border-green-krnd hover:bg-green-50"
              )}
              onClick={() => toggleOption(option.value)}
            >
              <span>{option.label}</span>
              {value.includes(option.value) && (
                <Check className="h-4 w-4 text-green-krnd" />
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function DateRangeFilter({
  value,
  onChange,
  placeholder,
  className,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false)

  const formatDate = (date: Date | undefined) => {
    return date ? format(date, "MMM dd, yyyy") : ""
  }

  const displayValue = value.from || value.to
    ? `${formatDate(value.from)} - ${formatDate(value.to)}`
    : ""

  const commonProps = {
    hideTime: true,
    granularity: "day" as const,
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {displayValue || <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0"
        align="start"
      >
        <div className="flex space-x-4 p-3">
          <div>
            <div className="mb-2 text-sm font-medium">From</div>
            <DateTimePicker
              {...commonProps}
              value={value.from}
              onChange={(date) => onChange({ ...value, from: date })}
            />
          </div>
          <div>
            <div className="mb-2 text-sm font-medium">To</div>
            <DateTimePicker
              {...commonProps}
              value={value.to}
              onChange={(date) => onChange({ ...value, to: date })}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
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
    if (filter.type === 'multiSelect' && filter.options) {
      return (
        <MultiSelectFilter
          options={filter.options}
          value={(table.getColumn(filter.id)?.getFilterValue() as string[]) || []}
          onChange={(value) => table.getColumn(filter.id)?.setFilterValue(value)}
          placeholder={filter.placeholder}
          className={filter.width}
        />
      );
    }

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

    if (filter.type === 'dateRange') {
      return (
        <DateRangeFilter
          value={table.getColumn(filter.id)?.getFilterValue() as { from: Date, to: Date } || { from: undefined, to: undefined }}
          onChange={(value) => table.getColumn(filter.id)?.setFilterValue(value)}
          placeholder={filter.placeholder}
          className={filter.width}
        />
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

        {isExpanded ? (
          <Button
            variant="default"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-green-krnd hover:bg-green-krnd-hover"
          >
            <Filter className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className=""
          >
            <Filter className="h-4 w-4" /> 
          </Button>
        )}
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
          <div className="flex flex-row gap-4 p-2">
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