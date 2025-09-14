// src/app/pricing/page.tsx - SELF-CONTAINED WITH ALL CSS
"use client"

import React from 'react';
import { Check, Star, Globe, Zap, Shield, TrendingUp, ArrowLeft } from 'lucide-react';

const PricingPage = () => {
  const handleSubscribe = async (plan: string) => {
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
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
            </div>
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
                e.currentTarget.style.color = ''; // Reset the style
                e.currentTarget.style.transform = ''; // Reset the style
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
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #f3f4f6',
            padding: '32px',
            position: 'relative',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          }}>
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
              onClick={() => window.location.href = '/'}
              style={{
                width: '100%',
                padding: '16px 24px',
                border: '2px solid #d1d5db',
                color: '#374151',
                borderRadius: '12px',
                background: 'none',
                fontWeight: '600',
                fontSize: '18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
            >
              Get Started Free
            </button>
          </div>

          {/* Starter Plan - Most Popular */}
          <div style={{
            background: 'linear-gradient(to bottom, #2563eb, #3730a3)',
            borderRadius: '24px',
            boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.4)',
            padding: '32px',
            position: 'relative',
            transform: 'scale(1.05)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}>
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
              ⭐ Most Popular
            </div>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '8px'
              }}>Starter</h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{
                  fontSize: '48px',
                  fontWeight: '700',
                  color: '#ffffff'
                }}>$29</span>
                <span style={{
                  color: '#bfdbfe',
                  fontSize: '18px'
                }}>/month</span>
              </div>
              <p style={{ color: '#bfdbfe' }}>For serious domain researchers</p>
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
                  <span style={{ color: '#ffffff' }}>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleSubscribe('starter')}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: '#ffffff',
                color: '#2563eb',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '700',
                fontSize: '18px',
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
              }}
            >
              Start 7-Day Free Trial
            </button>
          </div>

          {/* Pro Plan */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #f3f4f6',
            padding: '32px',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          }}>
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

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '8px'
              }}>Pro</h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{
                  fontSize: '48px',
                  fontWeight: '700',
                  color: '#111827'
                }}>$99</span>
                <span style={{
                  color: '#4b5563',
                  fontSize: '18px'
                }}>/month</span>
              </div>
              <p style={{ color: '#4b5563' }}>For domain investment professionals</p>
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
                  <span style={{ color: '#374151' }}>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleSubscribe('pro')}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: 'linear-gradient(to right, #9333ea, #ec4899)',
                color: '#ffffff',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '600',
                fontSize: '18px',
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(147, 51, 234, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #db2777)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(147, 51, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #9333ea, #ec4899)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(147, 51, 234, 0.3)';
              }}
            >
              Start 7-Day Free Trial
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{
          maxWidth: '896px',
          margin: '0 auto 80px auto'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            textAlign: 'center',
            color: '#111827',
            marginBottom: '48px'
          }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {[
              {
                question: "What's included in the free plan?",
                answer: "Get 20 domain searches per month with basic WHOIS, DNS, and security data. Perfect for casual domain research and testing our platform."
              },
              {
                question: "Can I cancel anytime?",
                answer: "Yes! All paid plans can be canceled at any time. You'll continue to have access until the end of your billing period with no hidden fees."
              },
              {
                question: "Do you offer enterprise plans?",
                answer: "Yes! We have custom enterprise solutions with white-label options, dedicated support, and volume pricing. Contact us for details."
              },
              {
                question: "How accurate is the data?",
                answer: "We aggregate data from multiple premium sources including WHOIS databases, security vendors, and DNS providers for maximum accuracy and coverage."
              }
            ].map((faq, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}>
                <h3 style={{
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '16px',
                  fontSize: '18px'
                }}>
                  {faq.question}
                </h3>
                <p style={{
                  color: '#4b5563',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Section */}
        <div style={{
          background: 'linear-gradient(to right, #2563eb, #9333ea, #3730a3)',
          borderRadius: '24px',
          color: '#ffffff',
          padding: '48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.1)'
          }}></div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: '700',
              marginBottom: '24px',
              margin: '0 0 24px 0'
            }}>
              Ready to Supercharge Your Domain Research?
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#bfdbfe',
              marginBottom: '40px',
              maxWidth: '768px',
              margin: '0 auto 40px auto',
              lineHeight: '1.6'
            }}>
              Join thousands of domain investors, developers, and businesses who trust 
              DomainInsight for their domain intelligence needs.
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth < 640 ? 'column' : 'row',
              gap: '16px',
              justifyContent: 'center',
              maxWidth: '448px',
              margin: '0 auto'
            }}>
              <button 
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '16px 32px',
                  background: '#ffffff',
                  color: '#2563eb',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: '700',
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.2)',
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.2)';
                }}
              >
                Try Free Now
              </button>
              <button 
                onClick={() => handleSubscribe('starter')}
                style={{
                  padding: '16px 32px',
                  background: '#1d4ed8',
                  color: '#ffffff',
                  borderRadius: '12px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: '700',
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e40af';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }}
              >
                Start 7-Day Trial
              </button>
            </div>
            
            <p style={{
              color: '#bfdbfe',
              fontSize: '14px',
              marginTop: '24px',
              margin: '24px 0 0 0'
            }}>
              No credit card required for free tier • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;