'use client'

import { useState, useEffect } from 'react'

import InputBox from '../components/ui/InputBox'
import ErrorPopup from '../components/ui/ErrorPopup'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
    } else {
      setError('')
      console.log('Login attempted with:', { email, password })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[url('/images/main-bg.png')] bg-cover bg-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          {/* Left side - Image and Title */}
          <div className="relative w-full md:w-1/2 md:h-auto bg-[url('/images/login-card1.jpg')] bg-cover">
            <div className="absolute inset-0 bg-gradient-to-t from-black to-green-800 opacity-75"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <h1 className="text-2xl font-bold text-white text-center">PT. Bimaruna Jaya</h1>
                <p className='text-sm font-light text-white text-center'>Warehouse Report Management System ©</p>
              </div>
            </div>
            </div>

          {/* Right side - Login, and Form */}
          <div className="w-full md:w-1/2 px-6 py-10 flex flex-col justify-center">
              {/* Login Form */}
              <h2 className="text-2xl font-semibold mb-4 text-center text-green-krnd">Login</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputBox
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
                <InputBox
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />

                <div className='w-full flex justify-center'>
                  <button
                  type="submit"
                  className="w-1/3 px-4 py-2 mt-2 rounded-md bg-green-krnd text-white hover:bg-green-700 transition duration-300"
                >
                  Log In
                </button>

                </div>
              </form>
            

            {/* Display the ErrorPopup when there is an error */}
            {error && (
              <ErrorPopup message={error} onClose={() => setError('')} />
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
