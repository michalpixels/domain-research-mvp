// src/app/api/domains/history/route.ts - Search History API (Premium Only)
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user to check subscription
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has premium access
    if (user.plan === 'free') {
      return NextResponse.json({ 
        error: 'Premium feature. Upgrade to access search history.' 
      }, { status: 403 });
    }

    // Get search history for premium users
    const searches = await prisma.domainSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 searches
      select: {
        id: true,
        domain: true,
        searchData: true,
        createdAt: true
      }
    });

    return NextResponse.json(searches);
    
  } catch (error) {
    console.error('Search history fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}