import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  
  // Fix for Next.js 15 - get signature from request headers directly
  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  console.log(`Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.metadata?.userId && session.metadata?.plan) {
          await prisma.user.update({
            where: { clerkId: session.metadata.userId },
            data: {
              plan: session.metadata.plan,
              searchLimit: getSearchLimit(session.metadata.plan),
              searchesUsed: 0 // Reset searches on upgrade
            }
          });
          console.log(`Updated user ${session.metadata.userId} to ${session.metadata.plan} plan`);
        }
        break;
        
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        // Handle subscription cancellation - downgrade to free
        if (subscription.metadata?.userId) {
          await prisma.user.update({
            where: { clerkId: subscription.metadata.userId },
            data: {
              plan: 'free',
              searchLimit: 20,
              searchesUsed: 0
            }
          });
          console.log(`Downgraded user ${subscription.metadata.userId} to free plan`);
        }
        break;
        
      case 'invoice.payment_failed':
        // Handle failed payment
        console.log('Payment failed:', event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

function getSearchLimit(plan: string): number {
  const limits: { [key: string]: number } = {
    free: 20,
    starter: 500,
    pro: 999999, // "unlimited"
    enterprise: 999999
  };
  return limits[plan] || 20;
}