'use client'

import { signIn, signOut } from 'next-auth/react'

export const LoginButton = () => {
    return <button onClick={() => signIn()}>Sign in</button> }

export const LogoutButton = () => {
    return <button className='text-black' onClick={() => signOut()}>Sign out</button> }