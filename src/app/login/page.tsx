'use client'

import { useState, useEffect } from 'react'
import InputBox from '../components/ui/InputBox'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fadeOut, setFadeOut] = useState(false) // for triggering fade-out effect

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Please fill in all fields')
      setFadeOut(false) // reset fade-out when new error appears
    } else {
      setError('')
      console.log('Login attempted with:', { username, password })
    }
  }

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setFadeOut(true)
      }, 5000) // start fading out after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[url('/images/main-bg.png')] bg-cover bg-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Image only */}
          <div className="relative w-full md:w-1/2 md:h-auto bg-[url('/images/login-card1.jpg')] bg-cover">
            <div className="absolute inset-0 bg-gradient-to-t from-green-950 to-transparent opacity-75"></div>
          </div>

          {/* Right side - Title, Login, and Form */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            {/* Title and Description */}
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-black">PT. Bimaruna Jaya</h1>
              <p className="font-light text-gray-700">Warehouse Report Management System</p>
            </div>

            {/* Login Form */}
            <h2 className="text-2xl font-semibold mb-6 text-green-krnd text-center">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox
                id="username"
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
              <InputBox
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Log In
              </button>

              {/* Reserved space for the error message */}
              <div
                className={`text-red-500 text-right text-sm transition-opacity duration-500 ${
                  fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {error}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
