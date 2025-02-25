// src/app/api/auth/auth.config.ts
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "Login",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "hello@example.com"
        },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null
        }
      
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
        })
      
        console.log("Found user:", user);
      
        if (!user) {
          console.log("User not found");
          return null
        }
      
        const isPasswordValid = await compare(credentials.password, user.password)
        console.log("Password valid:", isPasswordValid);
      
        if (!isPasswordValid) {
          console.log("Invalid password");
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role
        }
      }
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as any;
        return {
          ...token,
          id: u.id,
          role: u.role
        }
      }
      return token
    }
  }
}

// Add type declaration for next-auth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}