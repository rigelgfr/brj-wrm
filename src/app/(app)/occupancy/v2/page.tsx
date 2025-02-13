'use client'

import Heading from "@/components/ui/Heading"

import { SquareStack } from "lucide-react"
import { OccupancyTable } from "./data"

export default function OccupancySqmPage() {
  return (
    <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
      <Heading text="Occupancy" Icon={SquareStack} />

      <div>
        <OccupancyTable />
      </div>

    </div>
  )
}