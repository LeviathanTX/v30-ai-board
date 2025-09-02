// V19-style clean sidebar without cards
import React from 'react';
import { 
  LayoutDashboard, FileText, Users, MessageSquare, 
  Video, CreditCard, Settings, HelpCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { useSupabase } from '../../contexts/SupabaseContext';

export default function Sidebar({ 
  collapsed, 
  setCollapsed, 
  activeModule, 
  setActiveModule 
}) {
  const { state } = useAppState();
  const { user } = useSupabase();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', name: 'Document Hub', icon: FileText },
    { id: 'advisors', name: 'Advisory Hub', icon: Users },
    { id: 'ai', name: 'AI Board', icon: MessageSquare },
    { id: 'meetings', name: 'Virtual Meetings Hub', icon: Video },
    { id: 'subscription', name: 'Subscription', icon: CreditCard }
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <div className={`flex items-center space-x-3 ${collapsed ? 'hidden' : ''}`}>
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold">
            AI
          </div>
          <span className="font-semibold">AI Board</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.user_metadata?.full_name || 'John Doe'}</p>
              <p className="text-xs text-gray-400">{user?.email || 'john@example.com'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`
                w-full flex items-center px-4 py-3 text-sm
                transition-colors relative
                ${isActive 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
              title={collapsed ? item.name : ''}
            >
              {isActive && (
                <div className="absolute left-0 top-0 h-full w-1 bg-blue-600"></div>
              )}
              <Icon size={20} className={collapsed ? 'mx-auto' : 'mr-3'} />
              {!collapsed && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="border-t border-gray-800 py-4">
        <button className="w-full flex items-center px-4 py-3 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
          <Settings size={20} className={collapsed ? 'mx-auto' : 'mr-3'} />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </div>
  );
}