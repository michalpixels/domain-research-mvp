
// src/components/SearchHistory.tsx - Premium Feature
"use client"

import React, { useState, useEffect } from 'react';
import { Clock, Globe, Shield, Star, ChevronRight, Calendar } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface SearchHistoryItem {
  id: string;
  domain: string;
  searchData: any;
  createdAt: string;
}

const SearchHistory = () => {
  const { user } = useUser();
  const [searches, setSearches] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    loadSearchHistory();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const userData = await response.json();
        setUserPlan(userData.plan);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const response = await fetch('/api/domains/history');
      if (response.ok) {
        const data = await response.json();
        setSearches(data);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    } finally {
      setLoading(false);
    }
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

  // Premium feature check
  if (userPlan === 'free') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '32px 16px'
      }}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          <div style={cardStyle}>
            <div style={{ textAlign: 'center' }}>
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
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '32px 16px'
    }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
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
                Your complete domain research history
              </p>
            </div>
            <div style={{
              background: '#f0fdf4',
              color: '#15803d',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Pro Feature
            </div>
          </div>
          
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
          ) : searches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px' }}>
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
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {searches.map((search) => (
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
                  // Re-search functionality
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
                        marginBottom: '8px'
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
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar style={{ width: '14px', height: '14px' }} />
                          <span>{formatDate(search.createdAt)}</span>
                        </div>
                        {search.searchData?.whois?.registrar && (
                          <span>Registrar: {search.searchData.whois.registrar}</span>
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
              ))}
            </div>
          )}
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