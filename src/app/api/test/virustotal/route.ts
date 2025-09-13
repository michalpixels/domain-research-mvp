// Create this file: src/app/api/test/virustotal/route.ts
// This is a test endpoint to check if your VirusTotal API is working

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain') || 'google.com';
  
  console.log(`🧪 Testing VirusTotal API for domain: ${domain}`);
  
  if (!process.env.VIRUSTOTAL_API_KEY) {
    return NextResponse.json({ 
      error: 'VIRUSTOTAL_API_KEY not found in environment variables',
      hasKey: false
    });
  }
  
  try {
    // Test with a known malicious domain for better testing
    const testDomain = domain === 'malicious-test' ? 'malware.com' : domain;
    
    console.log(`🔍 Making request to VirusTotal API v3...`);
    const response = await fetch(
      `https://www.virustotal.com/api/v3/domains/${testDomain}`,
      {
        headers: {
          'x-apikey': process.env.VIRUSTOTAL_API_KEY,
          'User-Agent': 'DomainInsight-Test/1.0'
        },
        signal: AbortSignal.timeout(15000)
      }
    );
    
    console.log(`📡 VirusTotal API Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: `VirusTotal API error: ${response.status} ${response.statusText}`,
        status: response.status,
        details: errorText,
        hasKey: true,
        keyWorking: false,
        suggestions: getErrorSuggestions(response.status)
      });
    }
    
    const data = await response.json();
    const attributes = data.data.attributes;
    
    console.log(`✅ VirusTotal API working! Analysis stats:`, attributes.last_analysis_stats);
    
    return NextResponse.json({
      success: true,
      domain: testDomain,
      hasKey: true,
      keyWorking: true,
      analysisStats: attributes.last_analysis_stats,
      lastAnalysisDate: attributes.last_analysis_date,
      reputation: attributes.reputation,
      categories: attributes.categories,
      rawResponse: {
        id: data.data.id,
        type: data.data.type,
        analysisResultsCount: Object.keys(attributes.last_analysis_results || {}).length
      }
    });
    
  } catch (error) {
    console.error(`❌ VirusTotal API test failed:`, error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      hasKey: true,
      keyWorking: false,
      suggestions: [
        'Check your API key is correct',
        'Verify you have remaining quota',
        'Wait 1 minute between requests (rate limit)',
        'Check your internet connection'
      ]
    });
  }
}

function getErrorSuggestions(status: number): string[] {
  switch (status) {
    case 401:
    case 403:
      return [
        'Your API key is invalid or expired',
        'Check the key in your .env file',
        'Generate a new key at virustotal.com',
        'Make sure there are no extra spaces in the key'
      ];
    case 429:
      return [
        'Rate limit exceeded (4 requests/minute for free)',
        'Wait 60 seconds before trying again',
        'Consider upgrading to premium for higher limits'
      ];
    case 404:
      return [
        'Domain not found in VirusTotal database',
        'Try a more common domain like google.com',
        'Submit the domain for analysis first'
      ];
    default:
      return [
        'Check your internet connection',
        'Try again in a few minutes',
        'Verify VirusTotal service status'
      ];
  }
}