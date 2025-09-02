// src/modules/MeetingHub-CS21-v1/MeetingHub.js
import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, Monitor } from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { format } from 'date-fns';

export default function MeetingHub() {
  const { state } = useAppState();
  const [selectedPlatform, setSelectedPlatform] = useState('meet');

  const platforms = [
    {
      id: 'meet',
      name: 'Google Meet',
      icon: '🎥',
      color: 'green',
      status: 'coming-soon',
      description: 'Seamless integration with Google Workspace'
    },
    {
      id: 'zoom',
      name: 'Zoom',
      icon: '📹',
      color: 'blue',
      status: 'coming-soon',
      description: 'Join Zoom meetings with AI advisors'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      icon: '👥',
      color: 'purple',
      status: 'coming-soon',
      description: 'Enterprise-ready Teams integration'
    }
  ];

  const upcomingMeetings = [
    {
      id: 1,
      title: 'Strategic Planning Session',
      date: new Date(Date.now() + 86400000), // Tomorrow
      time: '10:00 AM',
      advisors: ['Sarah Chen', 'Marcus Thompson'],
      platform: 'meet',
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Q1 Financial Review',
      date: new Date(Date.now() + 172800000), // 2 days
      time: '2:00 PM',
      advisors: ['Marcus Thompson'],
      platform: 'zoom',
      status: 'scheduled'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meeting Hub</h1>
            <p className="text-sm text-gray-600 mt-1">
              Schedule and join meetings with your AI advisors
            </p>
          </div>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus size={20} />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Video Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.map(platform => (
            <div
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPlatform === platform.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-3xl">{platform.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{platform.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
                  {platform.status === 'coming-soon' && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meeting Management */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Meetings */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Upcoming Meetings</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingMeetings.map(meeting => (
                <div key={meeting.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar size={16} />
                          <span>{format(meeting.date, 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{meeting.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {meeting.advisors.join(', ')}
                        </span>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Setup */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Meeting Setup</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Weekly Strategy Review"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Advisors
                </label>
                <div className="space-y-2">
                  {state.selectedAdvisors.slice(0, 3).map(advisor => (
                    <label key={advisor.id} className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                      <span className="text-2xl">{advisor.avatar_emoji}</span>
                      <span className="text-sm text-gray-700">{advisor.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Google Meet</option>
                  <option>Zoom</option>
                  <option>Microsoft Teams</option>
                </select>
              </div>
              
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Create Meeting Link
              </button>
            </div>
          </div>
        </div>

        {/* Platform Status */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <Monitor className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Video Platform Integration Coming Soon</h4>
              <p className="text-sm text-blue-700 mt-1">
                We're working on seamless integration with Google Meet, Zoom, and Microsoft Teams. 
                Your AI advisors will soon be able to join your video calls directly.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                For now, use the AI Board chat interface while on your video calls for real-time advisory support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}