'use client';

import React, { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

import InputBox from '@/components/ui/InputBox';
import ErrorPopup from '@/components/ui/ErrorPopup';
import loginCardBg from '@/public/images/login-card1.jpg';

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Reset any previous errors

    // Validate fields
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false,
      });
      if (!result?.error) {
        router.push(callbackUrl);
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="w-full md:w-1/2 px-6 py-10 flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-4 text-center text-green-krnd">Log In</h2>
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
        <div className="w-full flex justify-center">
          <button
            type="submit"
            className="w-full px-4 py-2 mt-2 rounded-md bg-green-krnd text-white hover:bg-green-700 transition duration-300"
          >
            Submit
          </button>
        </div>
        {error && (
          <ErrorPopup message={error} onClose={() => setError('')} />
        )}
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex items-center justify-center min-h-screen bg-[url('/images/main-bg.png')] bg-cover bg-center">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="relative w-full md:w-1/2 md:h-auto bg-[url('/images/login-card1.JPG')] bg-cover">
              <div className="absolute inset-0 bg-gradient-to-t from-black to-green-800 opacity-75"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <h1 className="text-2xl font-bold text-white text-center">PT. Bimaruna Jaya</h1>
                  <p className="text-sm font-light text-white text-center">
                    Warehouse Report Management System ©
                  </p>
                </div>
              </div>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
