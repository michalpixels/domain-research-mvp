// ========================================
// src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'
import { Globe } from 'lucide-react'

export default function Page() {
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
            <button 
              onClick={() => window.location.href = '/'}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Sign Up Form */}
      <div className="flex justify-center items-center py-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Get Started Free
            </h1>
            <p className="text-gray-600">
              Create your account and start researching domains
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <p>✅ 20 free searches per month</p>
              <p>✅ Complete domain analysis</p>
              <p>✅ Search history & saved domains</p>
            </div>
          </div>
          
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
                card: 'shadow-none'
              }
            }}
            redirectUrl="/"
          />
        </div>
      </div>
    </div>
  )
}