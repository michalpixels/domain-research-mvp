node -e "
const fs = require('fs');
const script = `
// test-payment-flow.js
console.log('🧪 Testing Payment Flow Setup');
console.log('Make sure these environment variables are set:');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('');
console.log('🎯 Next Steps:');
console.log('1. Go to http://localhost:3000');
console.log('2. Sign in with a test account'); 
console.log('3. Go to http://localhost:3000/pricing');
console.log('4. Click \"Start 7-Day Free Trial\"');
console.log('5. Use test card: 4242 4242 4242 4242');
`;
fs.writeFileSync('test-payment-flow.js', script);
console.log('✅ Created test-payment-flow.js');
"