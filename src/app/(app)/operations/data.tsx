import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import FilterBar, { FilterState, getStoredFilters, storeFilters } from '@/components/FilterBar'
import { GroupedBarChart } from '@/components/Charts'
import Loading from '@/components/ui/Loading'
import { Button } from '@/components/ui/button'

export interface OperationData {
  inbound: {
    truck: { data: any[] }
    volume: { data: any[] }
  }
  outbound: {
    truck: { data: any[] }
    volume: { data: any[] }
  }
}

export default function OperationsData() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [filters, setFilters] = useState<FilterState>(() => getStoredFilters());
  const [operationData, setOperationData] = useState<OperationData>({
    inbound: { truck: { data: [] }, volume: { data: [] } },
    outbound: { truck: { data: [] }, volume: { data: [] } }
  })

  useEffect(() => {
    setFilters(getStoredFilters())  
    fetchOperationData(filters)
    setIsHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchOperationData = async (filters: FilterState) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (filters.year.length) params.append('year', filters.year[0])
      if (filters.month.length) params.append('month', filters.month[0])
      
      filters.week.forEach(week => params.append('week', week))
      filters.warehouse.forEach(warehouse => params.append('warehouse', warehouse))

      const [inboundRes, outboundRes] = await Promise.all([
        fetch(`/api/operation_in/chart?${params.toString()}`),
        fetch(`/api/operation_out/chart?${params.toString()}`)
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

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    storeFilters(newFilters)
    fetchOperationData(newFilters)
  }

  const handleRefreshData = async () => {
    setIsUpdating(true)
    try {
      // Update both inbound and outbound aggregates
      const [inboundRes, outboundRes] = await Promise.all([
        fetch('/api/operation_in/update', { method: 'PUT' }),
        fetch('/api/operation_out/update', { method: 'PUT' })
      ])

      if (!inboundRes.ok || !outboundRes.ok) {
        throw new Error('Failed to update aggregates')
      }

      // Refetch the data with current filters
      await fetchOperationData(filters)
    } catch (error) {
      console.error('Error updating aggregates:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isHydrated) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <FilterBar onFiltersChange={handleFiltersChange} initialFilters={filters} />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefreshData}
          disabled={isUpdating}
          className="ml-4 h-10 w-10"
        >
          <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="w-full h-[50vh] flex justify-center items-center">
          <Loading />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GroupedBarChart
              data={operationData.inbound.truck.data}
              weeks={filters.week}
              title="Truck In"
            />
            <GroupedBarChart
              data={operationData.inbound.volume.data}
              weeks={filters.week}
              title="Volume In"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GroupedBarChart
              data={operationData.outbound.truck.data}
              weeks={filters.week}
              title="Truck Out"
            />
            <GroupedBarChart
              data={operationData.outbound.volume.data}
              weeks={filters.week}
              title="Volume Out"
            />
          </div>
        </div>
      )}
    </div>
  )
}