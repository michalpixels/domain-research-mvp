// Quick fix for the negative searchesUsed issue
// Run this to reset your user's search count:

const { PrismaClient } = require('@prisma/client');

async function fixSearchCount() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing negative search counts...\n');
    
    // Find users with negative or very high search counts
    const problematicUsers = await prisma.user.findMany({
      where: {
        OR: [
          { searchesUsed: { lt: 0 } },  // Negative values
          { searchesUsed: { gt: 10000 } }  // Unreasonably high values
        ]
      }
    });
    
    console.log(`Found ${problematicUsers.length} users with problematic search counts:`);
    problematicUsers.forEach(user => {
      console.log(`   ${user.email}: ${user.searchesUsed} searches used (${user.plan} plan)`);
    });
    
    // Reset all problematic search counts
    const result = await prisma.user.updateMany({
      where: {
        OR: [
          { searchesUsed: { lt: 0 } },
          { searchesUsed: { gt: 10000 } }
        ]
      },
      data: {
        searchesUsed: 0
      }
    });
    
    console.log(`\n✅ Reset search count for ${result.count} users`);
    console.log('💡 All affected users now have searchesUsed = 0');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSearchCount();