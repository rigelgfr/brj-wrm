'use client'

import { useState, useEffect } from 'react'
import FilterBar, { FilterState, getStoredFilters, storeFilters } from '@/src/components/FilterBar'
import SingleBarChart from '@/src/components/SingleBarChart'
import Loading from '@/src/components/ui/Loading'
import { Card, CardContent } from '@/components/ui/card'

interface OccupancyVolData {
  [warehouse: string]: {
    [week: string]: {
      occupied: number;
      empty: number;
    }
  }
}

interface SpaceVolData {
  wh_type: string | null
  space: number | null
  max_cap_vol: number | null
  occupied: number | null
}

export function OccupancyVolData() {
  const [isLoading, setIsLoading] = useState(false)
  const [spaceData, setSpaceData] = useState<SpaceVolData[]>([])
  const [isLoadingSpace, setIsLoadingSpace] = useState(false)
  const [filters, setFilters] = useState<FilterState>(() => getStoredFilters())
  const [isHydrated, setIsHydrated] = useState(false)
  const [allWeeksData, setAllWeeksData] = useState<any>({})
  const [currentMonth, setCurrentMonth] = useState('')
  const [currentYear, setCurrentYear] = useState('')

  useEffect(() => {
    setFilters(getStoredFilters());
    const initialFilters = getStoredFilters();
    setCurrentMonth(initialFilters.month[0]);
    setCurrentYear(initialFilters.year[0]);
    fetchAllWeeksData(initialFilters.year[0], initialFilters.month[0]);
    fetchSpaceData();
    setIsHydrated(true);
  }, []);

  const fetchAllWeeksData = async (year: string, month: string) => {
    setIsLoading(true);
    try {
      const weeks = ['W1', 'W2', 'W3', 'W4', 'W5'];
      
      const results = await Promise.all(
        weeks.map(async (week) => {
          const params = new URLSearchParams({
            year,
            month,
            week,
          });
          
          const response = await fetch(`/api/occupancy_vol?${params.toString()}`);
          const data = await response.json();
          return { week, data };
        })
      );
      
      // Restructure data by warehouse
      const restructured: any = {};
      results.forEach(({ week, data }) => {
        Object.entries(data).forEach(([warehouse, values]: [string, any]) => {
          if (!restructured[warehouse]) {
            restructured[warehouse] = [];
          }
          restructured[warehouse].push({
            week,
            occupied: values.occupied
          });
        });
      });
      
      setAllWeeksData(restructured);
    } catch (error) {
      console.error('Error fetching all weeks data:', error);
      setAllWeeksData({});
    } finally {
      setIsLoading(false);
    }
  };

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
    // Check if month or year has changed
    const newMonth = newFilters.month[0];
    const newYear = newFilters.year[0];
    
    if (newMonth !== currentMonth || newYear !== currentYear) {
      // Month or year changed, fetch new data
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
      fetchAllWeeksData(newYear, newMonth);
    }
    
    // Always update filters state
    setFilters(newFilters);
    storeFilters(newFilters);
  }

  if (!isHydrated) return null;

  const selectedWeek = filters.week[0] || 'W1';

  // Get occupied space for the selected week
  const getOccupiedSpace = (warehouse: string) => {
    if (!allWeeksData[warehouse]) return 0;
    const weekData = allWeeksData[warehouse].find((d: any) => d.week === selectedWeek);
    return weekData ? weekData.occupied : 0;
  };

  const warehouseOrder = ['CFS', 'FZ BRJ', 'FZ AB', 'Bonded', 'PLB'];

  return (
    <div className="space-y-2">
      <FilterBar onFiltersChange={handleFiltersChange} monthFormat='short' initialFilters={filters}/>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Space Data Table */}
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
                      <th className="p-2 text-right font-medium">Max Cap (vol)</th>
                      <th className="p-2 text-right font-medium">Occupied</th>
                      <th className="p-2 text-right font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spaceData.map((warehouse) => {
                      const occupiedSpace = getOccupiedSpace(warehouse.wh_type || '');
                      const maxCapacity = warehouse.max_cap_vol || 0;
                      const occupancyPercentage = maxCapacity > 0 
                        ? ((occupiedSpace / maxCapacity) * 100).toFixed(1)
                        : '-';

                      return (
                        <tr key={warehouse.wh_type} className="border-b">
                          <td className="p-2 text-left">{warehouse.wh_type || '-'}</td>
                          <td className="p-2 text-right">{warehouse.space?.toLocaleString() || '-'}</td>
                          <td className="p-2 text-right">{warehouse.max_cap_vol?.toLocaleString() || '-'}</td>
                          <td className="p-2 text-right">{occupiedSpace.toLocaleString()}</td>
                          <td className="p-2 text-right">{occupancyPercentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Charts */}
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              <Loading />
            </div>
          ))
        ) : (
        Object.entries(allWeeksData)
        .sort(([a], [b]) => warehouseOrder.indexOf(a) - warehouseOrder.indexOf(b))
        .map(([warehouse, data]) => (
            <SingleBarChart
                key={warehouse}
                data={data}
                title={warehouse}
                selectedWeeks={selectedWeek} // Pass array of selected weeks
            />
          ))
        )}
      </div>
    </div>
  )
}