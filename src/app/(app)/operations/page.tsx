'use client'

import Heading from '@/components/ui/Heading'
import OperationsData from './data'
import { Factory } from 'lucide-react'

export default function OperationsPage() {
  return (
    <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
      <Heading text="Operations" Icon={Factory} />

      <div>
        <OperationsData />
      </div>

    </div>
  )
}