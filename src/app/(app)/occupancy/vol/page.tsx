'use client'

import { SquareStack } from "lucide-react"
import { OccupancyVolData } from "./data"
import Heading from "@/components/ui/Heading"

export default function OccupancyVolPage() {
  return (
    <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
      <Heading text="Occupancy (vol)" Icon={SquareStack} />

      <div>
        <OccupancyVolData />
      </div>
    </div>
  )
}