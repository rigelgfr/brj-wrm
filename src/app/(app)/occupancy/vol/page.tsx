'use client'

import { OccupancyVolData } from "./data"

export default function OccupancyVolPage() {
  return (
    <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
      <div className="flex-none">
        <p className="text-xl font-bold text-green-krnd">Occupancy (vol)</p>
      </div>

      <div className="container mx-auto">
        <OccupancyVolData />
      </div>
    </div>
  )
}