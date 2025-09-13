// src/app/pricing/page.tsx
"use client"

import React from 'react';
import { Check, Star, Globe } from 'lucide-react';

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
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Research Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From casual domain research to professional investment analysis, 
            we have the perfect plan for your needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>20 domain searches per month</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>Basic WHOIS information</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>DNS record lookup</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>Basic security scanning</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>Save favorite domains</span>
              </li>
            </ul>

            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Get Started Free
            </button>
          </div>

          {/* Starter Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$29</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>500 domain searches per month</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>Complete WHOIS & DNS data</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>Advanced security reports</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>6-month historical data</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>CSV export functionality</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>Email support</span>
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe('starter')}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Start 7-Day Free Trial
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 relative">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                Pro
                <Star className="w-5 h-5 text-yellow-500 ml-2" />
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$99</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>Unlimited domain searches</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>5-year historical data access</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>API access & integrations</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>Bulk domain processing</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>Advanced analytics & trends</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>Priority support & consultation</span>
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe('pro')}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-semibold"
            >
              Start 7-Day Free Trial
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">
                What's included in the free plan?
              </h3>
              <p className="text-gray-600">
                Get 20 domain searches per month with basic WHOIS, DNS, and security data. 
                Perfect for casual domain research and testing our platform.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes! All paid plans can be canceled at any time. You'll continue to have 
                access until the end of your billing period.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">
                Do you offer enterprise plans?
              </h3>
              <p className="text-gray-600">
                Yes! We have custom enterprise solutions with white-label options, 
                dedicated support, and volume pricing. Contact us for details.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">
                How accurate is the data?
              </h3>
              <p className="text-gray-600">
                We aggregate data from multiple premium sources including WHOIS databases, 
                security vendors, and DNS providers for maximum accuracy and coverage.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Supercharge Your Domain Research?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of domain investors, developers, and businesses who trust 
            DomainInsight for their domain intelligence needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Try Free Now
            </button>
            <button 
              onClick={() => handleSubscribe('starter')}
              className="px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold"
            >
              Start 7-Day Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;