// components/FilterBar/FilterBar.tsx
'use client'

import { useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/src/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type SlicerType = 'year' | 'month' | 'week' | 'warehouse'
export type FilterOption = { value: string; label: string }
export type FilterState = Record<SlicerType, string[]>

export const filterOptions: Record<SlicerType, FilterOption[]> = {
  year: [
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
  ],
  month: [
    { value: 'January', label: 'Jan' },
    { value: 'February', label: 'Feb' },
    { value: 'March', label: 'Mar' },
    { value: 'April', label: 'Apr' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'Jun' },
    { value: 'July', label: 'Jul' },
    { value: 'August', label: 'Aug' },
    { value: 'September', label: 'Sep' },
    { value: 'October', label: 'Oct' },
    { value: 'November', label: 'Nov' },
    { value: 'December', label: 'Dec' },
  ],
  week: [
    { value: 'W1', label: 'W1' },
    { value: 'W2', label: 'W2' },
    { value: 'W3', label: 'W3' },
    { value: 'W4', label: 'W4' },
    { value: 'W5', label: 'W5' },
  ],
  warehouse: [
    { value: 'CFS', label: 'CFS' },
    { value: 'FZ AB', label: 'FZ AB' },
    { value: 'FZ BRJ', label: 'FZ BRJ' },
    { value: 'PLB', label: 'PLB' },
    { value: 'Bonded', label: 'BONDED' },
  ],
}

// Default filter values
export const defaultFilters: FilterState = {
  year: ['2024'],
  month: ['October'],
  week: ['W1'],
  warehouse: filterOptions.warehouse.map(w => w.value),
}

const Slicer = ({ type, options, selected, onChange }: {
  type: SlicerType;
  options: FilterOption[];
  selected: string[];
  onChange: (type: SlicerType, value: string) => void;
}) => {
  const allSelected = options.length === selected.length;

  return (
    <div className="flex flex-col space-y-2">
      <h3 className="font-semibold capitalize">{type}</h3>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`select-all-${type}`}
          checked={allSelected}
          onCheckedChange={(checked) => {
            if (checked) {
              onChange(type, 'all');
            } else {
              onChange(type, 'none');
            }
          }}
        />
        <label htmlFor={`select-all-${type}`}>Select All</label>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            size="sm"
            className={`${
              selected.includes(option.value)
                ? 'bg-green-krnd text-white'
                : 'bg-white text-green-800'
            } border-green-600`}
            onClick={() => onChange(type, option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export interface FilterBarProps {
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  monthFormat?: 'full' | 'short';
}

export default function FilterBar({ 
  onFiltersChange, 
  initialFilters = defaultFilters,
  monthFormat = 'full' 
}: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [isOpen, setIsOpen] = useState(false)

  // Dynamically adjust month options based on monthFormat
  const getMonthOptions = () => {
    return monthFormat === 'short'
      ? filterOptions.month.map(({ value, label }) => ({ value, label }))
      : filterOptions.month.map(({ value }) => ({ value, label: value }));
  };

  const handleFilterChange = (type: SlicerType, value: string) => {
    setFilters((prev) => {
      let updatedFilters: string[];
      
      if (value === 'all') {
        updatedFilters = (type === 'month' ? getMonthOptions() : filterOptions[type]).map(o => o.value);
      } else if (value === 'none') {
        updatedFilters = [];
      } else {
        updatedFilters = prev[type].includes(value)
          ? prev[type].filter((v) => v !== value)
          : [...prev[type], value];
      }

      return { ...prev, [type]: updatedFilters };
    });
  };

  const getSelectedCount = (filterState: FilterState) => {
    return Object.values(filterState).reduce((acc, curr) => acc + curr.length, 0)
  }

  const handleSubmit = () => {
    onFiltersChange(filters)
    setIsOpen(false)
  }

  // Format selected filters for display
  const formatSelectedValues = (type: SlicerType) => {
    return filters[type]
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) // Sort alphabetically or numerically
      .join(', ');
  };

  return (
    <div className="space-y-4">
      <div className='flex flex-wrap items-center gap-4'>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Filters {getSelectedCount(filters) > 0 && `(${getSelectedCount(filters)})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-screen max-w-3xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(filterOptions) as SlicerType[]).map((type) => (
                <Slicer
                  key={type}
                  type={type}
                  options={filterOptions[type]}
                  selected={filters[type]}
                  onChange={handleFilterChange}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Apply</Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Render selected values beside the filter component */}
        <div className="flex flex-wrap items-center gap-2">
            {['year', 'month', 'week'].map((type) => (
              filters[type as SlicerType].length > 0 && (
                <div key={type} className="text-sm">
                  <strong>{type.charAt(0).toUpperCase() + type.slice(1)}:</strong> {formatSelectedValues(type as SlicerType)}
                </div>
              )
            ))}
        </div>
      </div>
      
    </div>
  )
}