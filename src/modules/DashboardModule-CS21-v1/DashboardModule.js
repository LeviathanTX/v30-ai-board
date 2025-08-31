import React from 'react';
import { 
  TrendingUp, Users, FileText, Clock, 
  Calendar, BarChart, Activity, Target
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';

export default function DashboardModule() {
  const { state } = useAppState();

  const stats = [
    { label: 'Active Advisors', value: state.advisors?.length || 7, icon: Users, color: 'blue' },
    { label: 'Documents', value: state.documents?.length || 0, icon: FileText, color: 'green' },
    { label: 'Conversations', value: state.conversations?.length || 0, icon: Activity, color: 'purple' },
    { label: 'This Week', value: '12h 34m', icon: Clock, color: 'yellow' }
  ];

  const quickActions = [
    { label: 'Start Board Meeting', icon: Users, action: 'ai', color: 'blue' },
    { label: 'Upload Document', icon: FileText, action: 'documents', color: 'green' },
    { label: 'View Calendar', icon: Calendar, action: 'meetings', color: 'purple' }
  ];

  const handleQuickAction = (action) => {
    window.dispatchEvent(new CustomEvent('navigate-module', { detail: action }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                    <Icon size={20} className={`text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-${action.color}-100 rounded-lg group-hover:bg-${action.color}-200 transition-colors`}>
                      <Icon size={20} className={`text-${action.color}-600`} />
                    </div>
                    <span className="font-medium text-gray-900">{action.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg border border-gray-200">
            {state.conversationMessages?.slice(-5).map((msg, index) => (
              <div key={index} className="p-4 border-b border-gray-100 last:border-0">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{msg.advisor?.avatar || '👤'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {msg.advisor?.name || 'You'}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{msg.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!state.conversationMessages || state.conversationMessages.length === 0) && (
              <div className="p-8 text-center text-gray-500">
                <Activity className="mx-auto mb-2 text-gray-300" size={32} />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Insights */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h2>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Target size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Today's Focus</h3>
                <p className="text-white/90">
                  Based on your recent conversations, consider prioritizing customer acquisition strategies. 
                  Your advisors have identified 3 key opportunities in your market segment.
                </p>
                <button 
                  onClick={() => handleQuickAction('ai')}
                  className="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Explore Insights
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}