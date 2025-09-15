// src/components/SearchHistory.tsx - ENHANCED WITH MISSING FEATURES
"use client"

import React, { useState, useEffect } from 'react';
import { Clock, Globe, Shield, Star, ChevronRight, Calendar, ArrowLeft, User, LogOut, Filter, Download, TrendingUp, Search, Tag, BarChart3 } from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/nextjs';

interface SearchHistoryItem {
  id: string;
  domain: string;
  searchData: any;
  createdAt: string;
}

interface SearchAnalytics {
  totalSearches: number;
  uniqueDomains: number;
  avgSecurityThreats: number;
  topTlds: Array<{ tld: string; count: number }>;
  searchesThisWeek: number;
  searchesLastWeek: number;
  maliciousDomainsFound: number;
  registrarDistribution: Array<{ registrar: string; count: number }>;
}

const SearchHistory = () => {
  const { user } = useUser();
  const [searches, setSearches] = useState<SearchHistoryItem[]>([]);
  const [filteredSearches, setFilteredSearches] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  // NEW: Filter and Analytics State
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [securityFilter, setSecurityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      await Promise.all([
        loadUserData(),
        loadSearchHistory()
      ]);
      setDataLoading(false);
    };
    
    loadData();
  }, []);

  // Apply filters whenever searches or filters change
  useEffect(() => {
    applyFilters();
  }, [searches, searchFilter, categoryFilter, securityFilter, dateFilter]);

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const userData = await response.json();
        setUserPlan(userData.plan);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      setUserPlan('free');
    }
  };

  const loadSearchHistory = async () => {
    try {
      const response = await fetch('/api/domains/history');
      if (response.ok) {
        const data = await response.json();
        setSearches(data);
        generateAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Generate Analytics from Search Data
  const generateAnalytics = (searchData: SearchHistoryItem[]) => {
    if (searchData.length === 0) {
      setAnalytics(null);
      return;
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const uniqueDomains = new Set(searchData.map(s => s.domain)).size;
    const maliciousCount = searchData.filter(s => s.searchData?.security?.malicious).length;
    
    // TLD distribution
    const tldCount: { [key: string]: number } = {};
    searchData.forEach(search => {
      const tld = search.domain.split('.').pop() || 'unknown';
      tldCount[tld] = (tldCount[tld] || 0) + 1;
    });
    const topTlds = Object.entries(tldCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tld, count]) => ({ tld, count }));

    // Registrar distribution
    const registrarCount: { [key: string]: number } = {};
    searchData.forEach(search => {
      const registrar = search.searchData?.whois?.registrar || 'Unknown';
      registrarCount[registrar] = (registrarCount[registrar] || 0) + 1;
    });
    const registrarDistribution = Object.entries(registrarCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([registrar, count]) => ({ registrar, count }));

    // Weekly comparisons
    const searchesThisWeek = searchData.filter(s => 
      new Date(s.createdAt) >= oneWeekAgo
    ).length;
    const searchesLastWeek = searchData.filter(s => {
      const date = new Date(s.createdAt);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    }).length;

    // Average security threats
    const totalThreats = searchData.reduce((sum, search) => {
      return sum + (search.searchData?.security?.threats || 0);
    }, 0);
    const avgSecurityThreats = searchData.length > 0 ? totalThreats / searchData.length : 0;

    setAnalytics({
      totalSearches: searchData.length,
      uniqueDomains,
      avgSecurityThreats: Math.round(avgSecurityThreats * 100) / 100,
      topTlds,
      searchesThisWeek,
      searchesLastWeek,
      maliciousDomainsFound: maliciousCount,
      registrarDistribution
    });
  };

  // NEW: Apply Filters
  const applyFilters = () => {
    let filtered = [...searches];

    // Text search filter
    if (searchFilter.trim()) {
      filtered = filtered.filter(search => 
        search.domain.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    // Category filter (based on TLD)
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(search => {
        const tld = search.domain.split('.').pop() || '';
        switch (categoryFilter) {
          case 'commercial': return ['com', 'biz', 'co'].includes(tld);
          case 'organization': return ['org', 'net'].includes(tld);
          case 'country': return tld.length === 2; // Country codes are 2 letters
          case 'tech': return ['io', 'tech', 'dev', 'ai'].includes(tld);
          case 'other': return !['com', 'org', 'net', 'biz', 'co', 'io', 'tech', 'dev', 'ai'].includes(tld) && tld.length > 2;
          default: return true;
        }
      });
    }

    // Security filter
    if (securityFilter !== 'all') {
      filtered = filtered.filter(search => {
        const isMalicious = search.searchData?.security?.malicious;
        switch (securityFilter) {
          case 'safe': return !isMalicious;
          case 'threats': return isMalicious;
          case 'unknown': return search.searchData?.security === null || search.searchData?.security === undefined;
          default: return true;
        }
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(search => {
        const searchDate = new Date(search.createdAt);
        switch (dateFilter) {
          case 'today':
            return searchDate.toDateString() === now.toDateString();
          case 'week':
            return searchDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month':
            return searchDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          case 'quarter':
            return searchDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          default: return true;
        }
      });
    }

    setFilteredSearches(filtered);
  };

  // NEW: Export to CSV
  const exportToCSV = () => {
    if (filteredSearches.length === 0) {
      alert('No search history to export');
      return;
    }

    const csvHeaders = [
      'Domain',
      'Search Date',
      'Registrar',
      'Registration Date',
      'Expiration Date',
      'Security Status',
      'Threats Found',
      'Organization',
      'Country',
      'TLD Category'
    ];

    const csvRows = filteredSearches.map(search => {
      const whois = search.searchData?.whois;
      const security = search.searchData?.security;
      const domain = search.domain;
      const tld = domain.split('.').pop() || '';
      
      // Categorize TLD
      let tldCategory = 'Other';
      if (['com', 'biz', 'co'].includes(tld)) tldCategory = 'Commercial';
      else if (['org', 'net'].includes(tld)) tldCategory = 'Organization';
      else if (tld.length === 2) tldCategory = 'Country Code';
      else if (['io', 'tech', 'dev', 'ai'].includes(tld)) tldCategory = 'Technology';

      return [
        domain,
        new Date(search.createdAt).toLocaleString(),
        whois?.registrar || 'Unknown',
        whois?.registrationDate || 'Unknown',
        whois?.expirationDate || 'Unknown',
        security?.malicious ? 'Threats Detected' : 'Safe',
        security?.threats || '0',
        whois?.registrant?.organization || 'Private',
        whois?.registrant?.country || 'Unknown',
        tldCategory
      ].map(field => `"${String(field).replace(/"/g, '""')}"`); // Escape quotes
    });

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `domain-search-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Exported ${filteredSearches.length} search records to CSV`);
  };

  // NEW: Get Domain Category
  const getDomainCategory = (domain: string) => {
    const tld = domain.split('.').pop() || '';
    if (['com', 'biz', 'co'].includes(tld)) return { name: 'Commercial', color: '#2563eb' };
    if (['org', 'net'].includes(tld)) return { name: 'Organization', color: '#16a34a' };
    if (tld.length === 2) return { name: 'Country', color: '#7c3aed' };
    if (['io', 'tech', 'dev', 'ai'].includes(tld)) return { name: 'Tech', color: '#ea580c' };
    return { name: 'Other', color: '#6b7280' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSecurityIcon = (searchData: any) => {
    const security = searchData?.security;
    if (!security) return <Shield style={{ width: '16px', height: '16px', color: '#9ca3af' }} />;
    
    return security.malicious ? 
      <Shield style={{ width: '16px', height: '16px', color: '#dc2626' }} /> :
      <Shield style={{ width: '16px', height: '16px', color: '#16a34a' }} />;
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f3f4f6',
    padding: '24px',
    marginBottom: '24px'
  };

  // Show loading state while determining user plan
  if (dataLoading || userPlan === null) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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

  // Free users see upgrade prompt
  if (userPlan === 'free') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '0'
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
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
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
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User style={{ width: '20px', height: '20px', color: '#4b5563' }} />
                  <span style={{ fontSize: '14px', color: '#4b5563' }}>
                    {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                  </span>
                </div>
                <SignOutButton>
                  <button style={{
                    background: 'none',
                    color: '#4b5563',
                    border: '1px solid #d1d5db',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <LogOut style={{ width: '16px', height: '16px' }} />
                    <span>Sign Out</span>
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '32px 16px' }}>
          <div style={{ maxWidth: '896px', margin: '0 auto' }}>
            <div style={cardStyle}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '24px'
                }}>
                  <button 
                    onClick={() => window.location.href = '/'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#4b5563',
                      background: 'none',
                      border: '1px solid #d1d5db',
                      cursor: 'pointer',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#111827';
                      e.currentTarget.style.borderColor = '#9ca3af';
                      e.currentTarget.style.transform = 'translateX(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#4b5563';
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.transform = '';
                    }}
                  >
                    <ArrowLeft style={{ width: '16px', height: '16px' }} />
                    <span>Back to Search</span>
                  </button>
                </div>
                
                <Star style={{ 
                  width: '64px', 
                  height: '64px', 
                  color: '#f59e0b', 
                  margin: '0 auto 24px auto' 
                }} />
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '16px',
                  margin: '0 0 16px 0'
                }}>
                  Search History - Premium Feature
                </h2>
                <p style={{
                  fontSize: '18px',
                  color: '#4b5563',
                  marginBottom: '32px',
                  margin: '0 0 32px 0'
                }}>
                  Track all your domain research history and revisit past searches with detailed analysis.
                </p>
                
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '32px',
                  textAlign: 'left'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '16px',
                    margin: '0 0 16px 0'
                  }}>
                    Premium Search History includes:
                  </h3>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {[
                      'Complete search history with timestamps',
                      'Quick re-search functionality',
                      'Security status at a glance',
                      'Domain categorization and filtering',
                      'Export history to CSV',
                      'Search analytics and trends'
                    ].map((feature, index) => (
                      <li key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#2563eb',
                          borderRadius: '50%'
                        }}></div>
                        <span style={{ color: '#374151' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  onClick={() => window.location.href = '/pricing'}
                  style={{
                    background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                    color: '#ffffff',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Premium users see actual search history with new features
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '0'
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
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
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
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User style={{ width: '20px', height: '20px', color: '#4b5563' }} />
                <span style={{ fontSize: '14px', color: '#4b5563' }}>
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </span>
              </div>
              <SignOutButton>
                <button style={{
                  background: 'none',
                  color: '#4b5563',
                  border: '1px solid #d1d5db',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <LogOut style={{ width: '16px', height: '16px' }} />
                  <span>Sign Out</span>
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 16px' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <div style={cardStyle}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  Search History
                </h1>
                <p style={{
                  color: '#4b5563',
                  margin: 0
                }}>
                  {loading ? 'Loading...' : `${filteredSearches.length} of ${searches.length} searches`}
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* NEW: Analytics Button */}
                <button 
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: showAnalytics ? '#ffffff' : '#4b5563',
                    background: showAnalytics ? '#7c3aed' : 'none',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    fontWeight: '500'
                  }}
                >
                  <BarChart3 style={{ width: '16px', height: '16px' }} />
                  <span>Analytics</span>
                </button>

                {/* NEW: Filter Button */}
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: showFilters ? '#ffffff' : '#4b5563',
                    background: showFilters ? '#2563eb' : 'none',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    fontWeight: '500'
                  }}
                >
                  <Filter style={{ width: '16px', height: '16px' }} />
                  <span>Filters</span>
                </button>

                {/* NEW: Export Button */}
                <button 
                  onClick={exportToCSV}
                  disabled={filteredSearches.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: filteredSearches.length === 0 ? '#9ca3af' : '#16a34a',
                    background: 'none',
                    border: '1px solid #d1d5db',
                    cursor: filteredSearches.length === 0 ? 'not-allowed' : 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    fontWeight: '500'
                  }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  <span>Export CSV</span>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#4b5563',
                    background: 'none',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#111827';
                    e.currentTarget.style.borderColor = '#9ca3af';
                    e.currentTarget.style.transform = 'translateX(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#4b5563';
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <ArrowLeft style={{ width: '16px', height: '16px' }} />
                  <span>Back to Search</span>
                </button>
                
                <div style={{
                  background: '#f0fdf4',
                  color: '#15803d',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Feature
                </div>
              </div>
            </div>

            {/* NEW: Analytics Panel */}
            {showAnalytics && analytics && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '20px',
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <TrendingUp style={{ width: '20px', height: '20px', color: '#7c3aed' }} />
                  Search Analytics
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    background: '#ffffff',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
                      {analytics.totalSearches}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Searches</div>
                  </div>
                  
                  <div style={{
                    background: '#ffffff',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                      {analytics.uniqueDomains}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Unique Domains</div>
                  </div>
                  
                  <div style={{
                    background: '#ffffff',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                      {analytics.maliciousDomainsFound}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Threats Found</div>
                  </div>
                  
                  <div style={{
                    background: '#ffffff',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: '700', 
                      color: analytics.searchesThisWeek >= analytics.searchesLastWeek ? '#16a34a' : '#dc2626' 
                    }}>
                      {analytics.searchesThisWeek >= analytics.searchesLastWeek ? '+' : ''}{analytics.searchesThisWeek - analytics.searchesLastWeek}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>vs Last Week</div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  {/* Top TLDs */}
                  <div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '12px',
                      margin: '0 0 12px 0'
                    }}>
                      Top TLDs
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {analytics.topTlds.map((tld, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: '#ffffff',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <span style={{ fontWeight: '500' }}>.{tld.tld}</span>
                          <span style={{ 
                            color: '#6b7280',
                            fontSize: '14px',
                            background: '#f3f4f6',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            {tld.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Registrars */}
                  <div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '12px',
                      margin: '0 0 12px 0'
                    }}>
                      Top Registrars
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {analytics.registrarDistribution.map((registrar, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: '#ffffff',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <span style={{ 
                            fontWeight: '500',
                            fontSize: '14px',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {registrar.registrar}
                          </span>
                          <span style={{ 
                            color: '#6b7280',
                            fontSize: '14px',
                            background: '#f3f4f6',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            {registrar.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NEW: Filters Panel */}
            {showFilters && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '20px',
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Filter style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                  Filter Search History
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Search Filter */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Search Domain
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Search style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        color: '#9ca3af'
                      }} />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Filter by domain..."
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 36px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
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
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Domain Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="all">All Categories</option>
                      <option value="commercial">Commercial (.com, .biz)</option>
                      <option value="organization">Organization (.org, .net)</option>
                      <option value="tech">Technology (.io, .tech, .dev)</option>
                      <option value="country">Country Code (2 letters)</option>
                      <option value="other">Other TLDs</option>
                    </select>
                  </div>

                  {/* Security Filter */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Security Status
                    </label>
                    <select
                      value={securityFilter}
                      onChange={(e) => setSecurityFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="all">All Security Status</option>
                      <option value="safe">Safe Domains</option>
                      <option value="threats">Threats Detected</option>
                      <option value="unknown">Unknown Status</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Time Period
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">Last 3 Months</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div style={{ marginTop: '16px' }}>
                  <button
                    onClick={() => {
                      setSearchFilter('');
                      setCategoryFilter('all');
                      setSecurityFilter('all');
                      setDateFilter('all');
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid #d1d5db',
                      color: '#4b5563',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '64px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '3px solid #e5e7eb',
                  borderTop: '3px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}></div>
              </div>
            ) : filteredSearches.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px' }}>
                {searches.length === 0 ? (
                  <>
                    <Clock style={{ 
                      width: '64px', 
                      height: '64px', 
                      color: '#9ca3af', 
                      margin: '0 auto 16px auto' 
                    }} />
                    <h3 style={{
                      fontSize: '18px',
                      color: '#4b5563',
                      margin: 0
                    }}>
                      No search history yet
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      margin: '8px 0 0 0'
                    }}>
                      Start researching domains to build your history
                    </p>
                  </>
                ) : (
                  <>
                    <Filter style={{ 
                      width: '64px', 
                      height: '64px', 
                      color: '#9ca3af', 
                      margin: '0 auto 16px auto' 
                    }} />
                    <h3 style={{
                      fontSize: '18px',
                      color: '#4b5563',
                      margin: 0
                    }}>
                      No matches found
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      margin: '8px 0 0 0'
                    }}>
                      Try adjusting your filters to see more results
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {filteredSearches.map((search) => {
                  const category = getDomainCategory(search.domain);
                  
                  return (
                    <div key={search.id} style={{
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                    onClick={() => {
                      window.location.href = `/?domain=${search.domain}`;
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '16px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px',
                            flexWrap: 'wrap'
                          }}>
                            <Globe style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                            <h3 style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#111827',
                              margin: 0
                            }}>
                              {search.domain}
                            </h3>
                            {getSecurityIcon(search.searchData)}
                            
                            {/* NEW: Category Tag */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: category.color,
                              color: '#ffffff',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              <Tag style={{ width: '12px', height: '12px' }} />
                              <span>{category.name}</span>
                            </div>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            fontSize: '14px',
                            color: '#6b7280',
                            flexWrap: 'wrap'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar style={{ width: '14px', height: '14px' }} />
                              <span>{formatDate(search.createdAt)}</span>
                            </div>
                            {search.searchData?.whois?.registrar && (
                              <span>Registrar: {search.searchData.whois.registrar}</span>
                            )}
                            {search.searchData?.security?.threats !== undefined && (
                              <span style={{ 
                                color: search.searchData.security.threats > 0 ? '#dc2626' : '#16a34a' 
                              }}>
                                {search.searchData.security.threats > 0 
                                  ? `${search.searchData.security.threats} threats` 
                                  : 'Clean'
                                }
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <ChevronRight style={{ 
                          width: '20px', 
                          height: '20px', 
                          color: '#9ca3af',
                          flexShrink: 0
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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

export default SearchHistory;