'use client'

import { useState, useEffect } from 'react'

const Clock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num: number) => num.toString().padStart(2, '0')

  const hours = formatNumber(time.getHours())
  const minutes = formatNumber(time.getMinutes())
  const seconds = formatNumber(time.getSeconds())

  const formattedDate = time.toLocaleDateString('en-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const getWeekNumber = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    const dayOfWeek = firstDayOfMonth.getDay()
    const weekNumber = Math.ceil((date.getDate() + dayOfWeek) / 7)
    return `W${weekNumber}`
  }

  return (
    <div className="flex flex-col items-center">
      <div className="font-semibold text-lightgrey-krnd text-right w-full">
        {formattedDate} - {getWeekNumber(time)}
      </div>
      <div className="flex items-baseline justify-end w-full">
        {[hours, minutes, seconds].map((unit, index) => (
          <div key={index} className="flex items-center text-darkgrey-krnd text-3xl">
            <div className="w-[2ch] font-bold  text-center tabular-nums" suppressHydrationWarning>
              {unit}
            </div>
            {index < 2 && <span className="font-bold mx-1" suppressHydrationWarning>:</span>}
          </div>
        ))}
      </div>
      
    </div>
  )
}

export default Clock

