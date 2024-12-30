import React from 'react'

interface SpinnerProps {
  size?: number
  speed?: number
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 40, speed = 1 }) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="animate-spin text-[#98d454]"
        style={{ animationDuration: `${3 / speed}s` }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="#98d454"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="#98d454"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: 'linear-gradient(45deg, #98d454, #76a542)',
          opacity: 0.5,
          animationDuration: `${2 / speed}s`,
        }}
      />
    </div>
  )
}

