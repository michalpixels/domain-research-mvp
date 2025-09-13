import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

// Rate limiting cache (in production, use Redis)
const searchCache = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domain } = await request.json();
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Get user and check limits
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      // Create user if doesn't exist
      const { user: clerkUser } = await auth();
      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser?.emailAddresses?.[0]?.emailAddress || '',
          plan: 'free',
          searchesUsed: 0,
          searchLimit: 20
        }
      });
    }

    const currentUser = user || await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    // Check rate limits for free users
    if (currentUser?.plan === 'free' && currentUser.searchesUsed >= currentUser.searchLimit) {
      return NextResponse.json({ 
        error: 'Search limit reached. Upgrade to continue.' 
      }, { status: 429 });
    }

    // Perform domain research
    const domainService = new DomainResearchService();
    const results = await domainService.researchDomain(domain);

    // Save search and increment counter
    await Promise.all([
      prisma.domainSearch.create({
        data: {
          userId: currentUser!.id,
          domain,
          searchData: results
        }
      }),
      prisma.user.update({
        where: { id: currentUser!.id },
        data: { searchesUsed: { increment: 1 } }
      })
    ]);

    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Domain research error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Domain Research Service
class DomainResearchService {
  private cache = new Map();
  
  async researchDomain(domain: string) {
    const cacheKey = `domain:${domain}`;
    
    // Check cache first (1 hour TTL)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }
    
    try {
      // Parallel API calls for better performance
      const [whoisData, securityData, dnsData] = await Promise.allSettled([
        this.getWhoisData(domain),
        this.getSecurityData(domain),
        this.getDnsData(domain)
      ]);
      
      const result = {
        domain,
        whois: whoisData.status === 'fulfilled' ? whoisData.value : null,
        security: securityData.status === 'fulfilled' ? securityData.value : null,
        dns: dnsData.status === 'fulfilled' ? dnsData.value : null,
        timestamp: new Date().toISOString(),
        cached: false
      };
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: { ...result, cached: true },
        timestamp: Date.now()
      });
      
      return result;
      
    } catch (error) {
      throw new Error(`Domain research failed: ${error.message}`);
    }
  }
  
  private async getWhoisData(domain: string) {
    if (!process.env.WHOISJSON_API_KEY) {
      // Return mock data for development
      return {
        registrar: 'GoDaddy',
        registrationDate: '2020-01-15',
        expirationDate: '2025-01-15',
        nameServers: ['ns1.example.com', 'ns2.example.com'],
        registrant: {
          organization: 'Example Organization',
          country: 'US'
        }
      };
    }
    
    const response = await fetch(
      `https://api.whoisjson.com/v1/whois?domain=${domain}`,
      {
        headers: { 
          'Authorization': `Bearer ${process.env.WHOISJSON_API_KEY}` 
        },
        signal: AbortSignal.timeout(10000)
      }
    );
    
    if (!response.ok) {
      throw new Error(`WhoisJSON API error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  private async getSecurityData(domain: string) {
    if (!process.env.VIRUSTOTAL_API_KEY) {
      // Return mock data for development
      return {
        malicious: false,
        reputation: 'Clean',
        lastScan: new Date().toISOString().split('T')[0],
        threats: 0
      };
    }
    
    try {
      const response = await fetch(
        `https://www.virustotal.com/vtapi/v2/domain/report?apikey=${process.env.VIRUSTOTAL_API_KEY}&domain=${domain}`,
        {
          signal: AbortSignal.timeout(10000)
        }
      );
      
      if (!response.ok) {
        return null;
      }
      
      return response.json();
    } catch (error) {
      console.warn('VirusTotal API error:', error);
      return null;
    }
  }
  
  private async getDnsData(domain: string) {
    try {
      // Using free DNS-over-HTTPS service
      const types = ['A', 'MX', 'TXT', 'NS'];
      const dnsResults: any = {};
      
      for (const type of types) {
        try {
          const response = await fetch(
            `https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`,
            {
              headers: { 'Accept': 'application/dns-json' },
              signal: AbortSignal.timeout(5000)
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            dnsResults[type.toLowerCase()] = data.Answer?.map((a: any) => a.data) || [];
          }
        } catch (error) {
          console.warn(`DNS lookup error for ${type}:`, error);
          dnsResults[type.toLowerCase()] = [];
        }
      }
      
      return dnsResults;
    } catch (error) {
      console.warn('DNS lookup error:', error);
      return null;
    }
  }
}