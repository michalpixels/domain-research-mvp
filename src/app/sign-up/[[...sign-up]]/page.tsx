// src/app/sign-up/[[...sign-up]]/page.tsx - WITH INLINE STYLING
import { SignUp } from '@clerk/nextjs'
import { Globe, ArrowLeft } from 'lucide-react'

export default function SignUpPage() {
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
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
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
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4b5563';
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* Sign Up Form */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '64px 16px',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f3f4f6',
          padding: '32px',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              Get Started Free
            </h1>
            <p style={{
              color: '#4b5563',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>
              Create your account and start researching domains
            </p>
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <p style={{ margin: '0 0 4px 0' }}>✅ 20 free searches per month</p>
              <p style={{ margin: '0 0 4px 0' }}>✅ Complete domain analysis</p>
              <p style={{ margin: 0 }}>✅ Search history & saved domains</p>
            </div>
          </div>
          
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: {
                  backgroundColor: '#2563eb',
                  '&:hover': { backgroundColor: '#1d4ed8' },
                  fontSize: '14px',
                  textTransform: 'none',
                  fontWeight: '600'
                },
                card: {
                  boxShadow: 'none',
                  border: 'none'
                },
                headerTitle: {
                  display: 'none'
                },
                headerSubtitle: {
                  display: 'none'
                }
              }
            }}
            redirectUrl="/"
          />
        </div>
      </div>
    </div>
  )
}