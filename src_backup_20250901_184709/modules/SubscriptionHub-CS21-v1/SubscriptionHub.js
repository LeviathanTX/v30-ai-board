import React, { useState } from 'react';
import { 
  CreditCard, Check, X, ArrowRight, TrendingUp,
  Users, FileText, MessageSquare, Sparkles,
  Shield, Zap, Building, Clock, BarChart
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { useSupabase } from '../../contexts/SupabaseContext';

export default function SubscriptionHub() {
  const { state, dispatch } = useAppState();
  const { user } = useSupabase();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Starter',
      price: { monthly: 199, yearly: 1990 },
      description: 'Perfect for small businesses and solo entrepreneurs',
      features: [
        'Up to 3 AI Advisors',
        '50 monthly meetings',
        '10 document analyses/month',
        'Basic insights and summaries',
        'Email support'
      ],
      color: 'gray',
      popular: false
    },
    {
      name: 'Professional',
      price: { monthly: 499, yearly: 4990 },
      description: 'Ideal for growing companies and teams',
      features: [
        'Unlimited AI Advisors',
        'Unlimited meetings',
        'Unlimited document analysis',
        'Custom advisor creation (up to 5)',
        'Video platform integration',
        'Priority support',
        'Advanced analytics'
      ],
      color: 'blue',
      popular: true
    },
    {
      name: 'Enterprise',
      price: { monthly: 1999, yearly: 19990 },
      description: 'For large organizations with complex needs',
      features: [
        'Everything in Professional',
        'Unlimited custom advisors',
        'White-label options',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'Compliance certifications'
      ],
      color: 'purple',
      popular: false
    }
  ];

  const currentPlan = 'Professional'; // Mock current plan

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Subscription Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your plan and billing</p>
          </div>
          {user && !user.id.includes('demo') && (
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
              <CreditCard size={16} />
              <span>Update Payment Method</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Demo Mode Notice */}
        {user?.id?.includes('demo') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Shield className="text-blue-600" size={20} />
              <p className="text-blue-800">
                You're in demo mode. Sign up to unlock all features and save your data.
              </p>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">1.2s</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">98.5%</div>
              <div className="text-sm text-gray-600">Satisfaction Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">45 min</div>
              <div className="text-sm text-gray-600">Avg Meeting Duration</div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <h4 className="font-medium text-gray-900 mb-3">Recent Platform Activity</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Meetings This Week</span>
              <span className="font-medium text-gray-900">23</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Documents Processed</span>
              <span className="font-medium text-gray-900">142</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="font-medium text-gray-900">1,847</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Platform Uptime</span>
              <span className="font-medium text-gray-900">99.98%</span>
            </div>
          </div>
        </div>

        {/* Current Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Usage This Month</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Meetings</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">5</div>
              <div className="text-sm text-gray-600">Documents</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">4</div>
              <div className="text-sm text-gray-600">Active Advisors</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Sparkles className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">23</div>
              <div className="text-sm text-gray-600">AI Insights</div>
            </div>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex items-center">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingCycle === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingCycle === 'yearly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-green-600 font-medium">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`bg-white rounded-lg border-2 ${
                plan.name === currentPlan 
                  ? 'border-blue-500' 
                  : plan.popular 
                  ? 'border-blue-200' 
                  : 'border-gray-200'
              } relative`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              {plan.name === currentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}
              
              <div className="p-6 filter blur-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price[billingCycle]}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="text-green-500 mt-0.5" size={16} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    plan.name === currentPlan
                      ? 'bg-gray-100 text-gray-600 cursor-default'
                      : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  disabled={plan.name === currentPlan}
                >
                  {plan.name === currentPlan ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg">
                <p className="text-gray-600 font-medium">Pricing coming soon</p>
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Starter</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Professional</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">AI Advisors</td>
                  <td className="text-center py-3 px-4">Up to 3</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Monthly Meetings</td>
                  <td className="text-center py-3 px-4">50</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Document Analysis</td>
                  <td className="text-center py-3 px-4">10/month</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Custom Advisors</td>
                  <td className="text-center py-3 px-4">
                    <X className="w-5 h-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">Up to 5</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Video Integration</td>
                  <td className="text-center py-3 px-4">
                    <X className="w-5 h-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">API Access</td>
                  <td className="text-center py-3 px-4">
                    <X className="w-5 h-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <X className="w-5 h-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions?</h3>
          <p className="text-gray-600 mb-4">
            Contact our sales team for more information about pricing and features.
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}