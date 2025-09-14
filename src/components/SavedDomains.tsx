// ========================================
// src/components/SavedDomains.tsx - SAVED DOMAINS COMPONENT
"use client"

import React, { useState, useEffect } from 'react';
import { Star, Globe, Trash2, Calendar, Plus } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface SavedDomain {
  id: string;
  domain: string;
  notes: string;
  createdAt: string;
}

const SavedDomains = () => {
  const { user } = useUser();
  const [domains, setDomains] = useState<SavedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('free');
  const [canSaveMore, setCanSaveMore] = useState(true);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    loadSavedDomains();
  }, []);

  const loadSavedDomains = async () => {
    try {
      const response = await fetch('/api/domains/saved');
      if (response.ok) {
        const data = await response.json();
        setDomains(data.domains || []);
        setUserPlan(data.plan);
        setCanSaveMore(data.canSaveMore);
        setLimit(data.limit);
      }
    } catch (error) {
      console.error('Failed to load saved domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDomain = async (domain: string) => {
    try {
      const response = await fetch(`/api/domains/saved?domain=${domain}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setDomains(domains.filter(d => d.domain !== domain));
        setCanSaveMore(true);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete domain');
      }
    } catch (error) {
      alert('Failed to delete domain');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f3f4f6',
    padding: '24px',
    marginBottom: '24px'
  };

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
                Saved Domains
              </h1>
              <p style={{
                color: '#4b5563',
                margin: 0
              }}>
                {userPlan === 'free' 
                  ? `${domains.length}/${limit} domains saved (Free plan limit)`
                  : `${domains.length} domains saved`
                }
              </p>
            </div>
            
            {userPlan === 'free' && !canSaveMore && (
              <button 
                onClick={() => window.location.href = '/pricing'}
                style={{
                  background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Upgrade Now
              </button>
            )}
          </div>
          
          {userPlan === 'free' && (
            <div style={{
              background: '#dbeafe',
              border: '1px solid #93c5fd',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ color: '#1e40af', margin: 0, fontSize: '14px' }}>
                <Star style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
                Free users can save up to 5 domains. Upgrade to Starter or Pro plan for unlimited saved domains and advanced management features.
              </p>
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
          ) : domains.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px' }}>
              <Star style={{ 
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
                No saved domains yet
              </h3>
              <p style={{
                color: '#6b7280',
                margin: '8px 0 0 0'
              }}>
                Start saving interesting domains during your research
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {domains.map((savedDomain) => (
                <div key={savedDomain.id} style={{
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Globe style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0
                      }}>
                        {savedDomain.domain}
                      </h3>
                    </div>
                    
                    <button
                      onClick={() => deleteDomain(savedDomain.domain)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        color: '#ef4444'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '12px'
                  }}>
                    <Calendar style={{ width: '14px', height: '14px' }} />
                    <span>Saved {formatDate(savedDomain.createdAt)}</span>
                  </div>
                  
                  {savedDomain.notes && (
                    <p style={{
                      color: '#4b5563',
                      fontSize: '14px',
                      margin: '0 0 12px 0',
                      lineHeight: '1.5'
                    }}>
                      {savedDomain.notes}
                    </p>
                  )}
                  
                  <button
                    onClick={() => window.location.href = `/?domain=${savedDomain.domain}`}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Research Again
                  </button>
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

export default SavedDomains;