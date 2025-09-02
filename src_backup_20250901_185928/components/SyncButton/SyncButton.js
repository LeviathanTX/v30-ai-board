// src/components/SyncButton/SyncButton.js
import React, { useState } from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { usePersistence } from '../../hooks/usePersistence';
import { FEATURES } from '../../config/features';

export default function SyncButton() {
  const { syncNow, getSyncStatus, isCloudEnabled } = usePersistence();
  const [isSyncing, setIsSyncing] = useState(false);
  const status = getSyncStatus();

  if (!FEATURES.CLOUD_PERSISTENCE) {
    return null; // Don't show sync button if cloud persistence is disabled
  }

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncNow();
      logger.debug('Sync result:', result);
    } catch (error) {
      logger.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isCloudEnabled) {
    return (
      <button
        disabled
        className="p-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
        title="Sign in to enable cloud sync"
      >
        <CloudOff size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing || !status.isOnline}
      className={`p-2 rounded-lg transition-colors ${
        isSyncing 
          ? 'bg-blue-100 text-blue-600' 
          : status.isOnline
            ? 'hover:bg-gray-100 text-gray-600'
            : 'bg-yellow-100 text-yellow-600'
      }`}
      title={
        isSyncing 
          ? 'Syncing...' 
          : status.isOnline 
            ? 'Sync with cloud' 
            : 'Offline - will sync when connected'
      }
    >
      {isSyncing ? (
        <RefreshCw size={20} className="animate-spin" />
      ) : status.isOnline ? (
        <Cloud size={20} />
      ) : (
        <CloudOff size={20} />
      )}
    </button>
  );
}

// Export a mini version for tight spaces
export function SyncStatusBadge() {
  const { getSyncStatus } = usePersistence();
  const status = getSyncStatus();

  if (!FEATURES.CLOUD_PERSISTENCE) return null;

  return (
    <div className={`flex items-center space-x-1 text-xs ${
      status.isOnline ? 'text-green-600' : 'text-yellow-600'
    }`}>
      {status.isOnline ? (
        <Cloud size={12} />
      ) : (
        <CloudOff size={12} />
      )}
      <span>{status.isOnline ? 'Synced' : 'Offline'}</span>
    </div>
  );
}