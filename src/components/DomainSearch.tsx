// src/components/DomainSearch.tsx - SIMPLIFIED CLIENT COMPONENT
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

const DomainSearch = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState<DomainResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState({ 
    plan: 'free', 
    searchesUsed: 0, 
    searchLimit: 20,
    email: ''
  });

  // Load user subscription data when user signs in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadUserData();
    }
  }, [isLoaded, isSignedIn]);

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const userData = await response.json();
        setUserStats(userData);
        console.log('User data loaded:', userData);
      } else if (response.status === 401) {
        console.log('User not authenticated');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
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
      if (data.remainingSearches !== undefined) {
        setUserStats(prev => ({
          ...prev,
          searchesUsed: prev.searchLimit - data.remainingSearches,
          plan: data.userPlan || prev.plan
        }));
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
        alert('Domain saved successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save domain');
      }
    } catch (error) {
      alert('Failed to save domain');
    }
  };

  const remainingSearches = userStats.searchLimit - userStats.searchesUsed;
  const isFreeTierLimitReached = userStats.plan === 'free' && remainingSearches <= 0;

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Unknown') return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const SecurityIcon = ({ malicious }: { malicious: boolean | null }) => {
    if (malicious === null) return <AlertCircle className="w-6 h-6 text-yellow-600" />;
    return malicious ? 
      <XCircle className="w-6 h-6 text-red-600" /> : 
      <CheckCircle className="w-6 h-6 text-green-600" />;
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not signed in state
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Globe className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">DomainInsight</span>
              </div>
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </div>

        {/* Sign In Required Message */}
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sign In Required
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Please sign in to access domain research features and track your search history.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Free Account</h3>
                <p className="text-gray-600">20 searches per month</p>
              </div>
              <div className="text-center">
                <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Search History</h3>
                <p className="text-gray-600">Track all your research</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Saved Domains</h3>
                <p className="text-gray-600">Build your portfolio</p>
              </div>
            </div>

            <SignInButton mode="modal">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-semibold text-lg">
                Sign In to Get Started
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  // Signed in - show main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Globe className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">DomainInsight</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {userStats.plan === 'free' ? (
                  <span className={remainingSearches <= 3 ? 'text-red-600 font-medium' : ''}>
                    Free: {remainingSearches} searches left
                  </span>
                ) : (
                  <span className="text-green-600">
                    {userStats.plan.charAt(0).toUpperCase() + userStats.plan.slice(1)} Plan
                  </span>
                )}
              </div>
              
              {userStats.plan === 'free' && (
                <button 
                  onClick={() => window.location.href = '/pricing'}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
                >
                  Upgrade to Pro
                </button>
              )}
              
              {/* Auth Button */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                  </span>
                </div>
                <SignOutButton>
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Message for New Users */}
        {user && userStats.searchesUsed === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              <strong>Welcome {user.firstName || 'to DomainInsight'}!</strong> 
              {' '}You have {userStats.searchLimit} free searches to get started. 
              Try searching for any domain to see comprehensive WHOIS, DNS, and security data.
            </p>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Domain Research Made Simple
            </h1>
            <p className="text-gray-600">
              Get comprehensive WHOIS, DNS, and security information for any domain
            </p>
          </div>
          
          <div className="flex space-x-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain name (e.g., example.com)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isFreeTierLimitReached}
              />
            </div>
            
            <button
              onClick={handleSearch}
              disabled={loading || isFreeTierLimitReached || !domain.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {/* Free Tier Limit Warning */}
          {isFreeTierLimitReached && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-800">
                You've reached your free search limit. 
                <button 
                  onClick={() => window.location.href = '/pricing'}
                  className="text-blue-600 hover:text-blue-700 ml-1 underline"
                >
                  Upgrade to Pro
                </button> for unlimited searches!
              </p>
            </div>
          )}

          {/* Low searches warning */}
          {!isFreeTierLimitReached && remainingSearches <= 3 && remainingSearches > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
              <p className="text-orange-800 text-sm">
                Only {remainingSearches} searches remaining. 
                <button 
                  onClick={() => window.location.href = '/pricing'}
                  className="text-blue-600 hover:text-blue-700 ml-1 underline"
                >
                  Upgrade now
                </button> to continue researching.
              </p>
            </div>
          )}
        </div>

        {/* Results Section - Keep all existing result display code */}
        {results && (
          <div className="space-y-6">
            {/* Cache indicator */}
            {results.cached && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-blue-800 text-sm">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Results from cache (updated within the last hour)
                </p>
              </div>
            )}

            {/* Error warnings */}
            {results.errors && results.errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">Some data sources unavailable:</h3>
                <ul className="text-sm text-yellow-700">
                  {results.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* WHOIS Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Globe className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold">WHOIS Information</h2>
                </div>
                
                {results.whois ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Domain:</span>
                      <span className="font-medium">{results.domain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registrar:</span>
                      <span className="font-medium">{results.whois.registrar || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration:</span>
                      <span className="font-medium">{formatDate(results.whois.registrationDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires:</span>
                      <span className="font-medium">{formatDate(results.whois.expirationDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Organization:</span>
                      <span className="font-medium">{results.whois.registrant?.organization || 'Private'}</span>
                    </div>
                    {results.whois.nameServers && results.whois.nameServers.length > 0 && (
                      <div>
                        <span className="text-gray-600 text-sm">Name Servers:</span>
                        <div className="mt-1 space-y-1">
                          {results.whois.nameServers.slice(0, 3).map((ns: string, index: number) => (
                            <div key={index} className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                              {ns}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">WHOIS data unavailable</p>
                )}
              </div>

              {/* Security Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <SecurityIcon malicious={results.security?.malicious} />
                  <h2 className="text-xl font-semibold">Security Analysis</h2>
                </div>
                
                {results.security ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        results.security.malicious ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {results.security.reputation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Threats:</span>
                      <span className="font-medium">
                        {results.security.threats}
                        {results.security.total && ` / ${results.security.total}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Scan:</span>
                      <span className="font-medium">{formatDate(results.security.lastScan)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Security data unavailable</p>
                )}
                
                {userStats.plan === 'free' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <Star className="w-4 h-4 inline mr-1" />
                      Upgrade to Pro for detailed threat analysis and historical data
                    </p>
                  </div>
                )}
              </div>

              {/* IP Reputation Analysis */}
              {results.abuse && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Globe className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-semibold">IP Reputation Analysis</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">IP Address:</span>
                      <span className="font-medium font-mono">{results.abuse.ip}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Abuse Confidence:</span>
                      <span className={`font-medium ${
                        results.abuse.abuseConfidence > 75 ? 'text-red-600' :
                        results.abuse.abuseConfidence > 25 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {results.abuse.abuseConfidence}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        results.abuse.isAbusive ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {results.abuse.isAbusive ? '⚠️ Potentially Abusive' : '✅ Clean'}
                      </span>
                    </div>
                    
                    {results.abuse.totalReports > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Abuse Reports:</span>
                        <span className="font-medium text-red-600">
                          {results.abuse.totalReports} reports from {results.abuse.numDistinctUsers} users
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{results.abuse.countryCode || 'Unknown'}</span>
                    </div>
                    
                    {results.abuse.isp && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ISP:</span>
                        <span className="font-medium">{results.abuse.isp}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usage Type:</span>
                      <span className="font-medium">{results.abuse.usageType || 'Unknown'}</span>
                    </div>
                    
                    {results.abuse.isWhitelisted && (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-green-800 text-sm">✅ This IP is whitelisted (trusted)</p>
                      </div>
                    )}
                    
                    {results.abuse.lastReportedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Reported:</span>
                        <span className="font-medium">{formatDate(results.abuse.lastReportedAt)}</span>
                      </div>
                    )}
                  </div>
                  
                  {userStats.plan === 'free' && (
                    <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-purple-800 text-sm">
                        <Star className="w-4 h-4 inline mr-1" />
                        Upgrade to Pro for advanced IP geolocation and historical abuse data
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* DNS Records */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold">DNS Records</h2>
                </div>
                
                {results.dns ? (
                  <div className="space-y-3">
                    {Object.entries(results.dns).map(([type, records]: [string, any]) => {
                      if (!records || records.length === 0) return null;
                      
                      return (
                        <div key={type}>
                          <span className="text-gray-600 text-sm font-medium">
                            {type.toUpperCase()} Records:
                          </span>
                          <div className="mt-1 space-y-1">
                            {records.slice(0, 3).map((record: any, index: number) => (
                              <div key={index} className="font-mono text-sm bg-gray-50 px-2 py-1 rounded flex justify-between">
                                <span>{record.value || record}</span>
                                {record.ttl && (
                                  <span className="text-gray-400 text-xs">TTL: {record.ttl}</span>
                                )}
                              </div>
                            ))}
                            {records.length > 3 && (
                              <p className="text-xs text-gray-500">...and {records.length - 3} more</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">DNS data unavailable</p>
                )}
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Actions</h2>
                
                <div className="space-y-3">
                  <button 
                    onClick={saveDomain}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    <span>Save Domain</span>
                  </button>
                  
                  <button 
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      userStats.plan === 'free' 
                        ? 'border border-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={userStats.plan === 'free'}
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Report</span>
                    {userStats.plan === 'free' && <span className="text-xs">(Pro)</span>}
                  </button>
                  
                  <button 
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      userStats.plan === 'free' 
                        ? 'border border-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    disabled={userStats.plan === 'free'}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Historical Data</span>
                    {userStats.plan === 'free' && <span className="text-xs">(Pro)</span>}
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Search Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Search performed:</span>
                  <p className="font-medium">{new Date().toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Remaining searches:</span>
                  <p className="font-medium">
                    {userStats.plan === 'free' ? remainingSearches : 'Unlimited'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Account:</span>
                  <p className="font-medium">{userStats.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing CTA */}
        {userStats.plan === 'free' && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to unlock full potential?</h2>
            <p className="text-blue-100 mb-6">
              Get unlimited searches, historical data, API access, and more with Pro
            </p>
            
            <button 
              onClick={() => window.location.href = '/pricing'}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainSearch;