import React, { useState, useEffect } from 'react';
import {
  NavigationPageId,
  TimeRange,
  KPISummary,
  MonitoringNode,
  AlertItem,
  RiskAssessment,
  TimeSeriesDataPoint,
} from './types';
import { WaterMonitoringService } from './services/mockData';
import { AppSidebar } from './components/AppSidebar';
import { AppHeader } from './components/AppHeader';
import { DashboardPage } from './pages/DashboardPage';
import { PlaceholderPage } from './components/PlaceholderPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPageId>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('swpm_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Sync theme to document element and localStorage
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      localStorage.setItem('swpm_theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      localStorage.setItem('swpm_theme', 'dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Reactive State from Service
  const [kpis, setKpis] = useState<KPISummary>(WaterMonitoringService.getKPISummary());
  const [nodes, setNodes] = useState<MonitoringNode[]>(WaterMonitoringService.getNodes());
  const [alerts, setAlerts] = useState<AlertItem[]>(WaterMonitoringService.getAlerts());
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment>(
    WaterMonitoringService.getRiskAssessment()
  );
  const [trendData, setTrendData] = useState<TimeSeriesDataPoint[]>(
    WaterMonitoringService.getTimeSeriesData('24H')
  );

  // Sync trend data on time range switch
  useEffect(() => {
    const data = WaterMonitoringService.getTimeSeriesData(timeRange);
    setTrendData(data);
  }, [timeRange]);

  // Handle manual data refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setKpis(WaterMonitoringService.getKPISummary());
      setNodes([...WaterMonitoringService.getNodes()]);
      setAlerts([...WaterMonitoringService.getAlerts()]);
      setRiskAssessment({ ...WaterMonitoringService.getRiskAssessment() });
      setTrendData(WaterMonitoringService.getTimeSeriesData(timeRange));
      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setIsRefreshing(false);
    }, 500);
  };

  // Acknowledge Alert Handler
  const handleAcknowledgeAlert = (alertId: string) => {
    WaterMonitoringService.acknowledgeAlert(alertId, 'K. Sen (Chief Eng.)');
    setAlerts([...WaterMonitoringService.getAlerts()]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Navigation Sidebar */}
      <AppSidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* 2. Main Shell Layout (Offset by Sidebar on large screens) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* App Top Header */}
        <AppHeader
          onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          alerts={alerts}
          onNavigateToAlerts={() => setCurrentPage('alerts')}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Main Routed Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-grid-pattern overflow-y-auto">
          {currentPage === 'dashboard' ? (
            <DashboardPage
              kpis={kpis}
              nodes={nodes}
              alerts={alerts}
              riskAssessment={riskAssessment}
              trendData={trendData}
              selectedRange={timeRange}
              onRangeChange={setTimeRange}
              onRefreshTelemetry={handleRefresh}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onNavigate={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              theme={theme}
            />
          ) : (
            <PlaceholderPage
              pageId={currentPage}
              onBackToDashboard={() => setCurrentPage('dashboard')}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-slate-300">SWPM SCADA</span>
            <span>·</span>
            <span>Kolkata Municipal Water Supply Network</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-emerald-400">BIS IS 10500 Compliant</span>
            <span>·</span>
            <span>Telemetry Protocol: IEC 60870-5-104 / MQTT</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
