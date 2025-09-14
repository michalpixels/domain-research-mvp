// debug-api-calls.js - Test individual API calls
async function testDomainAPIs(domain) {
  console.log(`🔍 Testing APIs for domain: ${domain}\n`);
  
  // Test WhoisJSON API
  console.log('📋 Testing WhoisJSON API...');
  try {
    const whoisResponse = await fetch(
      `https://whoisjson.com/api/v1/whois?domain=${domain}`,
      {
        headers: { 
          'Authorization': `Token=${process.env.WHOISJSON_API_KEY}`,
          'Accept': 'application/json',
          'User-Agent': 'DomainInsight/1.0'
        },
        signal: AbortSignal.timeout(15000)
      }
    );
    
    if (whoisResponse.ok) {
      const whoisData = await whoisResponse.json();
      console.log(`✅ WhoisJSON: ${whoisResponse.status} - Registrar: ${whoisData.registrar?.name || whoisData.registrar || 'Unknown'}`);
    } else {
      console.log(`❌ WhoisJSON: ${whoisResponse.status} ${whoisResponse.statusText}`);
      const errorText = await whoisResponse.text();
      console.log(`   Error details: ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`❌ WhoisJSON Error: ${error.message}`);
  }
  
  // Test VirusTotal API
  console.log('\n🛡️ Testing VirusTotal API...');
  try {
    const vtResponse = await fetch(
      `https://www.virustotal.com/api/v3/domains/${domain}`,
      {
        headers: {
          'x-apikey': process.env.VIRUSTOTAL_API_KEY,
          'User-Agent': 'DomainInsight/1.0'
        },
        signal: AbortSignal.timeout(15000)
      }
    );
    
    if (vtResponse.ok) {
      const vtData = await vtResponse.json();
      const stats = vtData.data.attributes.last_analysis_stats;
      console.log(`✅ VirusTotal: ${vtResponse.status} - Malicious: ${stats.malicious}, Clean: ${stats.harmless}`);
    } else {
      console.log(`❌ VirusTotal: ${vtResponse.status} ${vtResponse.statusText}`);
      const errorText = await vtResponse.text();
      console.log(`   Error details: ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`❌ VirusTotal Error: ${error.message}`);
  }
  
  // Test DNS lookup
  console.log('\n🌐 Testing DNS lookup...');
  try {
    const dnsResponse = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
      {
        headers: { 
          'Accept': 'application/dns-json',
          'User-Agent': 'DomainInsight/1.0'
        },
        signal: AbortSignal.timeout(5000)
      }
    );
    
    if (dnsResponse.ok) {
      const dnsData = await dnsResponse.json();
      const ips = dnsData.Answer?.map(record => record.data) || [];
      console.log(`✅ DNS: ${dnsResponse.status} - IPs found: ${ips.length > 0 ? ips.join(', ') : 'None'}`);
      
      // Test AbuseIPDB if we got IPs
      if (ips.length > 0) {
        console.log('\n🔒 Testing AbuseIPDB API...');
        try {
          const abuseResponse = await fetch(
            `https://api.abuseipdb.com/api/v2/check?ipAddress=${ips[0]}&maxAgeInDays=90&verbose`,
            {
              headers: {
                'Key': process.env.ABUSE_IP_DB_KEY,
                'Accept': 'application/json'
              },
              signal: AbortSignal.timeout(10000)
            }
          );
          
          if (abuseResponse.ok) {
            const abuseData = await abuseResponse.json();
            console.log(`✅ AbuseIPDB: ${abuseResponse.status} - IP: ${ips[0]}, Abuse: ${abuseData.data.abuseConfidencePercentage}%`);
          } else {
            console.log(`❌ AbuseIPDB: ${abuseResponse.status} ${abuseResponse.statusText}`);
          }
        } catch (error) {
          console.log(`❌ AbuseIPDB Error: ${error.message}`);
        }
      }
    } else {
      console.log(`❌ DNS: ${dnsResponse.status} ${dnsResponse.statusText}`);
    }
  } catch (error) {
    console.log(`❌ DNS Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
}

// Test multiple domains
async function runTests() {
  console.log('🧪 API Debug Test - Starting...\n');
  
  // Check environment variables first
  console.log('🔑 Checking API keys:');
  console.log(`WHOISJSON_API_KEY: ${process.env.WHOISJSON_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`VIRUSTOTAL_API_KEY: ${process.env.VIRUSTOTAL_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`ABUSE_IP_DB_KEY: ${process.env.ABUSE_IP_DB_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log('\n' + '='.repeat(50));
  
  // Test domains
  await testDomainAPIs('google.com'); // Known good domain
  await testDomainAPIs('actioo.com');  // Problem domain
}

runTests().catch(console.error);