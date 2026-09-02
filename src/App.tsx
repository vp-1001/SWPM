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
import { hardwareService } from './services/hardwareService';
import { INITIAL_PIPELINE_GRAPH } from './services/topologyService';
import { PipelineGraph, NodeTestResult } from './types';
import { AppSidebar } from './components/AppSidebar';
import { AppHeader } from './components/AppHeader';
import { DashboardPage } from './pages/DashboardPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { NetworkMapPage } from './pages/NetworkMapPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIIntelligencePage } from './pages/AIIntelligencePage';
import { ContaminationLocalizationPage } from './pages/ContaminationLocalizationPage';
import { AlertsPage } from './pages/AlertsPage';
import { AdvancedDetectionPage } from './pages/AdvancedDetectionPage';
import { ReportsPage } from './pages/ReportsPage';
import { PlaceholderPage } from './components/PlaceholderPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPageId>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [pipelineGraph, setPipelineGraph] = useState<PipelineGraph>(INITIAL_PIPELINE_GRAPH);
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
  const [currentDecision, setCurrentDecision] = useState<any>(null);

  // Connect Hardware Telemetry Service Subscriptions
  useEffect(() => {
    const unsub = hardwareService.subscribeTelemetry((decision) => {
      setCurrentDecision(decision);
      setLastUpdated(decision.timestamp || 'Just now');

      // Live update KPI summary cards with ESP32 / decision engine values
      setKpis((prev) => ({
        ...prev,
        pH: {
          ...prev.pH,
          value: decision.ph,
          displayValue: decision.ph.toString(),
          status: decision.parameters.ph === 'NORMAL' ? 'optimal' : decision.parameters.ph === 'WARNING' ? 'warning' : 'critical',
          historicalSparkline: [...prev.pH.historicalSparkline.slice(1), decision.ph],
        },
        tds: {
          ...prev.tds,
          value: decision.tds,
          displayValue: decision.tds.toString(),
          status: decision.parameters.tds === 'NORMAL' ? 'optimal' : decision.parameters.tds === 'WARNING' ? 'warning' : 'critical',
          historicalSparkline: [...prev.tds.historicalSparkline.slice(1), decision.tds],
        },
        turbidity: {
          ...prev.turbidity,
          value: decision.turbidity,
          displayValue: decision.turbidity.toString(),
          status: decision.parameters.turbidity === 'NORMAL' ? 'optimal' : decision.parameters.turbidity === 'WARNING' ? 'warning' : 'critical',
          historicalSparkline: [...prev.turbidity.historicalSparkline.slice(1), decision.turbidity],
        },
        temperature: {
          ...prev.temperature,
          value: decision.temperature,
          displayValue: decision.temperature.toString(),
          status: decision.parameters.temperature === 'NORMAL' ? 'optimal' : 'warning',
          historicalSparkline: [...prev.temperature.historicalSparkline.slice(1), decision.temperature],
        },
        overallWQI: {
          ...prev.overallWQI,
          value: decision.riskScore,
          displayValue: decision.riskScore.toString(),
          statusLabel: decision.overallStatus,
          historicalSparkline: [...prev.overallWQI.historicalSparkline.slice(1), decision.riskScore],
        },
      }));

      // Live update main Water Quality Trends Multi-Line Chart
      setTrendData((prevTrend) => {
        const timeLabel = decision.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const newPoint: TimeSeriesDataPoint = {
          timestamp: new Date().toISOString(),
          timeLabel,
          pH: decision.ph,
          tds: decision.tds,
          turbidity: decision.turbidity,
          temperature: decision.temperature,
          chlorine: 1.2,
          wqi: decision.riskScore,
        };

        // Keep rolling buffer of trend points (max 24 points)
        const updated = [...prevTrend, newPoint];
        if (updated.length > 24) return updated.slice(updated.length - 24);
        return updated;
      });

      // Update Risk Assessment
      setRiskAssessment((prev) => ({
        ...prev,
        score: decision.riskScore,
        level: decision.overallStatus === 'SAFE' ? 'LOW RISK' : decision.overallStatus === 'WARNING' ? 'MODERATE RISK' : 'CRITICAL RISK',
        headline: `${decision.overallStatus} — ${decision.probableProblemClass}`,
        shortExplanation: decision.recommendation,
        recommendations: decision.treatmentSteps,
      }));

      // Push real anomaly alert if triggered by decision engine
      if (decision.anomalies && decision.anomalies.length > 0) {
        const topAnom = decision.anomalies[0];
        const newAlert: AlertItem = {
          id: topAnom.id,
          severity: topAnom.severity === 'critical' ? 'critical' : 'warning',
          node: topAnom.deviceId,
          nodeName: `ESP32 Hardware (${topAnom.deviceId})`,
          timestamp: topAnom.timestamp,
          timeAgo: 'Just now',
          title: `HARDWARE ANOMALY: ${topAnom.parameter.toUpperCase()} Spike (${topAnom.currentValue})`,
          description: `${topAnom.probableCause}. Recommendation: ${topAnom.recommendation}`,
          status: 'active',
          parameterAffected: topAnom.parameter,
          observedValue: `${topAnom.currentValue}`,
          thresholdValue: 'BIS IS 10500 Ceiling',
        };

        setAlerts((prev) => {
          if (prev.some((a) => a.id === topAnom.id)) return prev;
          return [newAlert, ...prev];
        });
      }
    });

    return () => unsub();
  }, []);

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

  // Pipeline Topology Graph Update Handler
  const handleUpdatePipelineGraph = (updatedGraph: PipelineGraph, testResult?: NodeTestResult) => {
    setPipelineGraph(updatedGraph);

    if (testResult?.isAbnormal) {
      const targetNode = updatedGraph.nodes.find((n) => n.id === testResult.nodeId);
      const newAlert: AlertItem = {
        id: `ALT-TOP-${Date.now().toString().slice(-4)}`,
        severity: testResult.status === 'critical' ? 'critical' : 'warning',
        node: testResult.nodeId,
        nodeName: targetNode?.name || testResult.nodeId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        timeAgo: 'Just now',
        title: `${testResult.status === 'critical' ? 'CRITICAL' : 'WARNING'} — Quality Anomaly at ${targetNode?.code || testResult.nodeId}`,
        description: testResult.summaryMessage,
        status: 'active',
        parameterAffected: testResult.violations[0]?.split(' ')[0] || 'Quality',
        observedValue: `Turbidity: ${testResult.readings.turbidity} NTU`,
        thresholdValue: 'BIS IS 10500 Ceiling',
      };
      setAlerts((prev) => [newAlert, ...prev]);
    } else if (testResult && !testResult.isAbnormal) {
      // Clear or resolve alerts for this node
      setAlerts((prev) =>
        prev.map((a) =>
          a.node === testResult.nodeId ? { ...a, status: 'resolved' } : a
        )
      );
    }
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
              pipelineGraph={pipelineGraph}
              currentDecision={currentDecision}
              onUpdatePipelineGraph={handleUpdatePipelineGraph}
              onRangeChange={setTimeRange}
              onRefreshTelemetry={handleRefresh}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onNavigate={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              theme={theme}
            />
          ) : currentPage === 'live-monitoring' ? (
            <LiveMonitoringPage
              kpis={kpis}
              currentDecision={currentDecision}
              onNavigate={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onRefreshTelemetry={handleRefresh}
            />
          ) : currentPage === 'network-map' ? (
            <NetworkMapPage
              graph={pipelineGraph}
              onUpdateGraph={handleUpdatePipelineGraph}
              onBackToDashboard={() => setCurrentPage('dashboard')}
            />
          ) : currentPage === 'analytics' ? (
            <AnalyticsPage
              trendData={trendData}
              selectedRange={timeRange}
              onRangeChange={setTimeRange}
              onRefresh={handleRefresh}
              currentDecision={currentDecision}
              theme={theme}
            />
          ) : currentPage === 'ai-intelligence' ? (
            <AIIntelligencePage currentDecision={currentDecision} />
          ) : currentPage === 'contamination-localization' ? (
            <ContaminationLocalizationPage nodes={nodes} />
          ) : currentPage === 'alerts' ? (
            <AlertsPage
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onNavigate={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : currentPage === 'advanced-detection' ? (
            <AdvancedDetectionPage nodes={nodes} />
          ) : currentPage === 'reports' ? (
            <ReportsPage assessment={riskAssessment} />
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
