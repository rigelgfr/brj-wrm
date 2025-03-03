import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
      const { email, username, password, role } = await request.json();
  
      // Basic validation
      if (!email || !username || !password || !role) {
        return NextResponse.json(
          { message: 'All fields are required' },
          { status: 400 }
        );
      }
  
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });
  
      if (existingUser) {
        return NextResponse.json(
          { 
            message: existingUser.email === email 
              ? 'Email already in use' 
              : 'Username already taken' 
          },
          { status: 400 }
        );
      }
  
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role
        }
      });
  
      // Remove the password from the response
      const { password: _, ...userWithoutPassword } = newUser;
  
      return NextResponse.json({
        message: 'User created successfully',
        user: userWithoutPassword
      }, { status: 201 });
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }
