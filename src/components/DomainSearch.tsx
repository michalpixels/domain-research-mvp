"use client"

import React, { useState } from 'react';
import { Search, Globe, Shield, Clock, Download, Star } from 'lucide-react';

const DomainSearchMVP = () => {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ plan: 'free', searchesUsed: 15, searchLimit: 20 });

  // Mock data for demo
  const mockResults = {
    domain: 'example.com',
    whois: {
      registrar: 'GoDaddy',
      registrationDate: '1995-08-14',
      expirationDate: '2025-08-13',
      nameServers: ['ns1.example.com', 'ns2.example.com'],
      registrant: {
        organization: 'Internet Assigned Numbers Authority',
        country: 'US'
      }
    },
    security: {
      malicious: false,
      reputation: 'Clean',
      lastScan: '2025-01-15',
      threats: 0
    },
    dns: {
      a: ['93.184.216.34'],
      mx: ['mail.example.com'],
      txt: ['v=spf1 -all']
    }
  };

  const handleSearch = async () => {
    if (!domain.trim()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setResults({ ...mockResults, domain });
      setLoading(false);
      setUser(prev => ({ ...prev, searchesUsed: prev.searchesUsed + 1 }));
    }, 1500);
  };

  const remainingSearches = user.searchLimit - user.searchesUsed;
  const isFreeTierLimitReached = user.plan === 'free' && remainingSearches <= 0;

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
                {user.plan === 'free' ? (
                  <span>Free: {remainingSearches} searches left</span>
                ) : (
                  <span className="text-green-600">Pro Plan</span>
                )}
              </div>
              
              {user.plan === 'free' && (
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors">
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
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
              <span>Search</span>
            </button>
          </div>
          
          {isFreeTierLimitReached && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-800">
                You've reached your free search limit. 
                <button className="text-blue-600 hover:text-blue-700 ml-1 underline">
                  Upgrade to Pro
                </button> for unlimited searches!
              </p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WHOIS Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">WHOIS Information</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Domain:</span>
                  <span className="font-medium">{results.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registrar:</span>
                  <span className="font-medium">{results.whois.registrar}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration:</span>
                  <span className="font-medium">{results.whois.registrationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium">{results.whois.expirationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Organization:</span>
                  <span className="font-medium">{results.whois.registrant.organization}</span>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold">Security Analysis</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${results.security.malicious ? 'text-red-600' : 'text-green-600'}`}>
                    {results.security.reputation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Threats:</span>
                  <span className="font-medium">{results.security.threats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Scan:</span>
                  <span className="font-medium">{results.security.lastScan}</span>
                </div>
              </div>
              
              {user.plan === 'free' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <Star className="w-4 h-4 inline mr-1" />
                    Upgrade to Pro for detailed threat analysis and historical data
                  </p>
                </div>
              )}
            </div>

            {/* DNS Records */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold">DNS Records</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 text-sm">A Records:</span>
                  <div className="mt-1">
                    {results.dns.a.map((ip, index) => (
                      <div key={index} className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                        {ip}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm">MX Records:</span>
                  <div className="mt-1">
                    {results.dns.mx.map((mx, index) => (
                      <div key={index} className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                        {mx}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Star className="w-4 h-4" />
                  <span>Save Domain</span>
                </button>
                
                <button 
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    user.plan === 'free' 
                      ? 'border border-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={user.plan === 'free'}
                >
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                  {user.plan === 'free' && <span className="text-xs">(Pro)</span>}
                </button>
                
                <button 
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    user.plan === 'free' 
                      ? 'border border-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  disabled={user.plan === 'free'}
                >
                  <Clock className="w-4 h-4" />
                  <span>Historical Data</span>
                  {user.plan === 'free' && <span className="text-xs">(Pro)</span>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing CTA */}
        {user.plan === 'free' && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to unlock full potential?</h2>
            <p className="text-blue-100 mb-6">
              Get unlimited searches, historical data, API access, and more with Pro
            </p>
            
            <div className="flex justify-center space-x-8">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Starter - $29/month</h3>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• 500 searches/month</li>
                  <li>• Full security reports</li>
                  <li>• CSV exports</li>
                </ul>
              </div>
              
              <div className="bg-white bg-opacity-30 rounded-lg p-4 border-2 border-white border-opacity-50">
                <h3 className="font-semibold mb-2">Pro - $99/month</h3>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Unlimited searches</li>
                  <li>• Historical data</li>
                  <li>• API access</li>
                  <li>• Bulk processing</li>
                </ul>
              </div>
            </div>
            
            <button className="mt-6 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainSearchMVP;