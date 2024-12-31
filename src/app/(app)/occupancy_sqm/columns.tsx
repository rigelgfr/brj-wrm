'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Loading from '@/src/components/ui/Loading'

interface SpaceData {
  wh_name: string
  wh_type: string | null
  space: number | null
  max_cap_sqm: number | null
}

export function SpaceData() {
  const [isLoading, setIsLoading] = useState(false)
  const [spaceData, setSpaceData] = useState<SpaceData[]>([])

  const fetchSpaceData = async () => {
    setIsLoading(true)
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
      setIsLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchSpaceData()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Warehouse Space Information</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left font-medium">Warehouse</th>
                  <th className="p-2 text-left font-medium">Type</th>
                  <th className="p-2 text-right font-medium">Space</th>
                  <th className="p-2 text-right font-medium">Max Capacity (sqm)</th>
                </tr>
              </thead>
              <tbody>
                {spaceData.map((warehouse) => (
                  <tr key={warehouse.wh_name} className="border-b">
                    <td className="p-2 text-left">{warehouse.wh_name}</td>
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
  );
}