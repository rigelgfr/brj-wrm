'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/src/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FilterState, FilterOption, SlicerType } from './types'
import GroupedBarChart from './GroupedBarChart'
import Loading from './ui/Loading'

const filterOptions: Record<SlicerType, FilterOption[]> = {
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
const defaultFilters: FilterState = {
  year: ['2024'],
  month: ['October'],
  week: ['W1'],
  warehouse: filterOptions.warehouse.map(w => w.value),
}

// Helper function to sort weeks
const sortWeeks = (weeks: string[]) => {
  return [...weeks].sort((a, b) => {
    const weekA = parseInt(a.slice(1));
    const weekB = parseInt(b.slice(1));
    return weekA - weekB;
  });
};

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

export default function FilterBar() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [operationData, setOperationData] = useState({
    inbound: { truck: { data: [] }, volume: { data: [] } },
    outbound: { truck: { data: [] }, volume: { data: [] } }
  })

  const fetchData = async (filterState: FilterState) => {
    setIsLoading(true)
    try {
      // Construct URL with search params
      const params = new URLSearchParams()
      
      if (filterState.year.length) params.append('year', filterState.year[0])
      if (filterState.month.length) params.append('month', filterState.month[0])
      
      const sortedWeeks = sortWeeks(filterState.week)
      sortedWeeks.forEach(week => params.append('week', week))

      filterState.warehouse.forEach(warehouse => params.append('warehouse', warehouse))

      const [inboundRes, outboundRes] = await Promise.all([
        fetch(`/api/operation_in?${params.toString()}`),
        fetch(`/api/operation_out?${params.toString()}`)
      ])
      
      if (!inboundRes.ok || !outboundRes.ok) {
        throw new Error('Failed to fetch operation data')
      }

      const [inboundData, outboundData] = await Promise.all([
        inboundRes.json(),
        outboundRes.json()
      ])

      setOperationData({
        inbound: inboundData,
        outbound: outboundData
      })
      
    } catch (error) {
      console.error('Error fetching operation data:', error)
      setOperationData({
        inbound: { truck: { data: [] }, volume: { data: [] } },
        outbound: { truck: { data: [] }, volume: { data: [] } }
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data on initial load and when filters are applied
  useEffect(() => {
    fetchData(appliedFilters)
  }, [appliedFilters])

  const handleFilterChange = (type: SlicerType, value: string, sortValues: boolean = false) => {
    setFilters((prev) => {
      let updatedFilters: string[];
      
      if (value === 'all') {
        updatedFilters = filterOptions[type].map(o => o.value);
      } else if (value === 'none') {
        updatedFilters = [];
      } else {
        updatedFilters = prev[type].includes(value)
          ? prev[type].filter((v) => v !== value)
          : [...prev[type], value];
      }

      // Sort weeks if needed
      if (sortValues) {
        updatedFilters = sortWeeks(updatedFilters);
      }

      return { ...prev, [type]: updatedFilters };
    });
  };

  const getSelectedCount = (filterState: FilterState) => {
    return Object.values(filterState).reduce((acc, curr) => acc + curr.length, 0)
  }

  const handleSubmit = () => {
    setAppliedFilters(filters)
    setIsOpen(false)
  }

  return (
    <div className="space-y-4">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Filters {getSelectedCount(appliedFilters) > 0 && `(${getSelectedCount(appliedFilters)})`}
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

      {isLoading ? (
        <Loading />
      ) : (
        <div className="space-y-8">
          {/* Inbound Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GroupedBarChart
              data={operationData.inbound.truck.data}
              weeks={appliedFilters.week}
              title="Truck In"
            />
            <GroupedBarChart
              data={operationData.inbound.volume.data}
              weeks={appliedFilters.week}
              title="Volume In"
            />
          </div>

          {/* Outbound Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GroupedBarChart
              data={operationData.outbound.truck.data}
              weeks={appliedFilters.week}
              title="Truck Out"
            />
            <GroupedBarChart
              data={operationData.outbound.volume.data}
              weeks={appliedFilters.week}
              title="Volume Out"
            />
          </div>
        </div>
      )}
    </div>
  )
}

