import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  RefreshCw,
  Radio,
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { AlertItem } from '../types';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  lastUpdated: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  alerts: AlertItem[];
  onNavigateToAlerts?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleSidebar,
  lastUpdated,
  onRefresh,
  isRefreshing,
  alerts,
  onNavigateToAlerts,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 h-16 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between"
    >
      {/* Left: Mobile Toggle & Brand Headline */}
      <div className="flex items-center gap-3.5">
        <button
          id="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 lg:hidden transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono font-black text-sm sm:text-base tracking-wider text-white">
              SWPM
            </h1>
            <span className="hidden sm:inline-block text-slate-400 text-xs font-mono">/</span>
            <span className="hidden sm:inline-block text-xs font-medium text-slate-300">
              Smart Water Pipeline Monitoring
            </span>
          </div>
          <p className="text-[10px] text-slate-400 hidden md:block">
            Municipal SCADA & Hydrodynamic Water Quality Telemetry
          </p>
        </div>
      </div>

      {/* Right Controls: Status, Timestamp, Notification, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* System Status: ONLINE */}
        <div
          id="system-status-indicator"
          className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] tracking-wide">ONLINE</span>
        </div>

        {/* Live Clock & Last Data Update */}
        <div className="hidden lg:flex flex-col items-end text-right">
          <div className="text-xs font-mono font-medium text-slate-200">{currentTime} UTC</div>
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <span>Last ingest: {lastUpdated}</span>
          </div>
        </div>

        {/* Manual Refresh Button */}
        <button
          id="header-refresh-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all ${
            isRefreshing ? 'opacity-75' : ''
          }`}
          title="Refresh SCADA Ingest"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            aria-label="Alert Notifications"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-mono font-bold text-slate-950">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div
              id="notifications-popover"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-xs text-white">Active Alerts ({activeAlertsCount})</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">BIS IS 10500</span>
              </div>

              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                {alerts.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold text-amber-400">{a.node}</span>
                      <span className="text-[10px] font-mono text-slate-400">{a.timeAgo}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug">{a.title}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    if (onNavigateToAlerts) onNavigateToAlerts();
                  }}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  View all alerts & events &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User / Profile Area */}
        <div
          id="user-profile-widget"
          className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-800"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-700 border border-cyan-400/40 flex items-center justify-center text-white text-xs font-mono font-bold shadow-inner">
            OP
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-200">K. Sen (Chief Eng.)</div>
            <div className="text-[10px] text-slate-400 font-mono">SCADA Level 3 Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
