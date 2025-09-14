// webhook-debug.js - Debug webhooks and manually process payments
const { PrismaClient } = require('@prisma/client');

async function debugWebhooks() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Webhook Debug Tool\n');
    
    // Check webhook configuration
    console.log('📋 Environment Check:');
    console.log(`   STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}\n`);
    
    // Find users who might need manual upgrade
    console.log('👥 Recent Users (potential manual upgrades):');
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        email: true,
        clerkId: true,
        plan: true,
        searchLimit: true,
        createdAt: true
      }
    });
    
    if (recentUsers.length === 0) {
      console.log('   No recent users found\n');
    } else {
      recentUsers.forEach((user, index) => {
        const shortId = user.clerkId.slice(-8);
        console.log(`   ${index + 1}. ${user.email} (${user.plan}) - ID: ...${shortId}`);
      });
      console.log('');
    }
    
    // Show commands for manual upgrade
    console.log('🔧 Manual Upgrade Commands:');
    console.log('   node webhook-debug.js upgrade USER_EMAIL starter');
    console.log('   node webhook-debug.js upgrade USER_EMAIL pro\n');
    
    console.log('🧪 Webhook Testing:');
    console.log('   Since webhooks don\'t work in local development without Stripe CLI,');
    console.log('   use the dashboard page to automatically upgrade users after payment.\n');
    
    console.log('💡 How it works:');
    console.log('   1. User completes payment → redirected to /dashboard');
    console.log('   2. Dashboard detects success=true in URL');
    console.log('   3. Dashboard calls /api/user/subscription to upgrade user');
    console.log('   4. User sees success message and upgraded features');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function upgradeUser(email, plan) {
  const prisma = new PrismaClient();
  
  try {
    const searchLimits = {
      free: 20,
      starter: 500,
      pro: 999999,
      enterprise: 999999
    };
    
    if (!searchLimits[plan]) {
      console.log('❌ Invalid plan. Use: free, starter, pro, or enterprise');
      return;
    }
    
    console.log(`🔄 Upgrading ${email} to ${plan} plan...`);
    
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: {
        plan: plan,
        searchLimit: searchLimits[plan],
        searchesUsed: 0
      }
    });
    
    console.log('✅ User upgraded successfully:');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Plan: ${updatedUser.plan}`);
    console.log(`   Search Limit: ${updatedUser.searchLimit}`);
    
  } catch (error) {
    if (error.code === 'P2025') {
      console.log(`❌ User ${email} not found`);
    } else {
      console.error('❌ Error:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args[0] === 'upgrade' && args[1] && args[2]) {
  upgradeUser(args[1], args[2]);
} else {
  debugWebhooks();
}