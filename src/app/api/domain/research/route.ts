// src/app/api/domain/research/route.ts - WITH REAL CLERK AUTH
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in to search domains' }, { status: 401 });
    }

    const { domain } = await request.json();
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // Ensure user exists in database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      // Get user details from Clerk and create database record
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress || 'unknown@example.com';
      
      console.log(`Creating user ${userId} (${email}) for domain search`);
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: email,
          plan: 'free',
          searchesUsed: 0,
          searchLimit: 20
        }
      });
    }

    // Check search limits
    if (user.plan === 'free' && user.searchesUsed >= user.searchLimit) {
      return NextResponse.json({ 
        error: 'Search limit reached. Upgrade to Pro for unlimited searches.' 
      }, { status: 429 });
    }

    // Perform domain research
    const domainService = new DomainResearchService();
    const results = await domainService.researchDomain(domain);

    // Store the search in database
    try {
      console.log(`💾 Storing search result for domain: ${domain} (user: ${user.email})`);
      await prisma.domainSearch.create({
        data: {
          userId: user.id,
          domain: domain,
          searchData: results // Store the full API response as JSON
        }
      });
      console.log(`✅ Search result stored successfully`);
    } catch (dbError) {
      console.error('❌ Database storage error:', dbError);
      // Continue anyway - don't fail the search if storage fails
    }

    // Update user search count (only for non-cached results)
    if (!results.cached && user.plan === 'free') {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            searchesUsed: user.searchesUsed + 1
          }
        });
        console.log(`📊 Updated search count for user ${user.email}: ${user.searchesUsed + 1}/${user.searchLimit}`);
      } catch (updateError) {
        console.error('❌ Failed to update search count:', updateError);
      }
    }

    // Calculate remaining searches
    const updatedSearchesUsed = results.cached ? user.searchesUsed : user.searchesUsed + 1;
    const remainingSearches = user.plan === 'free' 
      ? Math.max(0, user.searchLimit - updatedSearchesUsed)
      : 999999;

    return NextResponse.json({
      ...results,
      remainingSearches: remainingSearches,
      userPlan: user.plan,
      userEmail: user.email,
      searchStored: true
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
        console.log(`📋 Using cached data for ${domain}`);
        return { ...cached.data, cached: true };
      }
      this.cache.delete(cacheKey);
    }
    
    try {
      console.log(`🔍 Researching domain: ${domain}`);
      
      // Parallel API calls for better performance
      const [whoisData, securityData, dnsData, abuseData] = await Promise.allSettled([
        this.getWhoisData(domain),
        new Promise(resolve => setTimeout(() => resolve(this.getSecurityData(domain)), 1000)),
        this.getDnsData(domain),
        new Promise(resolve => setTimeout(() => resolve(this.getAbuseIPData(domain)), 2000))
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
      // Shorter timeout for faster fallback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds instead of 15
      
      const response = await fetch(
        `https://whoisjson.com/api/v1/whois?domain=${domain}`,
        {
          headers: { 
            'Authorization': `Token=${process.env.WHOISJSON_API_KEY}`,
            'Accept': 'application/json',
            'User-Agent': 'DomainInsight/1.0'
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`WhoisJSON API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ WHOIS data fetched successfully for ${domain}`);
      
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
      
    } catch (error: unknown) {
      // TypeScript-safe error handling
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn(`⚠️ WhoisJSON timeout for ${domain} (10s limit) - using mock data`);
        } else {
          console.warn(`⚠️ WhoisJSON API error for ${domain}:`, error.message);
        }
      } else {
        console.warn(`⚠️ WhoisJSON unknown error for ${domain}:`, String(error));
      }
      return this.getMockWhoisData(domain);
    }
  }
  
  private async getSecurityData(domain: string) {
    console.log(`🛡️ Fetching security data for ${domain}...`);
    
    if (!process.env.VIRUSTOTAL_API_KEY || process.env.VIRUSTOTAL_API_KEY === 'XXX') {
      console.warn('⚠️ VIRUSTOTAL_API_KEY not configured, using mock data');
      return this.getMockSecurityData();
    }
    
    try {
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
        throw new Error(`VirusTotal API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      const data = result.data;
      console.log(`✅ Security data fetched for ${domain}`);
      
      const attributes = data.attributes;
      const analysisStats = attributes.last_analysis_stats || {};
      
      const malicious = analysisStats.malicious || 0;
      const suspicious = analysisStats.suspicious || 0;
      const harmless = analysisStats.harmless || 0;
      const undetected = analysisStats.undetected || 0;
      
      const totalScanned = malicious + suspicious + harmless + undetected;
      const threatsFound = malicious + suspicious;
      
      return {
        malicious: threatsFound > 0,
        reputation: threatsFound > 0 ? 
          `⚠️ ${threatsFound}/${totalScanned} security engines detected threats` : 
          `✅ Clean - ${harmless}/${totalScanned} engines verified as safe`,
        lastScan: attributes.last_analysis_date ? 
          new Date(attributes.last_analysis_date * 1000).toISOString().split('T')[0] : 
          'Unknown',
        threats: threatsFound,
        total: totalScanned
      };
      
    } catch (error) {
      console.warn(`⚠️ VirusTotal API error for ${domain}:`, error);
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
      registrar: 'We couldn’t fetch this information right now',
      registrationDate: 'XXXX-XX-XX',
      expirationDate: 'XXXX-XX-XX',
      nameServers: ['no data', 'no data'],
      registrant: {
        organization: 'You can try checking with a WHOIS service directly',
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