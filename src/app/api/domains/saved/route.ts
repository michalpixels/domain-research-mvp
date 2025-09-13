import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
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

    const savedDomains = await prisma.savedDomain.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(savedDomains);
    
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

    const savedDomain = await prisma.savedDomain.create({
      data: {
        userId: user.id,
        domain,
        notes: notes || ''
      }
    });

    return NextResponse.json(savedDomain);
    
  } catch (error) {
    console.error('Save domain error:', error);
    if (error.code === 'P2002') {
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
    const { searchParams } = new URL(request.url);
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