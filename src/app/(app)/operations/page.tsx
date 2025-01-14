'use client'

import OperationsData from './data'

export default function OperationsPage() {
  return (
    <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
      <div className="flex-none">
        <p className="text-xl font-bold text-green-krnd">Operations</p>
      </div>

      <div className="container mx-auto">
        <OperationsData />
      </div>

    </div>
  )
}