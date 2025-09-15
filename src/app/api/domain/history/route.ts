// src/app/api/domain/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const url = new URL(request.url);
    const { searchParams } = url;
    const domain = searchParams.get('domain');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!domain) {
      return NextResponse.json({ error: 'Domain parameter required' }, { status: 400 });
    }

    // Get user to check plan
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user || user.plan === 'free') {
      return NextResponse.json({ 
        error: 'Historical data requires Starter or Pro plan' 
      }, { status: 403 });
    }

    // Determine how far back to look based on plan
    const daysBack = user.plan === 'starter' ? 180 : 1825; // 6 months vs 5 years
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    // Fetch historical snapshots
    const historicalData = await prisma.domainHistory.findMany({
      where: {
        domain: domain,
        createdAt: {
          gte: cutoffDate
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 snapshots
    });

    // Process and return the data
    const processedHistory = historicalData.map(record => ({
      date: record.createdAt.toISOString().split('T')[0],
      snapshot: record.snapshot
    }));

    return NextResponse.json({
      domain,
      plan: user.plan,
      timeframe: `${daysBack} days`,
      snapshots: processedHistory,
      totalSnapshots: historicalData.length
    });

  } catch (error) {
    console.error('Historical data fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch historical data' 
    }, { status: 500 });
  }
}