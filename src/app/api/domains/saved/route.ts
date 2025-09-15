// ========================================
// src/app/api/domains/saved/route.ts - UPDATED WITH PREMIUM RESTRICTIONS
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Free users can see saved domains but with limits
    const limit = user.plan === 'free' ? 5 : 1000; // Free users: 5 saved domains max

    const savedDomains = await prisma.savedDomain.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      domains: savedDomains,
      limit: limit,
      plan: user.plan,
      canSaveMore: savedDomains.length < limit
    });
    
  } catch (error) {
    console.error('Saved domains fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    const { domain, notes } = await request.json();
    
    if (!userId || !domain) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check saved domain limits for free users
    if (user.plan === 'free') {
      const savedCount = await prisma.savedDomain.count({
        where: { userId: user.id }
      });

      if (savedCount >= 5) {
        return NextResponse.json({ 
          error: 'Free users can save up to 5 domains. Upgrade to Pro for unlimited saved domains.' 
        }, { status: 403 });
      }
    }

    const savedDomain = await prisma.savedDomain.create({
      data: {
        userId: user.id,
        domain,
        notes: notes || ''
      }
    });

    return NextResponse.json(savedDomain);
    
  } catch (error: any) {
    console.error('Save domain error:', error);
    if (error && error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Domain already saved' 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();
    const url = new URL(request.url);
    const { searchParams } = url;
    const domain = searchParams.get('domain');
    
    if (!userId || !domain) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.savedDomain.delete({
      where: {
        userId_domain: {
          userId: user.id,
          domain
        }
      }
    });

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Delete saved domain error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}