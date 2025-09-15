// src/components/DomainSearch.tsx - COMPLETE FIXED VERSION
"use client"

import React, { useState, useEffect } from 'react';
import { Search, Globe, Shield, Clock, Download, Star, AlertCircle, CheckCircle, XCircle, User, LogOut } from 'lucide-react';
import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs';

interface DomainResults {
  domain: string;
  whois: any;
  security: any;
  dns: any;
  cached: boolean;
  abuse?: any;
  errors?: string[];
  remainingSearches?: number;
  userPlan?: string;
  userEmail?: string;
}

interface UserStats {
  plan: string;
  searchesUsed: number;
  searchLimit: number;
  email: string;
}

const DomainSearch = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState<DomainResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [upgradeStatus, setUpgradeStatus] = useState('');
  const [savedDomains, setSavedDomains] = useState<Set<string>>(new Set());
  
  // FIXED: Initialize with null instead of default values to prevent flickering
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  // Load user subscription data when user signs in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadUserData();
    } else if (isLoaded && !isSignedIn) {
      // Clear user data when not signed in
      setUserStats(null);
      setUserDataLoaded(true);
    }
  }, [isLoaded, isSignedIn]);

  // Check URL parameters for upgrade status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const upgraded = urlParams.get('upgraded');
    const paymentSuccess = urlParams.get('payment_success');
    const paymentError = urlParams.get('payment_error');
    
    if (upgraded === 'true') {
      setUpgradeStatus('success');
      window.history.replaceState({}, document.title, window.location.pathname);
      if (isSignedIn) loadUserData();
    } else if (paymentSuccess === 'true') {
      setUpgradeStatus('manual_needed');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentError === 'true') {
      setUpgradeStatus('error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isSignedIn]);

  // Auto-search when domain is in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const domainFromUrl = urlParams.get('domain');
    
    if (domainFromUrl && !loading && isSignedIn && userDataLoaded && userStats) {
      console.log(`🔍 Auto-searching for domain from URL: ${domainFromUrl}`);
      setDomain(domainFromUrl);
      
      // Small delay to ensure user data is loaded
      setTimeout(() => {
        handleAutoSearch(domainFromUrl);
      }, 500);
      
      // Clean the URL by removing the domain parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
  }, [isSignedIn, userDataLoaded, loading, userStats]);

  // Load saved domains when user data is ready
  useEffect(() => {
    if (userDataLoaded && userStats) {
      loadSavedDomains();
    }
  }, [userDataLoaded, userStats]);

  const loadSavedDomains = async () => {
    if (!isSignedIn) return;
    
    try {
      const response = await fetch('/api/domains/saved');
      if (response.ok) {
        const data = await response.json();
        const domainNames = data.domains.map((d: any) => d.domain);
        setSavedDomains(new Set(domainNames));
      }
    } catch (error) {
      console.error('Failed to load saved domains:', error);
    }
  };

  const loadUserData = async () => {
    try {
      setUserDataLoaded(false);
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const userData = await response.json();
        setUserStats(userData);
        console.log('User data loaded:', userData);
      } else if (response.status === 401) {
        console.log('User not authenticated');
        setUserStats(null);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      setUserStats(null);
    } finally {
      setUserDataLoaded(true);
    }
  };

  const handleAutoSearch = async (searchDomain: string) => {
    if (!isSignedIn) {
      setError('Please sign in to search domains');
      return;
    }

    if (!searchDomain.trim()) {
      setError('Please enter a domain name');
      return;
    }
    
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(searchDomain.trim())) {
      setError('Please enter a valid domain name (e.g., example.com)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/domain/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: searchDomain.trim().toLowerCase() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to search domains');
          return;
        }
        throw new Error(data.error || 'Search failed');
      }
      
      setResults(data);
      
      // Update user data with remaining searches
      if (data.remainingSearches !== undefined && userStats) {
        setUserStats(prev => prev ? ({
          ...prev,
          searchesUsed: prev.searchLimit - data.remainingSearches,
          plan: data.userPlan || prev.plan
        }) : null);
      }
      
    } catch (error: any) {
      setError(error.message || 'An error occurred during the search');
      console.error('Auto-search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!isSignedIn) {
      setError('Please sign in to search domains');
      return;
    }

    if (!domain.trim()) {
      setError('Please enter a domain name');
      return;
    }
    
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain.trim())) {
      setError('Please enter a valid domain name (e.g., example.com)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/domain/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domain.trim().toLowerCase() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to search domains');
          return;
        }
        throw new Error(data.error || 'Search failed');
      }
      
      setResults(data);
      
      // Update user data with remaining searches
      if (data.remainingSearches !== undefined && userStats) {
        setUserStats(prev => prev ? ({
          ...prev,
          searchesUsed: prev.searchLimit - data.remainingSearches,
          plan: data.userPlan || prev.plan
        }) : null);
      }
      
    } catch (error: any) {
      setError(error.message || 'An error occurred during the search');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDomain = async () => {
    if (!results || !isSignedIn) return;
    
    try {
      const response = await fetch('/api/domains/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          domain: results.domain,
          notes: '' 
        }),
      });
      
      if (response.ok) {
        // Add domain to saved set for visual feedback
        setSavedDomains(prev => new Set(prev).add(results.domain));
        alert('Domain saved successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save domain');
      }
    } catch (error) {
      alert('Failed to save domain');
    }
  };

  const exportReport = () => {
    if (!results || !userStats || userStats.plan === 'free') {
      alert('Export functionality is available for Starter and Pro users only.');
      return;
    }

    try {
      const reportData = {
        domain: results.domain,
        searchDate: new Date().toISOString(),
        searchedBy: userStats.email,
        plan: userStats.plan,
        
        whois: results.whois ? {
          registrar: results.whois.registrar || 'Unknown',
          registrationDate: results.whois.registrationDate || 'Unknown',
          expirationDate: results.whois.expirationDate || 'Unknown',
          nameServers: results.whois.nameServers || [],
          organization: results.whois.registrant?.organization || 'Private',
          country: results.whois.registrant?.country || 'Unknown',
          status: results.whois.status || [],
          dnssec: results.whois.dnssec || 'Unknown'
        } : null,
        
        security: results.security ? {
          reputation: results.security.reputation || 'Unknown',
          malicious: results.security.malicious || false,
          threats: results.security.threats || 0,
          total: results.security.total || 0,
          lastScan: results.security.lastScan || 'Unknown'
        } : null,
        
        dns: results.dns || {},
        
        abuse: results.abuse ? {
          ip: results.abuse.ip,
          abuseConfidence: results.abuse.abuseConfidence,
          isAbusive: results.abuse.isAbusive,
          countryCode: results.abuse.countryCode,
          usageType: results.abuse.usageType,
          isp: results.abuse.isp,
          totalReports: results.abuse.totalReports,
          isWhitelisted: results.abuse.isWhitelisted
        } : null,
        
        errors: results.errors || []
      };

      const csvContent = generateCSVReport(reportData);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `domain-report-${results.domain}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Domain report for ${results.domain} has been exported successfully!`);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const showHistoricalData = async () => {
    if (!results || !userStats || userStats.plan === 'free') {
      alert('Historical data is available for Starter and Pro users only.');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/domain/history?domain=${results.domain}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch historical data');
      }
      
      const historicalData = await response.json();
      
      if (historicalData.snapshots.length === 0) {
        alert(`No historical data available for ${results.domain} yet. Historical data will be collected from future searches.`);
        return;
      }
      
      showHistoricalModal(historicalData);
      
    } catch (error) {
      console.error('Historical data error:', error);
      alert('Failed to load historical data: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

 // Replace this function in your DomainSearch.tsx:

  const showHistoricalModal = (historicalData: any) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 32px;
      max-width: 900px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    `;
    
    // FIXED: Create close function that safely removes modal
    const closeModal = () => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    };
    
    modalContent.innerHTML = generateRealHistoricalContent(historicalData);
    
    // X button (top right)
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
    `;
    closeButton.onclick = closeModal; // FIXED: Use proper event handler
    
    // FIXED: Create working bottom close button
    const bottomCloseButton = document.createElement('button');
    bottomCloseButton.textContent = 'Close Historical Data';
    bottomCloseButton.style.cssText = `
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 24px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    `;
    bottomCloseButton.onclick = closeModal; // FIXED: Use proper event handler
    
    modalContent.appendChild(closeButton);
    modalContent.appendChild(bottomCloseButton); // FIXED: Add working button
    modal.appendChild(modalContent);
    
    // Close on background click
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
    
    // FIXED: Add Escape key support
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    document.body.appendChild(modal);
  };

  // AND update this function to remove the broken button:
  const generateRealHistoricalContent = (data: any) => {
    const snapshots = data.snapshots;
    const domain = data.domain;
    
    const changes = [];
    for (let i = 0; i < snapshots.length - 1; i++) {
      const current = snapshots[i].snapshot;
      const previous = snapshots[i + 1].snapshot;
      
      if (current.whois?.registrar !== previous.whois?.registrar) {
        changes.push({
          date: snapshots[i].date,
          type: 'registrar',
          change: `Registrar changed from ${previous.whois?.registrar} to ${current.whois?.registrar}`
        });
      }
      
      if (JSON.stringify(current.whois?.nameServers) !== JSON.stringify(previous.whois?.nameServers)) {
        changes.push({
          date: snapshots[i].date,
          type: 'nameservers',
          change: 'Name servers modified'
        });
      }
      
      if (current.security?.malicious !== previous.security?.malicious) {
        changes.push({
          date: snapshots[i].date,
          type: 'security',
          change: `Security status changed to ${current.security?.malicious ? 'Malicious' : 'Clean'}`
        });
      }
    }
    
    return `
      <div>
        <h2 style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 8px;">
          Historical Data for ${domain}
        </h2>
        <p style="color: #4b5563; margin-bottom: 24px;">
          ${snapshots.length} snapshots collected over ${data.timeframe} (${data.plan} plan)
        </p>
        
        <div style="margin-bottom: 32px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px;">
            Snapshot Timeline
          </h3>
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; max-height: 300px; overflow-y: auto;">
            ${snapshots.map((snapshot: any, index: number) => `
              <div style="padding: 12px; border-bottom: 1px solid #e5e7eb; display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 16px; font-size: 14px;">
                <span style="font-weight: 600;">${snapshot.date}</span>
                <span>${snapshot.snapshot.whois?.registrar || 'Unknown Registrar'}</span>
                <span style="color: ${snapshot.snapshot.security?.malicious ? '#dc2626' : '#16a34a'};">
                  ${snapshot.snapshot.security?.malicious ? 'Warning' : 'Clean'}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
        
        ${changes.length > 0 ? `
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px;">
              Detected Changes
            </h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${changes.slice(0, 5).map(change => `
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px;">
                  <span style="color: #dc2626; font-weight: 600;">${change.date}:</span>
                  <span style="color: #7f1d1d;"> ${change.change}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 32px;">
            <p style="color: #15803d; margin: 0;">No significant changes detected across snapshots.</p>
          </div>
        `}
        
        <!-- REMOVED: The broken onclick button -->
      </div>
    `;
  };

  const generateCSVReport = (data: any) => {
    const lines = [];
    
    lines.push('DomainInsight - Domain Research Report');
    lines.push('');
    lines.push(`Domain,${data.domain}`);
    lines.push(`Search Date,${new Date(data.searchDate).toLocaleString()}`);
    lines.push(`Searched By,${data.searchedBy}`);
    lines.push(`Plan,${data.plan.toUpperCase()}`);
    lines.push('');
    
    lines.push('WHOIS INFORMATION');
    if (data.whois) {
      lines.push(`Registrar,${data.whois.registrar}`);
      lines.push(`Registration Date,${data.whois.registrationDate}`);
      lines.push(`Expiration Date,${data.whois.expirationDate}`);
      lines.push(`Organization,${data.whois.organization}`);
      lines.push(`Country,${data.whois.country}`);
      lines.push(`DNSSEC,${data.whois.dnssec}`);
      lines.push(`Status,"${data.whois.status.join(', ')}"`);
      lines.push(`Name Servers,"${data.whois.nameServers.join(', ')}"`);
    } else {
      lines.push('WHOIS data unavailable');
    }
    lines.push('');
    
    lines.push('SECURITY ANALYSIS');
    if (data.security) {
      lines.push(`Reputation,${data.security.reputation}`);
      lines.push(`Malicious,${data.security.malicious ? 'Yes' : 'No'}`);
      lines.push(`Threats Found,${data.security.threats}`);
      lines.push(`Total Scanned,${data.security.total}`);
      lines.push(`Last Scan,${data.security.lastScan}`);
    } else {
      lines.push('Security data unavailable');
    }
    lines.push('');
    
    lines.push('DNS RECORDS');
    if (data.dns && Object.keys(data.dns).length > 0) {
      Object.entries(data.dns).forEach(([type, records]: [string, any]) => {
        if (records && records.length > 0) {
          lines.push(`${type.toUpperCase()} Records`);
          records.forEach((record: any) => {
            lines.push(`,${record.value || record}`);
          });
        }
      });
    } else {
      lines.push('DNS data unavailable');
    }
    lines.push('');
    
    if (data.abuse) {
      lines.push('IP REPUTATION ANALYSIS');
      lines.push(`IP Address,${data.abuse.ip}`);
      lines.push(`Abuse Confidence,${data.abuse.abuseConfidence}%`);
      lines.push(`Is Abusive,${data.abuse.isAbusive ? 'Yes' : 'No'}`);
      lines.push(`Country,${data.abuse.countryCode}`);
      lines.push(`Usage Type,${data.abuse.usageType}`);
      lines.push(`ISP,${data.abuse.isp}`);
      lines.push(`Total Reports,${data.abuse.totalReports}`);
      lines.push(`Whitelisted,${data.abuse.isWhitelisted ? 'Yes' : 'No'}`);
      lines.push('');
    }
    
    if (data.errors && data.errors.length > 0) {
      lines.push('ERRORS ENCOUNTERED');
      data.errors.forEach((error: string) => {
        lines.push(`,${error}`);
      });
      lines.push('');
    }
    
    lines.push('');
    lines.push('Report generated by DomainInsight');
    lines.push('https://nullr.com');
    
    return lines.join('\n');
  };

  // FIXED: Only calculate these after userStats is loaded
  const remainingSearches = userStats ? Math.max(0, userStats.searchLimit - userStats.searchesUsed) : 0;
  const isFreeTierLimitReached = userStats?.plan === 'free' && remainingSearches <= 0;
  const isStarterLimitReached = userStats?.plan === 'starter' && remainingSearches <= 0;
  const isSearchDisabled = isFreeTierLimitReached || isStarterLimitReached;
  const isDomainSaved = results && savedDomains.has(results.domain);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Unknown') return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const SecurityIcon = ({ malicious }: { malicious: boolean | null }) => {
    if (malicious === null) return <AlertCircle style={{ width: '24px', height: '24px', color: '#d97706' }} />;
    return malicious ? 
      <XCircle style={{ width: '24px', height: '24px', color: '#dc2626' }} /> : 
      <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a' }} />;
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f3f4f6',
    padding: '24px',
    marginBottom: '24px'
  };

  // FIXED: Show loading state until both auth and user data are loaded
  if (!isLoaded || (isSignedIn && !userDataLoaded)) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not signed in state
  if (!isSignedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{
            maxWidth: '1152px',
            margin: '0 auto',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <Globe style={{ width: '32px', height: '32px', color: '#2563eb' }} />
              <span style={{
                fontSize: '24px',
                fontWeight: '700',
                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                DomainInsight
              </span>
            </button>
            <SignInButton mode="modal">
              <button style={{
                ...buttonStyle,
                background: '#2563eb',
                color: '#ffffff'
              }}>
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>

        {/* Sign In Required Message */}
        <div style={{
          maxWidth: '896px',
          margin: '0 auto',
          padding: '64px 16px',
          textAlign: 'center'
        }}>
          <div style={cardStyle}>
            <Shield style={{ 
              width: '64px', 
              height: '64px', 
              color: '#2563eb', 
              margin: '0 auto 24px auto' 
            }} />
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>
              Sign In Required
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#4b5563',
              marginBottom: '32px',
              margin: '0 0 32px 0'
            }}>
              Please sign in to access domain research features and track your search history.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <Star style={{ 
                  width: '32px', 
                  height: '32px', 
                  color: '#16a34a', 
                  margin: '0 auto 8px auto' 
                }} />
              <h3 style={{ fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Free Account</h3>
                <p style={{ color: '#4b5563', margin: 0 }}>20 searches per month</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Globe style={{ 
                  width: '32px', 
                  height: '32px', 
                  color: '#2563eb', 
                  margin: '0 auto 8px auto' 
                }} />
                <h3 style={{ fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Search History</h3>
                <p style={{ color: '#4b5563', margin: 0 }}>Track all your research</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Shield style={{ 
                  width: '32px', 
                  height: '32px', 
                  color: '#9333ea', 
                  margin: '0 auto 8px auto' 
                }} />
                <h3 style={{ fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Saved Domains</h3>
                <p style={{ color: '#4b5563', margin: 0 }}>Build your portfolio</p>
              </div>
            </div>

            <SignInButton mode="modal">
              <button style={{
                ...buttonStyle,
                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                color: '#ffffff',
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '700',
                margin: '0 auto'
              }}>
                Sign In to Get Started
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  // Main signed-in UI
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1152px',
          margin: '0 auto',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <Globe style={{ width: '32px', height: '32px', color: '#2563eb' }} />
            <span style={{
              fontSize: '24px',
              fontWeight: '700',
              background: 'linear-gradient(to right, #2563eb, #4f46e5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              DomainInsight
            </span>
          </button>

          {isSignedIn && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => window.location.href = '/saved'}
                style={{
                  color: '#4b5563',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px'
                }}
              >
                Saved Domains
              </button>
              <button 
                onClick={() => window.location.href = '/history'}
                style={{
                  color: '#4b5563',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px'
                }}
              >
                Search History {userStats?.plan === 'free' && '(Pro)'}
              </button>
            </div>
          )}
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: '14px', color: '#4b5563' }}>
              {userStats?.plan === 'free' ? (
                <span style={{ color: remainingSearches <= 3 ? '#dc2626' : '#4b5563', fontWeight: remainingSearches <= 3 ? '600' : 'normal' }}>
                  Free: {remainingSearches} searches left
                </span>
              ) : userStats?.plan === 'starter' ? (
                <span style={{ color: remainingSearches <= 10 ? '#d97706' : '#16a34a' }}>
                  Starter: {remainingSearches} / 500 searches
                </span>
              ) : userStats ? (
                <span style={{ color: '#16a34a' }}>
                  {userStats.plan.charAt(0).toUpperCase() + userStats.plan.slice(1)} Plan
                </span>
              ) : null}
            </div>
            
            {userStats && (userStats.plan === 'free' || 
              (userStats.plan === 'starter' && (remainingSearches <= 50 || remainingSearches === 0))) && (
              <button 
                onClick={() => window.location.href = '/pricing'}
                style={{
                  ...buttonStyle,
                  background: userStats?.plan === 'free' ? 'linear-gradient(to right, #2563eb, #4f46e5)' : 'linear-gradient(to right, #9333ea, #ec4899)',
                  color: '#ffffff'
                }}
              >
                {userStats?.plan === 'free' ? 'Upgrade Now' : 'Upgrade to Pro'}
              </button>
            )}
            
            {userStats?.plan === 'starter' && remainingSearches > 50 && (
              <button 
                onClick={() => window.location.href = '/pricing'}
                style={{
                  ...buttonStyle,
                  background: 'none',
                  border: '1px solid #9333ea',
                  color: '#9333ea'
                }}
              >
                Upgrade to Pro
              </button>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User style={{ width: '20px', height: '20px', color: '#4b5563' }} />
                <span style={{ fontSize: '14px', color: '#4b5563' }}>
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </span>
              </div>
              <SignOutButton>
                <button style={{
                  ...buttonStyle,
                  background: 'none',
                  color: '#4b5563',
                  border: '1px solid #d1d5db',
                  padding: '8px 12px'
                }}>
                  <LogOut style={{ width: '16px', height: '16px' }} />
                  <span>Sign Out</span>
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1152px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Welcome Message for New Users */}
        {user && userStats && userStats.searchesUsed === 0 && !results && (
          <div style={{
            background: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            color: '#1e40af'
          }}>
            <p style={{ margin: 0 }}>
              <strong>Welcome {user.firstName || 'to DomainInsight'}!</strong> 
              {' '}You have {userStats.searchLimit} free searches to get started. 
              Try searching for any domain to see comprehensive WHOIS, DNS, and security data.
            </p>
          </div>
        )}

        {/* Upgrade Status Messages */}
        {upgradeStatus && (
          <div style={{
            background: upgradeStatus === 'success' ? '#dcfce7' : 
                       upgradeStatus === 'error' ? '#fef2f2' : '#fefce8',
            border: upgradeStatus === 'success' ? '1px solid #86efac' : 
                    upgradeStatus === 'error' ? '1px solid #fecaca' : '1px solid #fde047',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            {upgradeStatus === 'success' && (
              <p style={{ color: '#15803d', margin: 0 }}>
                🎉 <strong>Account upgraded successfully!</strong> You now have access to your new plan features.
              </p>
            )}
            {upgradeStatus === 'manual_needed' && (
              <p style={{ color: '#a16207', margin: 0 }}>
                ✅ <strong>Payment successful!</strong> Your account upgrade is being processed. Refresh the page in a moment.
              </p>
            )}
            {upgradeStatus === 'error' && (
              <p style={{ color: '#dc2626', margin: 0 }}>
                ⚠️ <strong>Payment completed but upgrade failed.</strong> Please contact support with your payment confirmation.
              </p>
            )}
          </div>
        )}

        {/* Search Section */}
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              Domain Research Made Simple
            </h1>
            <p style={{
              color: '#4b5563',
              margin: 0
            }}>
              Get comprehensive WHOIS, DNS, and security information for any domain
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            maxWidth: '600px',
            margin: '0 auto',
            flexDirection: window.innerWidth < 640 ? 'column' : 'row'
          }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain name (e.g., example.com)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isFreeTierLimitReached}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <button
              onClick={handleSearch}
              disabled={loading || isSearchDisabled || !domain.trim()}
              style={{
                ...buttonStyle,
                background: loading || isSearchDisabled || !domain.trim() ? '#9ca3af' : '#2563eb',
                color: '#ffffff',
                padding: '12px 24px',
                cursor: loading || isSearchDisabled || !domain.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              ) : (
                <Search style={{ width: '20px', height: '20px' }} />
              )}
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#991b1b', margin: 0 }}>{error}</p>
            </div>
          )}
          
          {/* Free Tier Limit Warning */}
          {isFreeTierLimitReached && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: '#fefce8',
              border: '1px solid #fde047',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#a16207', margin: 0 }}>
                You've reached your free search limit. 
                <button 
                  onClick={() => window.location.href = '/pricing'}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginLeft: '4px'
                  }}
                >
                  Upgrade to Starter
                </button> for 500 monthly searches!
              </p>
            </div>
          )}

          {/* Starter Plan Limit Warning */}
          {userStats?.plan === 'starter' && remainingSearches <= 0 && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#dc2626', margin: 0 }}>
                You've reached your Starter plan limit (500 searches). 
                <button 
                  onClick={() => window.location.href = '/pricing'}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginLeft: '4px'
                  }}
                >
                  Upgrade to Pro
                </button> for unlimited searches!
              </p>
            </div>
          )}

          {/* Low searches warnings */}
          {userStats?.plan === 'free' && !isFreeTierLimitReached && remainingSearches <= 3 && remainingSearches > 0 && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#ea580c', fontSize: '14px', margin: 0 }}>
                Only {remainingSearches} searches remaining. 
                <button 
                  onClick={() => window.location.href = '/pricing'}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginLeft: '4px'
                  }}
                >
                  Upgrade now
                </button> to continue researching.
              </p>
            </div>
          )}

          {userStats?.plan === 'starter' && remainingSearches <= 50 && remainingSearches > 0 && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#7c3aed', fontSize: '14px', margin: 0 }}>
                Only {remainingSearches} searches remaining this month. 
                <button 
                  onClick={() => window.location.href = '/pricing'}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginLeft: '4px'
                  }}
                >
                  Upgrade to Pro
                </button> for unlimited searches.
              </p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div>
            {/* Cache indicator */}
            {results.cached && (
              <div style={{
                background: '#dbeafe',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                <p style={{ color: '#1e40af', fontSize: '14px', margin: 0 }}>
                  <Clock style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
                  Results from cache (updated within the last hour)
                </p>
              </div>
            )}

            {/* Error warnings */}
            {results.errors && results.errors.length > 0 && (
              <div style={{
                background: '#fefce8',
                border: '1px solid #fde047',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontWeight: '600', color: '#a16207', marginBottom: '8px', margin: '0 0 8px 0' }}>Some data sources unavailable:</h3>
                <ul style={{ fontSize: '14px', color: '#713f12', margin: 0, paddingLeft: '16px' }}>
                  {results.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              {/* WHOIS Info */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Globe style={{ width: '24px', height: '24px', color: '#2563eb' }} />
                  <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>WHOIS Information</h2>
                </div>
                
                {results.whois ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { label: 'Domain:', value: results.domain },
                      { label: 'Registrar:', value: results.whois.registrar || 'Unknown' },
                      { label: 'Registration:', value: formatDate(results.whois.registrationDate) },
                      { label: 'Expires:', value: formatDate(results.whois.expirationDate) },
                      { label: 'Organization:', value: results.whois.registrant?.organization || 'Private' }
                    ].map((item, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <span style={{ color: '#4b5563', fontSize: '14px', minWidth: '80px' }}>{item.label}</span>
                        <span style={{ fontWeight: '500', textAlign: 'right', fontSize: '14px' }}>{item.value}</span>
                      </div>
                    ))}
                    {results.whois.nameServers && results.whois.nameServers.length > 0 && (
                      <div>
                        <span style={{ color: '#4b5563', fontSize: '14px', fontWeight: '500' }}>Name Servers:</span>
                        <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {results.whois.nameServers.slice(0, 3).map((ns: string, index: number) => (
                            <div key={index} style={{
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              background: '#f9fafb',
                              padding: '4px 8px',
                              borderRadius: '4px'
                            }}>
                              {ns}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', margin: 0 }}>WHOIS data unavailable</p>
                )}
              </div>

              {/* Security Info */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <SecurityIcon malicious={results.security?.malicious} />
                  <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Security Analysis</h2>
                </div>
                
                {results.security ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { label: 'Status:', value: results.security.reputation, color: results.security.malicious ? '#dc2626' : '#16a34a' },
                      { label: 'Threats:', value: `${results.security.threats}${results.security.total ? ` / ${results.security.total}` : ''}` },
                      { label: 'Last Scan:', value: formatDate(results.security.lastScan) }
                    ].map((item, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <span style={{ color: '#4b5563', fontSize: '14px', minWidth: '80px' }}>{item.label}</span>
                        <span style={{ 
                          fontWeight: '500', 
                          textAlign: 'right', 
                          fontSize: '14px',
                          color: item.color || '#111827'
                        }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', margin: 0 }}>Security data unavailable</p>
                )}
                
                {userStats?.plan === 'free' && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#dbeafe',
                    border: '1px solid #93c5fd',
                    borderRadius: '8px'
                  }}>
                    <p style={{ color: '#1e40af', fontSize: '14px', margin: 0 }}>
                      <Star style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
                      Upgrade to Pro for detailed threat analysis and historical data
                    </p>
                  </div>
                )}
              </div>

              {/* IP Reputation Analysis */}
              {results.abuse && (
                <div style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Globe style={{ width: '24px', height: '24px', color: '#9333ea' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>IP Reputation Analysis</h2>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { label: 'IP Address:', value: results.abuse.ip },
                      ...(results.abuse.abuseConfidence !== undefined && results.abuse.abuseConfidence !== null ? [{
                        label: 'Abuse Confidence:', 
                        value: `${results.abuse.abuseConfidence}%`,
                        color: results.abuse.abuseConfidence > 75 ? '#dc2626' : 
                              results.abuse.abuseConfidence > 25 ? '#d97706' : '#16a34a'
                      }] : []),
                      { 
                        label: 'Status:', 
                        value: results.abuse.isAbusive ? '⚠️ Potentially Abusive' : '✅ Clean',
                        color: results.abuse.isAbusive ? '#dc2626' : '#16a34a'
                      },
                      { label: 'Location:', value: results.abuse.countryCode || 'Unknown' },
                      { label: 'ISP:', value: results.abuse.isp || 'Unknown' },
                      { label: 'Usage Type:', value: results.abuse.usageType || 'Unknown' }
                    ].map((item, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <span style={{ color: '#4b5563', fontSize: '14px', minWidth: '80px' }}>{item.label}</span>
                        <span style={{ 
                          fontWeight: '500', 
                          textAlign: 'right', 
                          fontSize: '14px',
                          color: item.color || '#111827',
                          fontFamily: item.label === 'IP Address:' ? 'monospace' : 'inherit'
                        }}>
                          {item.value}
                        </span>
                      </div>
                    ))}

                    {results.abuse.totalReports > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <span style={{ color: '#4b5563', fontSize: '14px', minWidth: '80px' }}>Abuse Reports:</span>
                        <span style={{ 
                          fontWeight: '500', 
                          textAlign: 'right', 
                          fontSize: '14px',
                          color: '#dc2626'
                        }}>
                          {results.abuse.totalReports} reports from {results.abuse.numDistinctUsers} users
                        </span>
                      </div>
                    )}
                    
                    {results.abuse.isWhitelisted && (
                      <div style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '4px',
                        padding: '8px'
                      }}>
                        <p style={{ color: '#15803d', fontSize: '14px', margin: 0 }}>✅ This IP is whitelisted (trusted)</p>
                      </div>
                    )}
                    
                    {results.abuse.lastReportedAt && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <span style={{ color: '#4b5563', fontSize: '14px', minWidth: '80px' }}>Last Reported:</span>
                        <span style={{ fontWeight: '500', textAlign: 'right', fontSize: '14px' }}>
                          {formatDate(results.abuse.lastReportedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {userStats?.plan === 'free' && (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: '#faf5ff',
                      border: '1px solid #e9d5ff',
                      borderRadius: '8px'
                    }}>
                      <p style={{ color: '#7c3aed', fontSize: '14px', margin: 0 }}>
                        <Star style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
                        Upgrade to Pro for advanced IP geolocation and historical abuse data
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* DNS Records */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Clock style={{ width: '24px', height: '24px', color: '#9333ea' }} />
                  <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>DNS Records</h2>
                </div>
                
                {results.dns ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(results.dns).map(([type, records]: [string, any]) => {
                      if (!records || records.length === 0) return null;
                      
                      return (
                        <div key={type}>
                          <span style={{ color: '#4b5563', fontSize: '14px', fontWeight: '500' }}>
                            {type.toUpperCase()} Records:
                          </span>
                          <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {records.slice(0, 3).map((record: any, index: number) => (
                              <div key={index} style={{
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                background: '#f9fafb',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span>{record.value || record}</span>
                                {record.ttl && (
                                  <span style={{ color: '#9ca3af', fontSize: '10px' }}>TTL: {record.ttl}</span>
                                )}
                              </div>
                            ))}
                            {records.length > 3 && (
                              <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                                ...and {records.length - 3} more
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', margin: 0 }}>DNS data unavailable</p>
                )}
              </div>

              {/* Actions */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', margin: '0 0 16px 0' }}>Actions</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <button 
                  onClick={saveDomain}
                  style={{
                    ...buttonStyle,
                    width: '100%',
                    justifyContent: 'center',
                    background: isDomainSaved ? '#fbbf24' : 'none',
                    border: isDomainSaved ? 'none' : '1px solid #d1d5db',
                    color: isDomainSaved ? '#ffffff' : '#374151'
                  }}
                >
                  <Star style={{ 
                    width: '16px', 
                    height: '16px',
                    fill: isDomainSaved ? '#ffffff' : 'none'
                  }} />
                  <span>{isDomainSaved ? 'Domain Saved' : 'Save Domain'}</span>
                </button>
                  
                  <button 
                    onClick={exportReport}
                    disabled={!userStats || userStats.plan === 'free'}
                    style={{
                      ...buttonStyle,
                      width: '100%',
                      justifyContent: 'center',
                      background: !userStats || userStats.plan === 'free' ? '#f3f4f6' : '#2563eb',
                      border: !userStats || userStats.plan === 'free' ? '1px solid #d1d5db' : 'none',
                      color: !userStats || userStats.plan === 'free' ? '#6b7280' : '#ffffff',
                      cursor: !userStats || userStats.plan === 'free' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Download style={{ width: '16px', height: '16px' }} />
                    <span>Export Report</span>
                    {(!userStats || userStats.plan === 'free') && <span style={{ fontSize: '12px' }}>(Starter+)</span>}
                  </button>
                  
                  <button 
                    onClick={showHistoricalData}
                    disabled={!userStats || userStats.plan === 'free'}
                    style={{
                      ...buttonStyle,
                      width: '100%',
                      justifyContent: 'center',
                      background: !userStats || userStats.plan === 'free' ? '#f3f4f6' : '#16a34a',
                      border: !userStats || userStats.plan === 'free' ? '1px solid #d1d5db' : 'none',
                      color: !userStats || userStats.plan === 'free' ? '#6b7280' : '#ffffff',
                      cursor: !userStats || userStats.plan === 'free' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Clock style={{ width: '16px', height: '16px' }} />
                    <span>Historical Data</span>
                    {(!userStats || userStats.plan === 'free') && <span style={{ fontSize: '12px' }}>(Starter+)</span>}
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', margin: '0 0 16px 0' }}>Search Details</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                fontSize: '14px'
              }}>
                <div>
                  <span style={{ color: '#4b5563' }}>Search performed:</span>
                  <p style={{ fontWeight: '500', margin: '4px 0 0 0' }}>{new Date().toLocaleString()}</p>
                </div>
                <div>
                  <span style={{ color: '#4b5563' }}>Remaining searches:</span>
                  <p style={{ fontWeight: '500', margin: '4px 0 0 0' }}>
                    {userStats?.plan === 'free' ? (
                      `${Math.max(0, userStats.searchLimit - userStats.searchesUsed)}`
                    ) : userStats?.plan === 'starter' ? (
                      `${Math.max(0, userStats.searchLimit - userStats.searchesUsed)} / 500`
                    ) : userStats?.plan === 'pro' || userStats?.plan === 'enterprise' ? (
                      'Unlimited'
                    ) : userStats ? (
                      `${Math.max(0, userStats.searchLimit - userStats.searchesUsed)} / ${userStats.searchLimit}`
                    ) : 'Loading...'}
                  </p>
                </div>
                <div>
                  <span style={{ color: '#4b5563' }}>Account:</span>
                  <p style={{ fontWeight: '500', margin: '4px 0 0 0' }}>{userStats?.email || 'Loading...'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing CTA */}
        {userStats?.plan === 'free' && (
          <div style={{
            background: 'linear-gradient(to right, #2563eb, #9333ea, #3730a3)',
            borderRadius: '16px',
            color: '#ffffff',
            padding: '32px',
            textAlign: 'center',
            marginTop: '32px'
          }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', margin: '0 0 8px 0' }}>
              Ready to unlock full potential?
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#bfdbfe',
              marginBottom: '24px',
              margin: '0 0 24px 0'
            }}>
              Get unlimited searches, historical data, API access, and more with Pro
            </p>
            
            <button 
              onClick={() => window.location.href = '/pricing'}
              style={{
                background: '#ffffff',
                color: '#2563eb',
                padding: '12px 32px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DomainSearch;