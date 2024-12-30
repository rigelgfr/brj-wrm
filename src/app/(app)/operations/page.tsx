'use client'

import { useState, useEffect } from 'react'
import FilterBar from '@/src/components/Slicer'

export default function OperationsPage() {
  return (
    <div className="mx-[2em] p-4 flex flex-col space-y-4 bg-white shadow-md">
      <div className="flex-none">
        <p className="text-xl font-bold text-green-krnd">Operations</p>
      </div>

      <div className="container mx-auto">
        <FilterBar />
      </div>

    </div>
  )
}