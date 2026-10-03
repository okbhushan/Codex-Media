import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendTimeframe, SpendingDataPoint } from '../types';
import { generateTrendData, formatCurrency } from '../utils/storage';
import { TrendingUp } from 'lucide-react';

interface SpendingChartProps {
  monthlyAverage: number;
  currencySymbol?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: SpendingDataPoint }>;
  currencySymbol: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  currencySymbol,
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="glass-panel-elevated px-3 py-2 rounded-xl border border-purple-500/30 text-xs shadow-xl backdrop-blur-md">
        <p className="text-[#A7A0B5] font-medium">{data.payload.month}</p>
        <p className="text-[#F8F7FC] font-bold text-sm">
          {formatCurrency(data.value, currencySymbol)}
        </p>
      </div>
    );
  }
  return null;
};

export const SpendingChart: React.FC<SpendingChartProps> = ({
  monthlyAverage,
  currencySymbol = '₹',
}) => {
  const [timeframe, setTimeframe] = useState<TrendTimeframe>('6M');

  const chartData = generateTrendData(monthlyAverage, timeframe);

  return (
    <div className="rounded-[22px] glass-panel p-5 sm:p-6 transition-all duration-300 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-24 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Filter */}
      <div className="flex items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#F8F7FC] tracking-tight">
              Spending Trends
            </h2>
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-purple-300/80 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              <TrendingUp size={11} />
              <span>Current {formatCurrency(monthlyAverage, currencySymbol)}</span>
            </div>
          </div>
          <p className="text-xs text-[#A7A0B5] mt-0.5">
            Overview of monthly spending patterns
          </p>
        </div>

        {/* Segmented Filter */}
        <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
          {(['3M', '6M', '1Y'] as TrendTimeframe[]).map((tf) => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-purple-600/80 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)] border border-purple-400/30'
                    : 'text-[#A7A0B5] hover:text-[#F8F7FC] hover:bg-white/5'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-48 sm:h-56 w-full -ml-3 sm:-ml-2 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
          >
            <defs>
              {/* Purple gradient fill */}
              <linearGradient id="purpleAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.45} />
                <stop offset="50%" stopColor="#A855F7" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>

              {/* Glowing purple filter */}
              <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#A7A0B5', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />

            <YAxis
              hide
              domain={['dataMin - 500', 'dataMax + 400']}
            />

            <Tooltip
              content={<CustomTooltip currencySymbol={currencySymbol} />}
              cursor={{
                stroke: 'rgba(168, 85, 247, 0.35)',
                strokeWidth: 1.5,
                strokeDasharray: '4 4',
              }}
            />

            <Area
              type="monotone"
              dataKey="amount"
              stroke="#A855F7"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#purpleAreaGradient)"
              filter="url(#purpleGlow)"
              activeDot={{
                r: 6,
                fill: '#C084FC',
                stroke: '#07050D',
                strokeWidth: 2,
                className: 'shadow-[0_0_12px_#c084fc]',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
