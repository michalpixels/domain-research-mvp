// check-db-data.js - Run this to see what's in your database
const { PrismaClient } = require('@prisma/client');

async function checkDatabaseData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📊 Checking database content...\n');
    
    // Get latest domain searches
    const searches = await prisma.domainSearch.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        user: {
          select: { email: true, plan: true }
        }
      }
    });
    
    console.log(`🔍 Latest ${searches.length} domain searches:`);
    
    searches.forEach((search, index) => {
      console.log(`\n${index + 1}. Domain: ${search.domain}`);
      console.log(`   User: ${search.user.email} (${search.user.plan})`);
      console.log(`   Date: ${search.createdAt.toLocaleString()}`);
      
      // Parse and display the stored data
      const data = search.searchData;
      
      console.log(`   WHOIS: ${data.whois ? '✅ Available' : '❌ Missing'}`);
      console.log(`   Security: ${data.security ? '✅ Available' : '❌ Missing'}`);
      console.log(`   DNS: ${data.dns ? '✅ Available' : '❌ Missing'}`);
      console.log(`   Abuse: ${data.abuse ? '✅ Available' : '❌ Missing'}`);
      
      if (data.abuse) {
        console.log(`   Abuse details: IP ${data.abuse.ip}, Confidence ${data.abuse.abuseConfidence}%`);
      }
      
      if (data.errors && data.errors.length > 0) {
        console.log(`   Errors: ${data.errors.join(', ')}`);
      }
    });
    
    // Check user stats
    const users = await prisma.user.findMany({
      select: {
        email: true,
        plan: true,
        searchesUsed: true,
        searchLimit: true,
        _count: {
          select: { domainSearches: true }
        }
      }
    });
    
    console.log(`\n👥 Users (${users.length}):`);
    users.forEach(user => {
      console.log(`   ${user.email}: ${user._count.domainSearches} searches, ${user.searchesUsed}/${user.searchLimit} used (${user.plan})`);
    });
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseData();