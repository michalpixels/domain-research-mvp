// test-db.js - Run this to test your database connection
const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔌 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test user table
    const userCount = await prisma.user.count();
    console.log(`👥 Users in database: ${userCount}`);
    
    // Test domain searches table
    const searchCount = await prisma.domainSearch.count();
    console.log(`🔍 Domain searches in database: ${searchCount}`);
    
    // Test saved domains table
    const savedCount = await prisma.savedDomain.count();
    console.log(`⭐ Saved domains in database: ${savedCount}`);
    
    // Test creating a temp user (with error handling)
    try {
      const tempUser = await prisma.user.upsert({
        where: { clerkId: 'temp-user-123' },
        update: {}, // Don't update if exists
        create: {
          clerkId: 'temp-user-123',
          email: 'temp@example.com',
          plan: 'free',
          searchesUsed: 0,
          searchLimit: 20
        }
      });
      console.log(`🆔 Temp user status: ${tempUser.plan} plan, ${tempUser.searchesUsed}/${tempUser.searchLimit} searches used`);
    } catch (userError) {
      console.log('❌ User creation error:', userError.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Check your DATABASE_URL in .env file');
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();