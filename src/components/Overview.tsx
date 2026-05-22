import { useMemo, useState } from 'react';
import { 
  Droplets, 
  Thermometer, 
  Wind, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreVertical,
  ChevronRight,
  Shield,
  Layers,
  Cpu
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { DashboardState } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../lib/i18n';

interface KpiCardProps {
  label: string;
  value: string;
  unit: string;
  icon: any;
  trend: string;
  trendDir: 'up' | 'down' | 'stable';
  color: string;
  history: number[];
  status: string;
  t: (k: string) => string;
}

const KpiCard = ({ label, value, unit, icon: Icon, trend, trendDir, color, history, status, t }: KpiCardProps) => {
  const chartData = useMemo(() => history.map((v) => ({ val: v })), [history]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-1 border border-border-main rounded-2xl p-4 relative overflow-hidden group hover:border-nexus-blue/40 transition-all duration-300"
    >
      <div className={cn("absolute top-0 left-0 bottom-0 w-1", color)} />
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
           <div className={cn(
             "w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:rotate-12",
             color.replace('bg-', 'bg-') + '/10',
             color.replace('bg-', 'text-')
           )}>
             <Icon size={18} />
           </div>
           <div>
              <div className="text-[10px] font-black text-text-muted uppercase tracking-[2px]">{label}</div>
              <div className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded-sm mt-0.5 inline-block",
                status === 'Normal' ? "bg-nexus-teal/10 text-nexus-teal" : 
                status === 'Watch' ? "bg-nexus-amber/10 text-nexus-amber" : 
                "bg-nexus-red/10 text-nexus-red"
              )}>
                {t(status.toLowerCase())}
              </div>
           </div>
        </div>
      </div>
      
      <div className="flex items-baseline gap-1.5 mt-2">
        <span className="text-3xl font-black text-text-main tabular-nums italic">{value}</span>
        <span className="text-xs text-text-muted font-bold tracking-widest">{unit}</span>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className={cn(
          "text-[11px] font-black flex items-center gap-1",
          trendDir === 'up' ? "text-nexus-red" : trendDir === 'down' ? "text-nexus-teal" : "text-text-muted"
        )}>
          {trendDir === 'up' ? <ArrowUpRight size={12} /> : trendDir === 'down' ? <ArrowDownLeft size={12} /> : null}
          {trend}
          <span className="text-[9px] font-bold text-text-muted ml-1 italic opacity-60">LP</span>
        </div>
        
        <div className="w-16 h-6 opacity-40 group-hover:opacity-80 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="val" 
                stroke={color.includes('blue') ? '#3b82f6' : color.includes('amber') ? '#f59e0b' : color.includes('teal') ? '#10b981' : '#8b5cf6'} 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default function Overview({ state }: { state: DashboardState }) {
  const { language, theme } = useSettings();
  const t = useTranslation(language);

  // Transformation for main trend chart
  const combinedHistory = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      index: i,
      water: state.water.history[i] || null,
      power: (state.power.history[i] || 0) / 10,
      temp: state.temp.history[i] || null,
      air: (state.air.history[i] || 0) / 50,
    }));
  }, [state]);

  const zoneData = [
    { name: 'Zone A', value: 112, status: 'Overload' },
    { name: 'Zone B', value: 87, status: 'Normal' },
    { name: 'Zone C', value: 64, status: 'Optimal' },
    { name: 'Lab D', value: 42, status: 'Minimal' },
    { name: 'Office E', value: 78, status: 'Stable' },
    { name: 'Server F', value: 96, status: 'High' },
  ];

  const tooltipStyle = { 
    backgroundColor: '#0a0f1d', 
    border: '1px solid #1e2642', 
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    fontSize: '11px', 
    color: '#e2e8f5' 
  };

  const [activeTab, setActiveTab] = useState<'trends' | 'performance'>('trends');

  return (
    <div className="p-6 flex flex-col gap-6 animate-in fade-in duration-700 overflow-y-auto h-full scrollbar-thin">
      
      {/* Header Summary Bar */}
      <div className="bg-bg-1/50 border border-border-main rounded-2xl p-4 flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-nexus-blue/10 flex items-center justify-center text-nexus-blue border border-nexus-blue/20">
              <Activity size={24} />
           </div>
           <div>
              <h2 className="text-sm font-black text-text-main uppercase tracking-[3px] italic">Operational Overview</h2>
              <div className="flex items-center gap-3 mt-1.5">
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-nexus-teal animate-pulse" />
                    <span className="text-[10px] font-bold text-text-muted uppercase">System Nominal</span>
                 </div>
                 <span className="text-border-main">|</span>
                 <div className="text-[10px] font-bold text-text-muted uppercase">1248 Nodes Online</div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="text-right">
              <div className="text-[10px] font-black text-text-muted uppercase mb-0.5">Efficiency Score</div>
              <div className="text-xl font-black text-nexus-teal italic">98.4%</div>
           </div>
           <div className="text-right">
              <div className="text-[10px] font-black text-text-muted uppercase mb-0.5">Active Alerts</div>
              <div className="text-xl font-black text-nexus-red italic">03</div>
           </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          label={t('waterFlow')}
          value={state.water.value.toFixed(1)}
          unit="L/min"
          icon={Droplets}
          trend="3.2%"
          trendDir="down"
          color="bg-nexus-blue"
          history={state.water.history}
          status="Normal"
          t={t}
        />
        <KpiCard 
          label={t('temperature')}
          value={state.temp.value.toFixed(1)}
          unit="°C"
          icon={Thermometer}
          trend="1.4%"
          trendDir="up"
          color="bg-nexus-amber"
          history={state.temp.history}
          status="Watch"
          t={t}
        />
        <KpiCard 
          label={t('airQuality')}
          value={Math.round(state.air.value).toString()}
          unit="ppm"
          icon={Wind}
          trend="5.8%"
          trendDir="up"
          color="bg-nexus-teal"
          history={state.air.history}
          status="Normal"
          t={t}
        />
        <KpiCard 
          label={t('powerDemand')}
          value={Math.round(state.power.value).toString()}
          unit="kW"
          icon={Zap}
          trend="2.1%"
          trendDir="down"
          color="bg-nexus-purple"
          history={state.power.history}
          status="Normal"
          t={t}
        />
      </div>

      {/* Main Charts & Side Panel Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Large Chart Container */}
        <div className="xl:col-span-3 bg-bg-1 border border-border-main rounded-3xl overflow-hidden flex flex-col shadow-sm transition-all hover:shadow-xl hover:shadow-nexus-blue/5">
          <div className="p-6 border-b border-border-main flex items-center justify-between bg-bg-1/30">
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-xl bg-bg-2 border border-border-main">
                  <Layers size={18} className="text-nexus-blue" />
               </div>
               <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Telemetry Analysis</h3>
                  <div className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-wider">Multi-vector streaming data</div>
               </div>
            </div>
            
            <div className="flex items-center p-1 bg-bg-2 border border-border-main rounded-xl">
               <button 
                 onClick={() => setActiveTab('trends')}
                 className={cn(
                   "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                   activeTab === 'trends' ? "bg-nexus-blue text-white shadow-lg shadow-nexus-blue/20" : "text-text-muted hover:text-text-main"
                 )}
               >
                 Trends
               </button>
               <button 
                 onClick={() => setActiveTab('performance')}
                 className={cn(
                   "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                   activeTab === 'performance' ? "bg-nexus-blue text-white shadow-lg shadow-nexus-blue/20" : "text-text-muted hover:text-text-main"
                 )}
               >
                 Efficiency
               </button>
            </div>
          </div>

          <div className="p-6 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedHistory}>
                <defs>
                  <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2642" opacity={0.3} />
                <XAxis hide />
                <YAxis width={35} fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#4a5980', fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  itemStyle={{ padding: 0 }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWater)" isAnimationActive={false} />
                <Area type="monotone" dataKey="power" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPower)" isAnimationActive={false} strokeDasharray="6 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-0 divide-x divide-border-main border-t border-border-main bg-bg-1/10">
            {[
              { l: 'Water Avg', v: state.water.value.toFixed(1), u: 'L/min', c: 'text-nexus-blue' },
              { l: 'Water Peak', v: '72.4', u: 'L/min', c: 'text-nexus-cyan' },
              { l: 'Power Load', v: Math.round(state.power.value), u: 'kW', c: 'text-nexus-purple' },
              { l: 'Power Peak', v: '540', u: 'kW', c: 'text-nexus-red' },
            ].map((s, i) => (
              <div key={i} className="p-4 text-center group hover:bg-bg-2 transition-colors cursor-default">
                 <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">{s.l}</div>
                 <div className="flex items-baseline justify-center gap-1">
                    <span className={cn("text-xl font-black italic", s.c)}>{s.v}</span>
                    <span className="text-[10px] font-bold text-text-muted">{s.u}</span>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel: Active Alerts Table-like list */}
        <div className="bg-bg-1 border border-border-main rounded-3xl flex flex-col shadow-sm h-full">
           <div className="p-6 border-b border-border-main bg-bg-1/30">
              <h3 className="text-sm font-black uppercase tracking-widest text-text-main flex items-center justify-between">
                 Critical Feed
                 <span className="text-[10px] bg-nexus-red/10 text-nexus-red px-2 py-0.5 rounded-full border border-nexus-red/20 shadow-sm">03 Open</span>
              </h3>
           </div>
           <div className="flex-1 overflow-y-auto divide-y divide-border-main scrollbar-thin">
              {[
                { id: 'AQ-08', sev: 'crit', label: 'CO₂ Spike', time: '09:42', node: 'Lab C' },
                { id: 'T-14', sev: 'warn', label: 'Overheat', time: '09:38', node: 'Srv Rm' },
                { id: 'W-05', sev: 'info', label: 'Latent', time: '09:35', node: 'Node 05' }
              ].map((alert) => (
                <div key={alert.id} className="p-5 hover:bg-bg-2 group transition-all cursor-pointer">
                   <div className="flex items-start justify-between mb-3">
                      <div className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm",
                        alert.sev === 'crit' ? "bg-nexus-red text-white" : alert.sev === 'warn' ? "bg-nexus-amber text-white" : "bg-nexus-blue text-white"
                      )}>
                         {alert.label}
                      </div>
                      <span className="text-[10px] font-mono text-text-muted">{alert.time}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div>
                         <div className="text-xs font-bold text-text-main group-hover:text-nexus-blue transition-colors">{alert.node} telemetry anomaly</div>
                         <div className="text-[10px] font-mono text-text-muted mt-1">UUID: {alert.id}</div>
                      </div>
                      <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                   </div>
                </div>
              ))}
           </div>
           <button className="p-4 text-[10px] font-black uppercase tracking-widest text-nexus-blue hover:bg-bg-2 border-t border-border-main transition-colors">
              Access Alert Console →
           </button>
        </div>
      </div>

      {/* Bottom Grid: Inventory Table & Performance Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Node Inventory Table */}
        <div className="bg-bg-1 border border-border-main rounded-3xl overflow-hidden flex flex-col shadow-sm">
           <div className="p-6 border-b border-border-main flex items-center justify-between bg-bg-1/30">
              <div className="flex items-center gap-3">
                 <Cpu size={18} className="text-nexus-teal" />
                 <h3 className="text-sm font-black uppercase tracking-widest text-text-main italic">Active Node Registry</h3>
              </div>
              <button className="text-[10px] font-black text-nexus-blue uppercase border-b border-nexus-blue/30 pb-0.5">Filter Units</button>
           </div>
           <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-bg-2/50">
                    <tr className="text-[9px] font-black text-text-muted uppercase tracking-[2px]">
                       <th className="py-4 px-6 border-b border-border-main">Terminal ID</th>
                       <th className="py-4 px-6 border-b border-border-main">Type</th>
                       <th className="py-4 px-6 border-b border-border-main">Status</th>
                       <th className="py-4 px-6 border-b border-border-main text-right">Uptime</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border-main/50">
                    {[
                      { id: 'W-01', type: 'Flow Sensor', status: 'Optimal', uptime: '124d' },
                      { id: 'T-10', type: 'Thermal', status: 'Stable', uptime: '89d' },
                      { id: 'AQ-05', type: 'AQI Node', status: 'Degraded', uptime: '15d' },
                      { id: 'P-01', type: 'Load Balancer', status: 'Optimal', uptime: '231d' },
                      { id: 'T-14', type: 'Thermal', status: 'Warning', uptime: '4d' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-bg-2/30 transition-colors group">
                         <td className="py-3 px-6 text-xs font-black text-text-main font-mono italic">{row.id}</td>
                         <td className="py-3 px-6 text-[11px] text-text-dim font-bold">{row.type}</td>
                         <td className="py-3 px-6">
                            <span className={cn(
                              "text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest border",
                              row.status === 'Optimal' ? "bg-nexus-teal/10 text-nexus-teal border-nexus-teal/20" : 
                              row.status === 'Degraded' ? "bg-nexus-amber/10 text-nexus-amber border-nexus-amber/20" : 
                              row.status === 'Warning' ? "bg-nexus-red/10 text-nexus-red border-nexus-red/20" :
                              "bg-bg-3 text-text-muted border-border-main"
                            )}>
                               {row.status}
                            </span>
                         </td>
                         <td className="py-3 px-6 text-right text-[10px] font-mono text-text-muted font-bold">{row.uptime}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <div className="p-4 bg-bg-2/30 text-[10px] italic text-text-muted text-center border-t border-border-main uppercase tracking-widest font-black">
              Total Managed Nodes: 124 units
           </div>
        </div>

        {/* Power Distribution Bar Chart */}
        <div className="bg-bg-1 border border-border-main rounded-3xl overflow-hidden flex flex-col shadow-sm">
           <div className="p-6 border-b border-border-main flex items-center justify-between bg-bg-1/30">
              <div className="flex items-center gap-3">
                 <Zap size={18} className="text-nexus-amber" />
                 <h3 className="text-sm font-black uppercase tracking-widest text-text-main italic">Load Distribution</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-nexus-teal bg-nexus-teal/10 px-2.5 py-1 rounded-full border border-nexus-teal/15">
                <span className="w-1.5 h-1.5 rounded-full bg-nexus-teal animate-pulse" /> SYNCED
              </div>
           </div>
           <div className="p-6 flex-1 min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={zoneData} barGap={0}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2642" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={10} stroke="#4a5980" axisLine={false} tickLine={false} tick={{fill: '#4a5980', fontWeight: 'bold'}} />
                    <YAxis fontSize={10} stroke="#4a5980" axisLine={false} tickLine={false} tick={{fill: '#4a5980', fontWeight: 'bold'}} width={30} />
                    <Tooltip 
                       cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                       contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {zoneData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.value > 100 ? '#ef4444' : entry.value > 80 ? '#f59e0b' : '#3b82f6'} 
                          fillOpacity={0.8}
                        />
                      ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="grid grid-cols-2 p-4 border-t border-border-main bg-bg-1/20 divide-x divide-border-main">
              <div className="px-4">
                 <div className="text-[9px] font-black text-text-muted uppercase tracking-[2px] mb-1">Peak Demand Zone</div>
                 <div className="text-xs font-bold text-text-main uppercase">Zone A (112.4 kW)</div>
              </div>
              <div className="px-4 text-right">
                 <div className="text-[9px] font-black text-text-muted uppercase tracking-[2px] mb-1">Status Recommendation</div>
                 <div className="text-xs font-bold text-nexus-amber uppercase">Initiate Load Balancing</div>
              </div>
           </div>
        </div>

      </div>

      {/* Audit & Compliance Footer Section */}
      <div className="bg-bg-2 border border-border-main rounded-2xl p-5 flex flex-wrap items-center justify-between gap-6">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <Shield size={20} className="text-nexus-teal" />
               <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-text-main">Audit Protocol Active</div>
                  <div className="text-[9px] text-text-muted font-mono italic">Signature: 0x884FC...11A</div>
               </div>
            </div>
            <div className="h-8 w-px bg-border-main hidden sm:block" />
            <div className="flex items-center gap-3">
               <CheckCircle2 size={20} className="text-nexus-blue" />
               <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-text-main">Regulatory Compliance</div>
                  <div className="text-[9px] text-text-muted font-bold">Standard ISO-27001-NI</div>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <Clock size={14} className="text-text-muted" />
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Last Backup: 12 minutes ago</span>
         </div>
      </div>
    </div>
  );
}

