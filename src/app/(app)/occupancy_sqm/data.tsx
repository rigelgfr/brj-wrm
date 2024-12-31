// app/occupancy_sqm/data.tsx
'use client'

import { useState, useEffect } from 'react'
import FilterBar, { FilterState, defaultFilters } from '@/src/components/FilterBar'
import { PieChart } from '@/src/components/PieChart'
import Loading from '@/src/components/ui/Loading'
import { Card, CardContent } from '@/components/ui/card'

interface OccupancySqmData {
  [warehouse: string]: {
    occupied: number
    empty: number
  }
}

interface SpaceSqmData {
  wh_type: string | null
  space: number | null
  max_cap_sqm: number | null
}

export function OccupancySqmData() {
  const [isLoading, setIsLoading] = useState(false)
  const [occupancyData, setOccupancyData] = useState<OccupancySqmData>({})
  const [spaceData, setSpaceData] = useState<SpaceSqmData[]>([])
  const [isLoadingSpace, setIsLoadingSpace] = useState(false)

  const fetchOccupancyData = async (filters: FilterState) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (filters.year.length) params.append('year', filters.year[0])
      if (filters.month.length) params.append('month', filters.month[0])
      if (filters.week.length) params.append('week', filters.week[0])

      const response = await fetch(`/api/occupancy_sqm?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch occupancy data')
      }

      const data = await response.json()
      console.log('Received data:', data)
      setOccupancyData(data)
    } catch (error) {
      console.error('Error fetching occupancy data:', error)
      setOccupancyData({})
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSpaceData = async () => {
    setIsLoadingSpace(true)
    try {
      const response = await fetch('/api/space')
      
      if (!response.ok) {
        throw new Error('Failed to fetch space data')
      }

      const data = await response.json()
      setSpaceData(data)
    } catch (error) {
      console.error('Error fetching space data:', error)
      setSpaceData([])
    } finally {
      setIsLoadingSpace(false)
    }
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    fetchOccupancyData(newFilters)
  }

  // Fetch initial data
  useEffect(() => {
    fetchOccupancyData(defaultFilters)
    fetchSpaceData()
  }, [])

  return (
    <div className="space-y-2">
      <FilterBar onFiltersChange={handleFiltersChange} monthFormat='short' />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Space Data Table - separate loading state */}
        <Card className="w-full border-none shadow-none">
          <CardContent className='px-0'>
            {isLoadingSpace ? (
              <Loading />
            ) : (
              <div className="overflow-x-auto rounded-lg">
                <table className="w-full">
                  <thead className='bg-[#98d454]'>
                    <tr className="border-b text-white">
                      <th className="p-2 text-left font-medium">WH Type</th>
                      <th className="p-2 text-right font-medium">Space</th>
                      <th className="p-2 text-right font-medium">Max Cap (sqm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spaceData.map((warehouse) => (
                      <tr key={warehouse.wh_type} className="border-b">
                        <td className="p-2 text-left">{warehouse.wh_type || '-'}</td>
                        <td className="p-2 text-right">{warehouse.space?.toLocaleString() || '-'}</td>
                        <td className="p-2 text-right">{warehouse.max_cap_sqm?.toLocaleString() || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Charts - separate loading state */}
        {isLoading ? (
          // Fill remaining grid spaces with loading spinners
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              <Loading />
            </div>
          ))
        ) : (
          Object.entries(occupancyData).map(([warehouse, data]) => (
            <PieChart
              key={warehouse}
              data={data}
              title={warehouse}
            />
          ))
        )}
      </div>
    </div>
  )
}