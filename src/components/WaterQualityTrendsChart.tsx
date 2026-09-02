import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TimeRange, TimeSeriesDataPoint } from '../types';
import { Layers, RefreshCw, ZoomIn } from 'lucide-react';

interface WaterQualityTrendsChartProps {
  data: TimeSeriesDataPoint[];
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  onRefresh?: () => void;
  theme?: 'dark' | 'light';
}

export const WaterQualityTrendsChart: React.FC<WaterQualityTrendsChartProps> = ({
  data,
  selectedRange,
  onRangeChange,
  onRefresh,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  const [visibleSeries, setVisibleSeries] = useState<{
    pH: boolean;
    tds: boolean;
    turbidity: boolean;
    temperature: boolean;
    wqi: boolean;
  }>({
    pH: true,
    tds: true,
    turbidity: true,
    temperature: true,
    wqi: false,
  });

  const toggleSeries = (key: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Theme-aware series colors
  const colors = {
    pH: isLight ? '#4C7A4A' : '#10b981',
    tds: isLight ? '#3E6690' : '#3b82f6',
    turbidity: isLight ? '#A97B1F' : '#f59e0b',
    temperature: isLight ? '#7C5295' : '#8b5cf6',
    wqi: isLight ? '#2F4C69' : '#06b6d4',
    grid: isLight ? '#E4DCBE' : '#1e293b',
    axis: isLight ? '#948A73' : '#64748b',
    axisLine: isLight ? '#E4DCBE' : '#334155',
  };

  // Custom formatted tooltip for industrial readability
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-xl text-xs backdrop-blur-md min-w-[200px] border ${
          isLight ? 'bg-[#FCFAF3] border-[#DCD2B8] text-[#2B2620]' : 'bg-slate-900/95 border-slate-700/80 text-slate-100'
        }`}>
          <div className={`font-mono font-semibold pb-1.5 mb-2 flex items-center justify-between border-b ${
            isLight ? 'border-[#DCD2B8] text-[#5C5445]' : 'border-slate-800 text-slate-300'
          }`}>
            <span>Timestamp</span>
            <span className={isLight ? 'text-[#3E6690] font-bold' : 'text-cyan-400'}>{label}</span>
          </div>
          <div className="space-y-1.5 font-mono">
            {payload.map((item: any) => {
              let unit = '';
              if (item.dataKey === 'pH') unit = 'pH';
              else if (item.dataKey === 'tds') unit = 'mg/L';
              else if (item.dataKey === 'turbidity') unit = 'NTU';
              else if (item.dataKey === 'temperature') unit = '°C';
              else if (item.dataKey === 'wqi') unit = 'Index';

              return (
                <div key={item.dataKey} className="flex items-center justify-between gap-3">
                  <span className={`flex items-center gap-1.5 ${isLight ? 'text-[#5C5445]' : 'text-slate-400'}`}>
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}:
                  </span>
                  <span className={`font-bold ${isLight ? 'text-[#2B2620]' : 'text-white'}`}>
                    {item.value} {unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="water-quality-trends-card"
      className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm backdrop-blur-sm"
    >
      {/* Chart Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Water Quality Trends & Anomaly Tracking
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              BIS IS 10500 Compliant Grid
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Synchronized telemetry curves for pH, TDS, Turbidity, and Temperature across active distribution sectors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Selector */}
          <div className="inline-flex p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
            {(['1H', '24H', '7D'] as TimeRange[]).map((range) => (
              <button
                key={range}
                id={`time-range-btn-${range}`}
                onClick={() => onRangeChange(range)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  selectedRange === range
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {onRefresh && (
            <button
              id="refresh-chart-btn"
              onClick={onRefresh}
              className="p-1.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
              title="Refresh telemetry stream"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Parameter Visibility Toggles */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mr-1">
          <Layers className="w-3.5 h-3.5 text-slate-400" /> Filter Streams:
        </span>

        <button
          onClick={() => toggleSeries('pH')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5 ${
            visibleSeries.pH
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-950/40 border-slate-800 text-slate-400 opacity-60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          pH (Standard: 6.5–8.5)
        </button>

        <button
          onClick={() => toggleSeries('tds')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5 ${
            visibleSeries.tds
              ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
              : 'bg-slate-950/40 border-slate-800 text-slate-400 opacity-60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          TDS (ppm)
        </button>

        <button
          onClick={() => toggleSeries('turbidity')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5 ${
            visibleSeries.turbidity
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-slate-950/40 border-slate-800 text-slate-400 opacity-60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Turbidity (NTU)
        </button>

        <button
          onClick={() => toggleSeries('temperature')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5 ${
            visibleSeries.temperature
              ? 'bg-violet-500/10 border-violet-500/40 text-violet-300'
              : 'bg-slate-950/40 border-slate-800 text-slate-400 opacity-60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          Temp (°C)
        </button>

        <button
          onClick={() => toggleSeries('wqi')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5 ${
            visibleSeries.wqi
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-950/40 border-slate-800 text-slate-400 opacity-60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          WQI Index
        </button>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 36, left: -10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke={colors.axis}
              tick={{ fontSize: 10, fill: colors.axis, fontFamily: isLight ? 'IBM Plex Mono' : 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: colors.axisLine }}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            {/* Primary Left Y Axis for Normalized / Scaled metrics */}
            <YAxis
              yAxisId="left"
              stroke={colors.axis}
              tick={{ fontSize: 10, fill: colors.axis, fontFamily: isLight ? 'IBM Plex Mono' : 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: colors.axisLine }}
              domain={[0, 'auto']}
            />
            {/* Secondary Right Y Axis for TDS (high magnitude) */}
            {visibleSeries.tds && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={colors.tds}
                tick={{ fontSize: 10, fill: colors.tds, fontFamily: isLight ? 'IBM Plex Mono' : 'JetBrains Mono' }}
                tickLine={false}
                axisLine={{ stroke: colors.axisLine }}
                domain={[100, 350]}
                unit=" ppm"
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            {/* BIS Turbidity Upper Limit Reference Line */}
            {visibleSeries.turbidity && (
              <ReferenceLine
                yAxisId="left"
                y={5.0}
                stroke={isLight ? '#9C4436' : '#ef4444'}
                strokeDasharray="4 4"
                label={{
                  value: 'BIS Turbidity Max (5.0 NTU)',
                  fill: isLight ? '#9C4436' : '#f87171',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />
            )}

            {visibleSeries.pH && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="pH"
                name="pH Level"
                stroke={colors.pH}
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 5, stroke: isLight ? '#2B2620' : '#064e3b', strokeWidth: 2 }}
              />
            )}

            {visibleSeries.tds && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="tds"
                name="TDS"
                stroke={colors.tds}
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 5, stroke: isLight ? '#2B2620' : '#1e3a8a', strokeWidth: 2 }}
              />
            )}

            {visibleSeries.turbidity && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="turbidity"
                name="Turbidity"
                stroke={colors.turbidity}
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 5, stroke: isLight ? '#2B2620' : '#78350f', strokeWidth: 2 }}
              />
            )}

            {visibleSeries.temperature && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                name="Temperature"
                stroke={colors.temperature}
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
                activeDot={{ r: 4, stroke: isLight ? '#2B2620' : '#4c1d95', strokeWidth: 2 }}
              />
            )}

            {visibleSeries.wqi && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="wqi"
                name="WQI Potability Index"
                stroke={colors.wqi}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, stroke: isLight ? '#2B2620' : '#164e63', strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Status */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Sampling Interval: 15s Continuous SCADA Ingest</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          Showing {data.length} telemetry points ({selectedRange})
        </div>
      </div>
    </div>
  );
};
