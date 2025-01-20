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
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            role: true
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          roleId: user.roleId + '',
          roleName: user.role.name
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
          roleId: token.roleId,
          roleName: token.roleName
        }
      }
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as any;
        return {
          ...token,
          id: u.id,
          roleId: u.roleId,
          roleName: u.roleName
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
      roleId: string;
      roleName: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roleId: string;
    roleName: string;
  }
}