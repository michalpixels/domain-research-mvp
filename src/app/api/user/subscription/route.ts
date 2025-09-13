import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // const { userId } = auth();

    const userId = 'temp-user-123';
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        plan: true,
        searchesUsed: true,
        searchLimit: true,
        createdAt: true
      }
    });

    if (!user) {
      // Create user if doesn't exist - get user data from Clerk
      const { userId: clerkUserId } = auth();
      if (!clerkUserId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const newUser = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: '', // Will be updated when user provides email
          plan: 'free',
          searchesUsed: 0,
          searchLimit: 20
        }
      });
      
      return NextResponse.json({
        plan: newUser.plan,
        searchesUsed: newUser.searchesUsed,
        searchLimit: newUser.searchLimit,
        createdAt: newUser.createdAt
      });
    }

    return NextResponse.json(user);
    
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

    return NextResponse.json(updatedUser);
    
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}