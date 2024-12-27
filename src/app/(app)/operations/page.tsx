'use client'

import { useState, useEffect } from 'react'
import OperationBarChart from '@/src/components/OperationBarChart'

export default function OperationsPage() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/operations')
      const result = await response.json()
      
      // Transform the data to match the chart's expected format
      const transformedData = result.map((item: any) => ({
        warehouse: item.warehouse,
        value: item.truck_count
      }))
      
      setData(transformedData)
      setIsLoading(false)
    }

    fetchData()
  }, [])

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="mx-[2em] p-4 flex flex-col space-y-4 bg-white shadow-md">
      <div className="flex-none">
        <p className="text-xl font-bold text-green-krnd">Operations</p>
      </div>

      <div className="container mx-auto">
        <OperationBarChart 
          data={data}
          title="Truck In"
          metricLabel="Truck Count"
          formatValue={(value) => Math.round(value).toString()}
        />
      </div>

    </div>
  )
}