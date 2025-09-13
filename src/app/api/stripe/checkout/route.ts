import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    const { plan } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Plan pricing (in cents)
    const plans = {
      starter: { 
        price: 2900, 
        name: 'Starter Plan',
        description: '500 searches/month, full security reports, CSV exports'
      },
      pro: { 
        price: 9900, 
        name: 'Pro Plan',
        description: 'Unlimited searches, API access, bulk processing, historical data'
      },
      enterprise: { 
        price: 29900, 
        name: 'Enterprise Plan',
        description: 'White-label options, custom reporting, team features, priority support'
      }
    };

    const selectedPlan = plans[plan as keyof typeof plans];
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get the origin from request headers
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
              images: [], // You can add product images here later
            },
            unit_amount: selectedPlan.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?success=true&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        userId,
        plan,
      },
      // Optional: Add customer email if available
      customer_email: undefined, // Will be populated by Clerk user data if needed
      
      // Allow promotion codes
      allow_promotion_codes: true,
      
      // Subscription data
      subscription_data: {
        metadata: {
          userId,
          plan,
        },
      },
      
      // Billing address collection
      billing_address_collection: 'required',
      
      // Tax calculation (if you have Stripe Tax enabled)
      automatic_tax: {
        enabled: false, // Set to true if you want automatic tax calculation
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
    
  } catch (error) {
    console.error('Stripe checkout error:', error);
    
    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ 
        error: `Payment processing failed: ${error.message}` 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Optional: GET endpoint to retrieve checkout session details
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Verify this session belongs to the current user
    if (session.metadata?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    });
    
  } catch (error) {
    console.error('Stripe session retrieval error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve session' 
    }, { status: 500 });
  }
}