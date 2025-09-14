// src/app/api/user/subscription/route.ts - FIXED SERIALIZATION
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to find existing user first
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        plan: true,
        searchesUsed: true,
        searchLimit: true,
        createdAt: true,
        email: true
      }
    });

    if (!user) {
      // Get user details from Clerk
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress || 'unknown@example.com';
      
      console.log(`Creating new user: ${userId} (${email})`);
      
      try {
        const newUser = await prisma.user.create({
          data: {
            clerkId: userId,
            email: email,
            plan: 'free',
            searchesUsed: 0,
            searchLimit: 20
          }
        });
        
        // Return plain object with serializable data only
        return NextResponse.json({
          plan: newUser.plan,
          searchesUsed: newUser.searchesUsed,
          searchLimit: newUser.searchLimit,
          createdAt: newUser.createdAt.toISOString(), // Convert Date to string
          email: newUser.email
        });
      } catch (createError: any) {
        if (createError.code === 'P2002') {
          // User already exists, try to fetch again
          console.log('User already exists, fetching existing user...');
          user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
              plan: true,
              searchesUsed: true,
              searchLimit: true,
              createdAt: true,
              email: true
            }
          });
          
          if (user) {
            return NextResponse.json({
              plan: user.plan,
              searchesUsed: user.searchesUsed,
              searchLimit: user.searchLimit,
              createdAt: user.createdAt.toISOString(), // Convert Date to string
              email: user.email
            });
          }
        }
        throw createError;
      }
    }

    // Return serializable data
    return NextResponse.json({
      plan: user.plan,
      searchesUsed: user.searchesUsed,
      searchLimit: user.searchLimit,
      createdAt: user.createdAt.toISOString(), // Convert Date to string
      email: user.email
    });
    
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    const { plan } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchLimits = {
      free: 20,
      starter: 500,
      pro: 999999,
      enterprise: 999999
    };

    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        plan,
        searchLimit: searchLimits[plan as keyof typeof searchLimits] || 20,
        searchesUsed: 0 // Reset searches on plan change
      }
    });

    // Return serializable data
    return NextResponse.json({
      plan: updatedUser.plan,
      searchesUsed: updatedUser.searchesUsed,
      searchLimit: updatedUser.searchLimit,
      createdAt: updatedUser.createdAt.toISOString(),
      email: updatedUser.email
    });
    
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}