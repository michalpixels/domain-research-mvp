// src/app/dashboard/page.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Globe, ArrowRight, Star } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const DashboardPage = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [upgrading, setUpgrading] = useState(false);
  const [upgraded, setUpgraded] = useState(false);
  
  const success = searchParams.get('success');
  const plan = searchParams.get('plan');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // If this is a payment success, try to upgrade the user
    if (success === 'true' && plan && sessionId && user) {
      upgradeUserManually();
    }
  }, [success, plan, sessionId, user]);

  const upgradeUserManually = async () => {
    setUpgrading(true);
    try {
      console.log('🔄 Upgrading user to plan:', plan);
      
      // Call our API to manually upgrade the user since webhooks might not work locally
      const response = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan })
      });

      if (response.ok) {
        const result = await response.json();
        setUpgraded(true);
        console.log('✅ User upgraded successfully:', result);
        
        // Small delay then redirect to main app
        setTimeout(() => {
          window.location.href = '/?upgraded=true';
        }, 2000);
      } else {
        const error = await response.json();
        console.error('❌ Failed to upgrade user:', error);
        // Still redirect but user will need manual upgrade
        setTimeout(() => {
          window.location.href = '/?payment_success=true';
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Error upgrading user:', error);
      // Redirect anyway, user can contact support
      setTimeout(() => {
        window.location.href = '/?payment_error=true';
      }, 3000);
    } finally {
      setUpgrading(false);
    }
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f3f4f6',
    padding: '32px',
    marginBottom: '24px'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '32px 16px'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              background: '#2563eb',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Go to App
          </button>
        </div>
      </div>

      <div style={{
        maxWidth: '896px',
        margin: '80px auto 0 auto'
      }}>
        {success === 'true' ? (
          // Payment Success Flow
          <div style={cardStyle}>
            <div style={{ textAlign: 'center' }}>
              <CheckCircle style={{ 
                width: '64px', 
                height: '64px', 
                color: '#16a34a', 
                margin: '0 auto 24px auto' 
              }} />
              <h1 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '16px',
                margin: '0 0 16px 0'
              }}>
                Payment Successful! 🎉
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#4b5563',
                marginBottom: '32px',
                margin: '0 0 32px 0'
              }}>
                Welcome to the {plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'your'} plan!
              </p>

              {upgrading && (
                <div style={{
                  background: '#dbeafe',
                  border: '1px solid #93c5fd',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <p style={{ color: '#1e40af', margin: 0 }}>
                    🔄 Upgrading your account...
                  </p>
                </div>
              )}

              {upgraded && (
                <div style={{
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <p style={{ color: '#15803d', margin: 0 }}>
                    ✅ Account upgraded successfully!
                  </p>
                </div>
              )}

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
                  {plan === 'starter' ? 'Starter Plan Features:' : 'Pro Plan Features:'}
                </h3>
                
                {plan === 'starter' ? (
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                      <span>500 domain searches per month</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                      <span>Unlimited saved domains</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                      <span>Complete WHOIS & DNS data</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                      <span>Advanced security reports</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                      <span>6-month historical data</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                      <span>CSV export functionality</span>
                    </li>
                  </ul>
                ) : (
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                      <span>Unlimited domain searches</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                      <span>5-year historical data access</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                      <span>API access & integrations</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                      <span>Bulk domain processing</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                      <span>Advanced analytics & trends</span>
                    </li>
                  </ul>
                )}
              </div>

              <button 
                onClick={() => window.location.href = '/'}
                style={{
                  background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                  color: '#ffffff',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
              >
                Start Researching Domains
                <ArrowRight style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
          </div>
        ) : (
          // Regular Dashboard
          <div style={cardStyle}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '16px',
                margin: '0 0 16px 0'
              }}>
                Dashboard
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#4b5563',
                marginBottom: '32px',
                margin: '0 0 32px 0'
              }}>
                Welcome to your domain research dashboard
              </p>
              
              <button 
                onClick={() => window.location.href = '/'}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Go to Domain Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;