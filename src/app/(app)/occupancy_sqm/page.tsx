'use client'

import { OccupancySqmData } from "./data"

export default function OccupancySqmPage() {
  return (
    <div className="mx-[2em] p-4 flex flex-col space-y-4 bg-white shadow-md">
      <div className="flex-none">
        <p className="text-xl font-bold text-green-krnd">Occupancy</p>
      </div>

      <div className="container mx-auto">
        <OccupancySqmData />
      </div>

    </div>
  )
}