// src/app/pricing/page.tsx - SMART PRICING WITH PLAN AWARENESS
"use client"

import React, { useState, useEffect } from 'react';
import { Check, Star, Globe, Zap, Shield, TrendingUp, ArrowLeft } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const PricingPage = () => {
  const { isSignedIn, isLoaded } = useUser();
  const [userPlan, setUserPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  // Load user plan on component mount
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadUserPlan();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const loadUserPlan = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const userData = await response.json();
        setUserPlan(userData.plan);
      }
    } catch (error) {
      console.error('Failed to load user plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: string) => {
    if (!isSignedIn) {
      alert('Please sign in first to upgrade your plan');
      return;
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Payment system not configured yet');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const getPlanStatus = (planType: string) => {
    if (!isSignedIn) return 'available';
    if (userPlan === planType) return 'current';
    if (userPlan === 'free' && planType !== 'free') return 'upgrade';
    if (userPlan === 'starter' && planType === 'free') return 'downgrade';
    if (userPlan === 'starter' && planType === 'pro') return 'upgrade';
    if (userPlan === 'pro' && planType !== 'pro') return 'downgrade';
    return 'available';
  };

  const getButtonText = (planType: string) => {
    const status = getPlanStatus(planType);
    switch (status) {
      case 'current': return 'Current Plan';
      case 'upgrade': return planType === 'starter' ? 'Upgrade to Starter' : 'Upgrade to Pro';
      case 'downgrade': return 'Downgrade';
      case 'available': return 'Get Started Free';
      default: return 'Select Plan';
    }
  };

  const getButtonAction = (planType: string) => {
    const status = getPlanStatus(planType);
    if (status === 'current') return null;
    if (status === 'downgrade') return null;
    if (planType === 'free') return () => window.location.href = '/';
    return () => handleSubscribe(planType);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
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
      </div>
    );
  }

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
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px',
          paddingTop: '16px',
          paddingBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <a href="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe style={{ width: '32px', height: '32px', color: '#2563eb' }} />
                <span style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  cursor: 'pointer' // Good practice to show it's clickable
                }}>
                  DomainInsight
                </span>
              </div>
            </a>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#4b5563',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#111827';
                e.currentTarget.style.transform = 'translateX(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '';
                e.currentTarget.style.transform = '';
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              <span>Back to Search</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 16px',
        paddingTop: '64px',
        paddingBottom: '64px'
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '80px'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '24px',
            lineHeight: '1.1'
          }}>
            Choose Your{' '}
            <span style={{
              background: 'linear-gradient(to right, #2563eb, #4f46e5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              Research Plan
            </span>
          </h1>
          
          {isSignedIn && (
            <p style={{
              fontSize: '18px',
              color: '#4b5563',
              marginBottom: '24px'
            }}>
              Current plan: <strong style={{ color: '#2563eb' }}>
                {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
              </strong>
            </p>
          )}
          
          <p style={{
            fontSize: '20px',
            color: '#4b5563',
            maxWidth: '768px',
            margin: '0 auto',
            lineHeight: '1.6',
            marginBottom: '48px'
          }}>
            From casual domain research to professional investment analysis, 
            we have the perfect plan to accelerate your success.
          </p>
          
          {/* Trust indicators */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            fontSize: '14px',
            color: '#6b7280',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield style={{ width: '16px', height: '16px' }} />
              <span>Enterprise Security</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap style={{ width: '16px', height: '16px' }} />
              <span>Real-time Data</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp style={{ width: '16px', height: '16px' }} />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          maxWidth: '1152px',
          margin: '0 auto 80px auto'
        }}>
          
          {/* Free Plan */}
          <div style={{
            background: getPlanStatus('free') === 'current' ? '#f0fdf4' : '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: getPlanStatus('free') === 'current' ? '2px solid #16a34a' : '1px solid #f3f4f6',
            padding: '32px',
            position: 'relative',
            transition: 'all 0.3s ease',
            opacity: getPlanStatus('free') === 'downgrade' ? 0.6 : 1
          }}>
            {getPlanStatus('free') === 'current' && (
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#16a34a',
                color: '#ffffff',
                padding: '8px 24px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '700'
              }}>
                Current Plan
              </div>
            )}
            
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '8px'
              }}>Free</h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{
                  fontSize: '48px',
                  fontWeight: '700',
                  color: '#111827'
                }}>$0</span>
                <span style={{
                  color: '#4b5563',
                  fontSize: '18px'
                }}>/month</span>
              </div>
              <p style={{ color: '#4b5563' }}>Perfect for getting started</p>
            </div>

            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 32px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {[
                '20 domain searches per month',
                '5 domains save favourite limit',
                'Basic WHOIS information',
                'DNS record lookup',
                'Basic security scanning'
              ].map((feature, index) => (
                <li key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <Check style={{
                    width: '20px',
                    height: '20px',
                    color: '#10b981',
                    marginTop: '2px',
                    flexShrink: 0
                  }} />
                  <span style={{ color: '#374151' }}>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={getButtonAction('free') ?? undefined}
              disabled={getPlanStatus('free') === 'current' || getPlanStatus('free') === 'downgrade'}
              style={{
                width: '100%',
                padding: '16px 24px',
                border: getPlanStatus('free') === 'current' ? 'none' : '2px solid #d1d5db',
                color: getPlanStatus('free') === 'current' ? '#ffffff' : '#374151',
                borderRadius: '12px',
                background: getPlanStatus('free') === 'current' ? '#16a34a' : 
                           getPlanStatus('free') === 'downgrade' ? '#f3f4f6' : 'none',
                fontWeight: '600',
                fontSize: '18px',
                cursor: getPlanStatus('free') === 'current' || getPlanStatus('free') === 'downgrade' ? 'not-allowed' : 'pointer',
                opacity: getPlanStatus('free') === 'downgrade' ? 0.5 : 1
              }}
            >
              {getButtonText('free')}
            </button>
          </div>

          {/* Starter Plan */}
          <div style={{
            background: getPlanStatus('starter') === 'current' ? 'linear-gradient(to bottom, #16a34a, #15803d)' :
                       getPlanStatus('starter') === 'upgrade' ? 'linear-gradient(to bottom, #2563eb, #3730a3)' :
                       '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.4)',
            padding: '32px',
            position: 'relative',
            transform: getPlanStatus('starter') === 'upgrade' ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.3s ease',
            opacity: getPlanStatus('starter') === 'downgrade' ? 0.6 : 1
          }}>
            {getPlanStatus('starter') === 'current' && (
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#ffffff',
                color: '#16a34a',
                padding: '8px 24px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '700'
              }}>
                Current Plan
              </div>
            )}
            
            {getPlanStatus('starter') === 'upgrade' && (
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(to right, #f59e0b, #ea580c)',
                color: '#ffffff',
                padding: '8px 24px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '700',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
              }}>
                Most Popular
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: getPlanStatus('starter') === 'current' || getPlanStatus('starter') === 'upgrade' ? '#ffffff' : '#111827',
                marginBottom: '8px'
              }}>Starter</h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{
                  fontSize: '48px',
                  fontWeight: '700',
                  color: getPlanStatus('starter') === 'current' || getPlanStatus('starter') === 'upgrade' ? '#ffffff' : '#111827'
                }}>$29</span>
                <span style={{
                  color: getPlanStatus('starter') === 'current' || getPlanStatus('starter') === 'upgrade' ? '#bfdbfe' : '#4b5563',
                  fontSize: '18px'
                }}>/month</span>
              </div>
              <p style={{ 
                color: getPlanStatus('starter') === 'current' || getPlanStatus('starter') === 'upgrade' ? '#bfdbfe' : '#4b5563' 
              }}>For serious domain researchers</p>
            </div>

            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 32px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {[
                '500 domain searches per month',
                'Unlimited saved domains',
                'Complete WHOIS & DNS data',
                'Advanced security reports',
                '6-month historical data',
                'CSV export functionality',
                'Priority email support'
              ].map((feature, index) => (
                <li key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <Check style={{
                    width: '20px',
                    height: '20px',
                    color: '#86efac',
                    marginTop: '2px',
                    flexShrink: 0
                  }} />
                  <span style={{ 
                    color: getPlanStatus('starter') === 'current' || getPlanStatus('starter') === 'upgrade' ? '#ffffff' : '#374151' 
                  }}>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={getButtonAction('starter') ?? undefined}
              disabled={getPlanStatus('starter') === 'current' || getPlanStatus('starter') === 'downgrade'}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: getPlanStatus('starter') === 'current' ? '#ffffff' :
                           getPlanStatus('starter') === 'downgrade' ? '#f3f4f6' : '#ffffff',
                color: getPlanStatus('starter') === 'current' ? '#16a34a' :
                       getPlanStatus('starter') === 'downgrade' ? '#6b7280' : '#2563eb',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '700',
                fontSize: '18px',
                cursor: getPlanStatus('starter') === 'current' || getPlanStatus('starter') === 'downgrade' ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                opacity: getPlanStatus('starter') === 'downgrade' ? 0.5 : 1
              }}
            >
              {getButtonText('starter')}
            </button>
          </div>

          {/* Pro Plan */}
          <div style={{
            background: getPlanStatus('pro') === 'current' ? 'linear-gradient(to bottom, #9333ea, #7c3aed)' : '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: getPlanStatus('pro') === 'current' ? 'none' : '1px solid #f3f4f6',
            padding: '32px',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}>
            {getPlanStatus('pro') === 'current' && (
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#ffffff',
                color: '#9333ea',
                padding: '8px 24px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '700'
              }}>
                Current Plan
              </div>
            )}
            
            {getPlanStatus('pro') !== 'current' && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                background: 'linear-gradient(to right, #9333ea, #ec4899)',
                color: '#ffffff',
                padding: '12px',
                borderRadius: '50%'
              }}>
                <Star style={{ width: '24px', height: '24px' }} />
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: getPlanStatus('pro') === 'current' ? '#ffffff' : '#111827',
                marginBottom: '8px'
              }}>Pro</h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{
                  fontSize: '48px',
                  fontWeight: '700',
                  color: getPlanStatus('pro') === 'current' ? '#ffffff' : '#111827'
                }}>$99</span>
                <span style={{
                  color: getPlanStatus('pro') === 'current' ? '#e9d5ff' : '#4b5563',
                  fontSize: '18px'
                }}>/month</span>
              </div>
              <p style={{ 
                color: getPlanStatus('pro') === 'current' ? '#e9d5ff' : '#4b5563' 
              }}>For domain investment professionals</p>
            </div>

            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 32px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {[
                'Unlimited domain searches',
                'Unlimited saved domains',
                '5-year historical data access',
                'API access & integrations',
                'Bulk domain processing',
                'Advanced analytics & trends',
                '1-on-1 consultation calls'
              ].map((feature, index) => (
                <li key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <Check style={{
                    width: '20px',
                    height: '20px',
                    color: '#10b981',
                    marginTop: '2px',
                    flexShrink: 0
                  }} />
                  <span style={{ 
                    color: getPlanStatus('pro') === 'current' ? '#ffffff' : '#374151' 
                  }}>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={getButtonAction('pro') ?? undefined}
              disabled={getPlanStatus('pro') === 'current'}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: getPlanStatus('pro') === 'current' ? '#ffffff' : 'linear-gradient(to right, #9333ea, #ec4899)',
                color: getPlanStatus('pro') === 'current' ? '#9333ea' : '#ffffff',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '600',
                fontSize: '18px',
                cursor: getPlanStatus('pro') === 'current' ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 16px rgba(147, 51, 234, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              {getButtonText('pro')}
            </button>
          </div>
        </div>

        {/* Rest of your pricing page content remains the same... */}
        
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

export default PricingPage;