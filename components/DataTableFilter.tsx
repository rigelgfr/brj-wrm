import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Filter, ChevronDown, Search, X } from "lucide-react"
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

interface SearchDropdownFilterProps<TData> {
  table: Table<TData>
  column: string
  value: string[]
  onChange: (value: string[]) => void
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

  // Calculate the number of columns based on options length
  const itemsPerColumn = 5
  const columnCount = Math.ceil(options.length / itemsPerColumn)
  
  // Group options into columns
  const columns = Array.from({ length: columnCount }, (_, columnIndex) => {
    const startIndex = columnIndex * itemsPerColumn
    return options.slice(startIndex, startIndex + itemsPerColumn)
  })

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
            <span className="text-muted-foreground font-normal">{placeholder}</span>
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
        style={{ 
          width: 'auto',
          minWidth: 'var(--radix-popover-trigger-width)',
          maxWidth: '80vw'
        }}
      >
        <div className="flex flex-row gap-2 p-2">
          {columns.map((columnOptions, columnIndex) => (
            <div key={`column-${columnIndex}`} className="flex flex-col gap-1">
              {columnOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex items-center justify-between border-2 transition-colors w-auto",
                    value.includes(option.value)
                      ? "border-green-krnd bg-green-50 text-green-krnd"
                      : "border-gray-200 hover:border-green-krnd hover:bg-green-50"
                  )}
                  onClick={() => toggleOption(option.value)}
                >
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
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
          {displayValue || <span className="text-muted-foreground font-normal">{placeholder}</span>}
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

function MultiSelectAutoFilter<TData>({
  table,
  column,
  value,
  onChange,
  placeholder,
  className,
}: {
  table: Table<TData>
  column: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  // Extract all unique values from the specified column in the table
  const allRowsData = table.getCoreRowModel().rows.map(row => {
    const rowData = row.original as any
    return rowData[column]?.toString() || ''
  })

  // Create unique options from the column data
  const uniqueValues = Array.from(new Set(allRowsData.filter(Boolean)))
  const options = uniqueValues.map(val => ({
    value: val,
    label: val,
  }))

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

  // Calculate the number of columns based on options length
  const itemsPerColumn = 5
  const columnCount = Math.ceil(options.length / itemsPerColumn)
  
  // Group options into columns
  const columns = Array.from({ length: columnCount }, (_, columnIndex) => {
    const startIndex = columnIndex * itemsPerColumn
    return options.slice(startIndex, startIndex + itemsPerColumn)
  })

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
            <span className="text-muted-foreground font-normal">{placeholder}</span>
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
        style={{ 
          width: 'auto',
          minWidth: 'var(--radix-popover-trigger-width)',
          maxWidth: '80vw'
        }}
      >
        <div className="flex flex-row gap-2 p-2">
          {columns.map((columnOptions, columnIndex) => (
            <div key={`column-${columnIndex}`} className="flex flex-col gap-1">
              {columnOptions.map((option) => (
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
                </Button>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SearchableDropdownAutoFilter<TData>({
  table,
  column,
  value,
  onChange,
  placeholder,
  className,
}: SearchDropdownFilterProps<TData>) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Extract all unique values from the specified column in the table
  const allRowsData = table.getCoreRowModel().rows.map(row => {
    const rowData = row.original as any
    return rowData[column]?.toString() || ''
  })

  // Create unique options from the column data
  const uniqueValues = Array.from(new Set(allRowsData.filter(Boolean)))
  const options = uniqueValues.map(val => ({
    value: val,
    label: val,
  }))

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const selectedOptions = options.filter(option => value.includes(option.value))

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
            <span className="text-muted-foreground font-normal">{placeholder}</span>
          ) : value.length === 1 ? (
            selectedOptions[0]?.label
          ) : (
            `${selectedOptions[0]?.label} +${value.length - 1}`
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0" 
        align="start"
        style={{ 
          width: 'auto',
          minWidth: 'var(--radix-popover-trigger-width)',
          maxWidth: '80vw'
        }}
      >
        <div className="p-2">
          <div className="relative mb-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Selected options */}
          {selectedOptions.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1 border-b pb-2">
              {selectedOptions.map(option => (
                <Button
                  key={`selected-${option.value}`}
                  variant="secondary"
                  size="sm"
                  className="h-7 gap-1 bg-green-50 text-green-krnd border border-green-krnd"
                  onClick={() => toggleOption(option.value)}
                >
                  {option.label}
                  <X className="h-3 w-3" />
                </Button>
              ))}
            </div>
          )}

          {/* Options list */}
          <div className="max-h-[200px] overflow-y-auto">
            {searchQuery ? (
              filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <div
                    key={option.value}
                    className="flex items-center py-1.5 px-2 hover:bg-muted cursor-pointer rounded-md"
                    onClick={() => toggleOption(option.value)}
                  >
                    <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                      {value.includes(option.value) && (
                        <div className="h-2 w-2 rounded-sm bg-green-krnd" />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground">No options found</p>
              )
            ) : (
              <p className="text-center text-sm text-muted-foreground">Enter search keyword</p>
            )}
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

    if (filter.type === 'multiSelectAuto') {
      return (
        <MultiSelectAutoFilter
          table={table}
          column={filter.columnAccessor || filter.id}
          value={(table.getColumn(filter.id)?.getFilterValue() as string[]) || []}
          onChange={(value) => table.getColumn(filter.id)?.setFilterValue(value)}
          placeholder={filter.placeholder}
          className={filter.width}
        />
      );
    }

    if (filter.type === 'searchDropdown') {
      return (
        <SearchableDropdownAutoFilter
          table={table}
          column={filter.columnAccessor || filter.id}
          value={(table.getColumn(filter.id)?.getFilterValue() as string[]) || []}
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
      <div className="flex flex-wrap items-center gap-2">
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
          <div className="flex flex-wrap gap-2 px-0">
            {secondaryFilters.map((filter) => (
              <div key={filter.id} className="flex-shrink-0">
                {renderFilter(filter)}
              </div>
            ))}
          </div>
          <div className="flex justify-start mt-4">
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