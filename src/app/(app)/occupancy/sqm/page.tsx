'use client'

import Heading from "@/components/ui/Heading"
import { OccupancySqmData } from "./data"
import { SquareStack } from "lucide-react"

export default function OccupancySqmPage() {
  return (
    <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
      <Heading text="Occupancy (sqm)" Icon={SquareStack} />

      <div>
        <OccupancySqmData />
      </div>

    </div>
  )
}