import React from 'react';
import { NavigationPageId, NavItemConfig } from '../types';
import {
  LayoutDashboard,
  Activity,
  Map,
  BarChart3,
  Cpu,
  Crosshair,
  Award,
  AlertTriangle,
  RadioTower,
  FileText,
  Server,
  Droplets,
  ChevronRight,
} from 'lucide-react';

interface AppSidebarProps {
  currentPage: NavigationPageId;
  onNavigate: (page: NavigationPageId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    section: 'core',
  },
  {
    id: 'live-monitoring',
    label: 'Live Monitoring',
    icon: 'Activity',
    badge: 'LIVE',
    badgeVariant: 'emerald',
    section: 'core',
  },
  {
    id: 'network-map',
    label: 'Network Map',
    icon: 'Map',
    badge: '7 Nodes',
    badgeVariant: 'blue',
    section: 'core',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'BarChart3',
    section: 'core',
  },
  {
    id: 'ai-intelligence',
    label: 'AI Intelligence',
    icon: 'Cpu',
    badge: 'ML v2',
    badgeVariant: 'blue',
    section: 'intelligence',
  },
  {
    id: 'contamination-localization',
    label: 'Contamination Localization',
    icon: 'Crosshair',
    badge: 'Active',
    badgeVariant: 'amber',
    section: 'intelligence',
  },
  {
    id: 'bis-compliance',
    label: 'BIS Compliance',
    icon: 'Award',
    badge: 'IS 10500',
    badgeVariant: 'slate',
    section: 'intelligence',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: 'AlertTriangle',
    badge: '2 New',
    badgeVariant: 'rose',
    section: 'compliance_system',
  },
  {
    id: 'advanced-detection',
    label: 'Advanced Detection',
    icon: 'RadioTower',
    section: 'compliance_system',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'FileText',
    section: 'compliance_system',
  },
  {
    id: 'system-architecture',
    label: 'System Architecture',
    icon: 'Server',
    section: 'compliance_system',
  },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const renderIcon = (iconName: string, active: boolean) => {
    const className = `w-4 h-4 transition-colors ${
      active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
    }`;

    switch (iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      case 'Map':
        return <Map className={className} />;
      case 'BarChart3':
        return <BarChart3 className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'Crosshair':
        return <Crosshair className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'AlertTriangle':
        return <AlertTriangle className={className} />;
      case 'RadioTower':
        return <RadioTower className={className} />;
      case 'FileText':
        return <FileText className={className} />;
      case 'Server':
        return <Server className={className} />;
      default:
        return <Activity className={className} />;
    }
  };

  const getBadgeClass = (variant?: string) => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'rose':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse';
      case 'amber':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'blue':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const coreItems = NAV_ITEMS.filter((i) => i.section === 'core');
  const intelligenceItems = NAV_ITEMS.filter((i) => i.section === 'intelligence');
  const systemItems = NAV_ITEMS.filter((i) => i.section === 'compliance_system');

  const renderNavGroup = (items: NavItemConfig[], title: string) => (
    <div className="mb-5">
      <div className="px-3 mb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => {
                onNavigate(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {renderIcon(item.icon, isActive)}
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 text-[9px] font-mono font-medium rounded border ${getBadgeClass(
                      item.badgeVariant
                    )}`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3 h-3 text-cyan-400" />}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-md">
            <Droplets className="w-5 h-5 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-base tracking-wider text-white">
                SWPM
              </span>
              <span className="px-1 py-0.2 text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                SCADA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Smart Water Pipeline Monitoring
            </p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {renderNavGroup(coreItems, 'Telemetry & Control')}
          {renderNavGroup(intelligenceItems, 'AI Analytics & Compliance')}
          {renderNavGroup(systemItems, 'Alerts & Diagnostics')}
        </div>

        {/* Sidebar Footer / SCADA Node Status Summary */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="font-semibold text-slate-200">Kolkata Grid</div>
                <div className="text-[10px] text-slate-400 font-mono">7 Nodes Linked</div>
              </div>
            </div>
            <span className="px-1.5 py-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded">
              ONLINE
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
