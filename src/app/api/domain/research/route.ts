// src/app/api/domain/research/route.ts - COMPLETE FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // TEMPORARY: Skip auth for testing
    const userId = 'temp-user-123';
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domain } = await request.json();
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // Mock user data for testing
    const mockUser = {
      plan: 'free',
      searchesUsed: 5,
      searchLimit: 20
    };

    // Perform domain research
    const domainService = new DomainResearchService();
    const results = await domainService.researchDomain(domain);

    return NextResponse.json({
      ...results,
      remainingSearches: mockUser.searchLimit - (mockUser.searchesUsed + 1),
      userPlan: mockUser.plan
    });
    
  } catch (error) {
    console.error('Domain research error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

class DomainResearchService {
  private cache = new Map();
  
  async researchDomain(domain: string) {
    const cacheKey = `domain:${domain}`;
    
    // Check cache first (1 hour TTL)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) {
        return { ...cached.data, cached: true };
      }
      this.cache.delete(cacheKey);
    }
    
    try {
      console.log(`🔍 Researching domain: ${domain}`);
      
      // Parallel API calls for better performance - NOW INCLUDING ABUSEIPDB
      const [whoisData, securityData, dnsData, abuseData] = await Promise.allSettled([
        this.getWhoisData(domain),
        this.getSecurityData(domain),
        this.getDnsData(domain),
        this.getAbuseIPData(domain)
      ]);
      
      const result = {
        domain,
        whois: whoisData.status === 'fulfilled' ? whoisData.value : null,
        security: securityData.status === 'fulfilled' ? securityData.value : null,
        dns: dnsData.status === 'fulfilled' ? dnsData.value : null,
        abuse: abuseData.status === 'fulfilled' ? abuseData.value : null,
        timestamp: new Date().toISOString(),
        cached: false,
        errors: this.collectErrors([whoisData, securityData, dnsData, abuseData])
      };
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      console.log(`✅ Domain research completed for: ${domain}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Domain research failed for ${domain}:`, error);
      throw new Error(`Domain research failed: ${String(error)}`);
    }
  }
  
  private collectErrors(results: PromiseSettledResult<any>[]) {
    return results
      .filter(r => r.status === 'rejected')
      .map(r => r.reason?.message || 'Unknown error');
  }
  
  private async getWhoisData(domain: string) {
    console.log(`📋 Fetching WHOIS data for ${domain}...`);
    
    if (!process.env.WHOISJSON_API_KEY || process.env.WHOISJSON_API_KEY === 'XXX') {
      console.warn('⚠️ WHOISJSON_API_KEY not configured, using mock data');
      return this.getMockWhoisData(domain);
    }
    
    try {
      // Correct WhoisJSON API endpoint and authentication
      const response = await fetch(
        `https://whoisjson.com/api/v1/whois?domain=${domain}`,
        {
          headers: { 
            'Authorization': `Token=${process.env.WHOISJSON_API_KEY}`,
            'Accept': 'application/json',
            'User-Agent': 'DomainInsight/1.0'
          },
          signal: AbortSignal.timeout(15000) // Increased timeout
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('🔑 WhoisJSON Authentication Error:');
          console.error('   - Check your API key in .env file');
          console.error('   - Verify you have remaining credits');
          console.error('   - Visit https://whoisjson.com/dashboard');
          throw new Error(`WhoisJSON authentication failed - check your API key`);
        }
        if (response.status === 429) {
          throw new Error(`WhoisJSON rate limit exceeded`);
        }
        throw new Error(`WhoisJSON API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ WHOIS data fetched successfully for ${domain}`);
      
      // Parse and normalize the WhoisJSON response format
      return {
        registrar: data.registrar?.name || data.registrar || 'Unknown',
        registrationDate: data.created || data.creation_date || 'Unknown', 
        expirationDate: data.expires || data.expiry_date || 'Unknown',
        nameServers: data.nameserver || data.nameservers || [],
        registrant: {
          organization: data.contacts?.registrant?.organization || 
                      data.registrant_organization || 
                      data.admin_organization ||
                      'Private Registration',
          country: data.contacts?.registrant?.country || 
                  data.registrant_country || 
                  data.admin_country ||
                  'Unknown'
        },
        status: Array.isArray(data.status) ? data.status : (data.status ? [data.status] : []),
        dnssec: data.dnssec || 'Unknown'
      };
      
    } catch (error) {
      console.warn(`⚠️ WhoisJSON API error for ${domain}:`, error);
      return this.getMockWhoisData(domain);
    }
  }
  
  // Updated getSecurityData method - replace in your API route
  private async getSecurityData(domain: string) {
    console.log(`🛡️ Fetching security data for ${domain}...`);
    
    if (!process.env.VIRUSTOTAL_API_KEY || process.env.VIRUSTOTAL_API_KEY === 'XXX') {
      console.warn('⚠️ VIRUSTOTAL_API_KEY not configured, using mock data');
      return this.getMockSecurityData();
    }
    
    try {
      // Use VirusTotal API v3 for better results
      const response = await fetch(
        `https://www.virustotal.com/api/v3/domains/${domain}`,
        {
          headers: {
            'x-apikey': process.env.VIRUSTOTAL_API_KEY,
            'User-Agent': 'DomainInsight/1.0'
          },
          signal: AbortSignal.timeout(15000)
        }
      );
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(`VirusTotal API key invalid or expired`);
        }
        if (response.status === 429) {
          throw new Error(`VirusTotal rate limit exceeded (max 4 requests/minute for free)`);
        }
        if (response.status === 404) {
          // Domain not in VirusTotal database yet
          console.log(`⚠️ Domain ${domain} not found in VirusTotal database`);
          return {
            malicious: false,
            reputation: 'Not yet analyzed by VirusTotal',
            lastScan: 'Never',
            threats: 0,
            total: 0,
            scanId: null,
            notInDatabase: true
          };
        }
        throw new Error(`VirusTotal API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      const data = result.data;
      console.log(`✅ Security data fetched for ${domain}`);
      
      // Parse VirusTotal v3 response
      const attributes = data.attributes;
      const analysisStats = attributes.last_analysis_stats || {};
      const analysisResults = attributes.last_analysis_results || {};
      
      const malicious = analysisStats.malicious || 0;
      const suspicious = analysisStats.suspicious || 0;
      const harmless = analysisStats.harmless || 0;
      const undetected = analysisStats.undetected || 0;
      const timeout = analysisStats.timeout || 0;
      
      const totalScanned = malicious + suspicious + harmless + undetected + timeout;
      const threatsFound = malicious + suspicious;
      
      // Get detailed threat information
      const threatDetails = [];
      if (analysisResults) {
        for (const [engine, result] of Object.entries(analysisResults)) {
          if (result.category === 'malicious' || result.category === 'suspicious') {
            threatDetails.push(`${engine}: ${result.result}`);
          }
        }
      }
      
      return {
        malicious: threatsFound > 0,
        reputation: threatsFound > 0 ? 
          `⚠️ ${threatsFound}/${totalScanned} security engines detected threats` : 
          `✅ Clean - ${harmless}/${totalScanned} engines verified as safe`,
        lastScan: attributes.last_analysis_date ? 
          new Date(attributes.last_analysis_date * 1000).toISOString().split('T')[0] : 
          'Unknown',
        threats: threatsFound,
        total: totalScanned,
        harmless: harmless,
        suspicious: suspicious,
        malicious: malicious,
        undetected: undetected,
        categories: attributes.categories || [],
        threatDetails: threatDetails.slice(0, 3), // Show top 3 threat details
        reputation_score: attributes.reputation || 0,
        scanId: data.id
      };
      
    } catch (error) {
      console.warn(`⚠️ VirusTotal API error for ${domain}:`, error);
      
      // If it's a rate limit error, provide helpful guidance
      if (error instanceof Error && error.message.includes('rate limit')) {
        console.error('⏰ VirusTotal Rate Limit Info:');
        console.error('   - Free API: 4 requests per minute');
        console.error('   - Wait 1 minute between searches');
        console.error('   - Consider upgrading for higher limits');
      }
      
      return this.getMockSecurityData();
    }
  }

  private async getAbuseIPData(domain: string) {
    console.log(`🔍 Checking IP reputation for ${domain}...`);
    
    if (!process.env.ABUSE_IP_DB_KEY || process.env.ABUSE_IP_DB_KEY === 'XXX') {
      console.warn('⚠️ ABUSE_IP_DB_KEY not configured');
      return null;
    }
    
    try {
      // First, get the domain's IP addresses from DNS
      const dnsResponse = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
        {
          headers: { 'Accept': 'application/dns-json' },
          signal: AbortSignal.timeout(5000)
        }
      );
      
      if (!dnsResponse.ok) {
        throw new Error('Failed to get IP addresses');
      }
      
      const dnsData = await dnsResponse.json();
      const ips = dnsData.Answer?.map((record: any) => record.data) || [];
      
      if (ips.length === 0) {
        return { error: 'No IP addresses found' };
      }
      
      // Check the first IP with AbuseIPDB
      const primaryIP = ips[0];
      console.log(`🌐 Checking IP ${primaryIP} with AbuseIPDB...`);
      
      const abuseResponse = await fetch(
        `https://api.abuseipdb.com/api/v2/check?ipAddress=${primaryIP}&maxAgeInDays=90&verbose`,
        {
          headers: {
            'Key': process.env.ABUSE_IP_DB_KEY,
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(10000)
        }
      );
      
      if (!abuseResponse.ok) {
        throw new Error(`AbuseIPDB API error: ${abuseResponse.status}`);
      }
      
      const abuseData = await abuseResponse.json();
      const data = abuseData.data;
      
      console.log(`✅ AbuseIPDB data fetched for IP ${primaryIP}`);
      
      return {
        ip: primaryIP,
        abuseConfidence: data.abuseConfidencePercentage,
        isAbusive: data.abuseConfidencePercentage > 25,
        countryCode: data.countryCode,
        usageType: data.usageType,
        isp: data.isp,
        domain: data.domain,
        totalReports: data.totalReports,
        numDistinctUsers: data.numDistinctUsers,
        lastReportedAt: data.lastReportedAt,
        isWhitelisted: data.isWhitelisted
      };
      
    } catch (error) {
      console.warn(`⚠️ AbuseIPDB error for ${domain}:`, error);
      return null;
    }
  }
  
  private async getDnsData(domain: string) {
    console.log(`🌐 Fetching DNS data for ${domain}...`);
    
    try {
      // Using free Cloudflare DNS-over-HTTPS service
      const types = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'];
      const dnsResults: any = {};
      
      for (const type of types) {
        try {
          const response = await fetch(
            `https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`,
            {
              headers: { 
                'Accept': 'application/dns-json',
                'User-Agent': 'DomainInsight/1.0'
              },
              signal: AbortSignal.timeout(5000)
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.Answer && data.Answer.length > 0) {
              dnsResults[type.toLowerCase()] = data.Answer.map((record: any) => ({
                value: record.data,
                ttl: record.TTL,
                type: record.type
              }));
            } else {
              dnsResults[type.toLowerCase()] = [];
            }
          }
        } catch (error) {
          console.warn(`⚠️ DNS lookup error for ${type} on ${domain}:`, error);
          dnsResults[type.toLowerCase()] = [];
        }
      }
      
      console.log(`✅ DNS data fetched for ${domain}`);
      return dnsResults;
      
    } catch (error) {
      console.warn(`⚠️ DNS lookup error for ${domain}:`, error);
      return this.getMockDnsData();
    }
  }
  
  private getMockWhoisData(domain: string) {
    return {
      registrar: 'Mock Registrar (API key needed)',
      registrationDate: '2020-01-15',
      expirationDate: '2025-01-15',
      nameServers: ['ns1.example.com', 'ns2.example.com'],
      registrant: {
        organization: 'Get real data with API key',
        country: 'US'
      },
      status: ['Mock status - configure WhoisJSON API'],
      dnssec: 'Configure API for real data'
    };
  }
  
  private getMockSecurityData() {
    return {
      malicious: false,
      reputation: 'Mock security data - configure VirusTotal API',
      lastScan: new Date().toISOString().split('T')[0],
      threats: 0,
      total: 0
    };
  }
  
  private getMockDnsData() {
    return {
      a: [{ value: '93.184.216.34', ttl: 3600, type: 1 }],
      mx: [{ value: '10 mail.example.com', ttl: 3600, type: 15 }],
      txt: [{ value: 'v=spf1 -all', ttl: 3600, type: 16 }],
      ns: [{ value: 'ns1.example.com', ttl: 3600, type: 2 }]
    };
  }
}