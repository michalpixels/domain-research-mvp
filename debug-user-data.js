// debug-user-data.js - Check what's in the database
const { PrismaClient } = require('@prisma/client');

async function debugUserData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Debugging user search data...\n');
    
    // Find the user with starter plan
    const starterUsers = await prisma.user.findMany({
      where: { plan: 'starter' },
      select: {
        email: true,
        plan: true,
        searchLimit: true,
        searchesUsed: true,
        updatedAt: true
      }
    });
    
    console.log('📋 Starter plan users:');
    starterUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email}`);
      console.log(`      Plan: ${user.plan}`);
      console.log(`      Search Limit: ${user.searchLimit}`);
      console.log(`      Searches Used: ${user.searchesUsed}`);
      console.log(`      Remaining: ${user.searchLimit - user.searchesUsed}`);
      console.log(`      Last Updated: ${user.updatedAt.toLocaleString()}\n`);
    });
    
    // Check if searchLimit is actually wrong
    const problematicUsers = starterUsers.filter(user => 
      (user.searchLimit - user.searchesUsed) > 1000 || 
      user.searchLimit !== 500
    );
    
    if (problematicUsers.length > 0) {
      console.log('⚠️ Found problematic users:');
      problematicUsers.forEach(user => {
        console.log(`   ${user.email}: limit=${user.searchLimit}, used=${user.searchesUsed}`);
      });
      
      console.log('\n🔧 Fix command:');
      console.log('   node debug-user-data.js fix');
    } else {
      console.log('✅ All users look correct. The issue might be in the frontend calculation.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function fixUserData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing starter plan users...\n');
    
    const result = await prisma.user.updateMany({
      where: { plan: 'starter' },
      data: {
        searchLimit: 500,
        searchesUsed: 0  // Reset to 0 for clean start
      }
    });
    
    console.log(`✅ Updated ${result.count} starter plan users`);
    console.log('   - Search limit set to 500');
    console.log('   - Searches used reset to 0');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args[0] === 'fix') {
  fixUserData();
} else {
  debugUserData();
}