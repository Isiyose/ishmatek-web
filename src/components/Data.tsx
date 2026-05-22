import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Database, 
  Calendar, 
  Clock, 
  Download, 
  Filter, 
  RefreshCcw,
  ChevronDown,
  ArrowRight,
  LineChart as LineChartIcon,
  Plus,
  Table as TableIcon,
  TrendingUp,
  Activity as ActivityIcon,
  BarChart2,
  FileText,
  PieChart as PieChartIcon,
  ShieldAlert,
  Save,
  Trash2,
  FileDown,
  Printer,
  Mail,
  CheckCircle2
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../lib/i18n';

interface SensorDevice {
  id: string;
  name: string;
  model: string;
  type: string;
  dataSchema: string[];
}

export default function Data() {
  const { language } = useSettings();
  const t = useTranslation(language);

  const [devices, setDevices] = useState<SensorDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'trends' | 'reports'>('table');
  const [dataLimit, setDataLimit] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportArchive = [
    { id: 'REP-001', name: 'Weekly System Performance', type: 'Operational', date: '2024-03-15', status: 'Completed', size: '2.4 MB' },
    { id: 'REP-002', name: 'Security Audit Log Q1', type: 'Security', date: '2024-03-10', status: 'Completed', size: '1.8 MB' },
    { id: 'REP-003', name: 'Maintenance Schedule - Pump A', type: 'Maintenance', date: '2024-03-05', status: 'Archive', size: '940 KB' },
    { id: 'REP-004', name: 'Annual Safety Certification', type: 'Compliance', date: 'Processing', status: 'Under Maintenance', size: 'Calculating...' },
  ];

  // Load devices from localStorage (same as Registry)
  useEffect(() => {
    const saved = localStorage.getItem('nexus_sensors');
    if (saved) {
      try {
        setDevices(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved sensors', e);
      }
    }
  }, []);

  const selectedDevice = useMemo(() => 
    devices.find(d => d.id === selectedDeviceId), 
    [devices, selectedDeviceId]
  );

  // Generate mock historical data based on the schema of the selected device
  const mockData = useMemo(() => {
    if (!selectedDevice || !Array.isArray(selectedDevice.dataSchema)) return [];
    
    const data = [];
    const now = new Date();
    
    // Generate enough data to cover a range if needed
    const count = Math.max(dataLimit, 100); 
    
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now.getTime() - i * 1000 * 60 * 15); // every 15 mins
      const entry: any = {
        id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullTimestamp: timestamp.toLocaleString(),
        rawTimestamp: timestamp.getTime(),
        date: timestamp.toISOString().split('T')[0]
      };
      
      selectedDevice.dataSchema.forEach(field => {
        const f = field.toLowerCase();
        let val = 0;
        // Generate consistent-ish pseudo-random value based on field name and index
        if (f.includes('temp')) val = 22 + Math.sin(i / 5) * 5 + Math.random() * 2;
        else if (f.includes('humidity')) val = 45 + Math.cos(i / 10) * 10 + Math.random() * 5;
        else if (f.includes('pm')) val = Math.random() * (Math.sin(i / 20) > 0 ? 40 : 15);
        else if (f.includes('voltage')) val = 220 + Math.random() * 5;
        else if (f.includes('current')) val = 5 + Math.sin(i / 8) * 3 + Math.random();
        else if (f.includes('power')) val = 300 + Math.sin(i/10) * 100 + Math.random() * 20;
        else if (f.includes('energy')) val = 1500 - i * 0.5;
        else val = 50 + Math.sin(i / 15) * 20 + Math.random() * 10;
        
        entry[field] = Number(val.toFixed(2));
      });
      
      data.push(entry);
    }
    return data;
  }, [selectedDevice, dataLimit]);

  const filteredData = useMemo(() => {
    return mockData.filter(row => {
      // Search query filter
      const matchesSearch = !searchQuery || Object.values(row).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Date range filter
      const rowDate = row.date;
      const matchesStart = !startDate || rowDate >= startDate;
      const matchesEnd = !endDate || rowDate <= endDate;

      return matchesSearch && matchesStart && matchesEnd;
    }).slice(0, dataLimit);
  }, [mockData, searchQuery, startDate, endDate, dataLimit]);

  const stats = useMemo(() => {
    if (!selectedDevice || !filteredData.length) return null;
    
    const results: any = {};
    selectedDevice.dataSchema.forEach(field => {
      const values = filteredData.map(d => Number(d[field])).filter(v => !isNaN(v));
      if (values.length > 0) {
        results[field] = {
          min: Math.min(...values).toFixed(2),
          max: Math.max(...values).toFixed(2),
          avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
        };
      }
    });
    return results;
  }, [selectedDevice, filteredData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleExport = () => {
    if (!selectedDevice || filteredData.length === 0) return;

    const headers = ['Log ID', 'Timestamp', ...selectedDevice.dataSchema];
    const csvRows = [
      headers.join(','),
      ...filteredData.map(row => 
        [row.id, `"${row.timestamp}"`, ...selectedDevice.dataSchema.map(field => row[field])].join(',')
      )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `nexus_data_${selectedDevice.id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full bg-bg-0">
      {/* Header Area */}
      <div className="p-6 border-b border-border-main bg-bg-1/30">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-nexus-blue/10 flex items-center justify-center text-nexus-blue border border-nexus-blue/20 shadow-sm">
              <Database size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-main tracking-tight italic uppercase">Data</h1>
              <p className="text-sm text-text-muted mt-1">Deep dive into sensor telemetry logs and protocol fragments</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center bg-bg-2 border border-border-main rounded-xl p-1 shadow-sm">
                <button 
                  onClick={() => setViewMode('table')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    viewMode === 'table' ? "bg-nexus-blue text-white shadow-md shadow-nexus-blue/20" : "text-text-muted hover:text-text-dim"
                  )}
                >
                  <TableIcon size={14} />
                  Table
                </button>
                <button 
                  onClick={() => setViewMode('trends')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    viewMode === 'trends' ? "bg-nexus-blue text-white shadow-md shadow-nexus-blue/20" : "text-text-muted hover:text-text-dim"
                  )}
                >
                  <TrendingUp size={14} />
                  Trends
                </button>
             </div>
             <button 
               onClick={handleRefresh}
               className={cn(
                 "p-2.5 rounded-xl border border-border-main bg-bg-1 hover:bg-bg-2 transition-all active:scale-95",
                 isRefreshing && "animate-spin text-nexus-blue"
               )}
             >
                <RefreshCcw size={18} />
             </button>
             <button 
               onClick={handleExport}
               disabled={!selectedDeviceId || filteredData.length === 0}
               className="flex items-center gap-2 px-5 py-2.5 bg-nexus-blue text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-nexus-blue/90 shadow-xl shadow-nexus-blue/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <Download size={16} />
                Export CSV
             </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-hidden flex flex-col">
        {/* Selection & Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="relative group">
              <label className="absolute -top-2.5 left-3 px-1 bg-bg-0 text-[9px] font-black uppercase tracking-[2px] text-nexus-blue z-10">Target Device</label>
              <select 
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full bg-bg-1 border-2 border-border-main rounded-2xl px-4 py-3.5 text-sm font-bold text-text-main outline-none focus:border-nexus-blue appearance-none transition-all cursor-pointer shadow-sm"
              >
                <option value="">Select a hardware node...</option>
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-focus-within:text-nexus-blue transition-colors" />
           </div>

           <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                placeholder="Query parameters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-1 border border-border-main rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-nexus-blue focus:ring-4 focus:ring-nexus-blue/5 transition-all shadow-sm font-medium"
              />
           </div>

           <div className="flex gap-2">
              <div className="relative flex-1">
                <label className="absolute -top-2 left-3 px-1 bg-bg-0 text-[8px] font-black uppercase tracking-widest text-text-muted z-10">From</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-bg-1 border border-border-main rounded-2xl px-3 py-3 text-xs font-bold text-text-main outline-none focus:border-nexus-blue transition-all"
                />
              </div>
              <div className="relative flex-1">
                <label className="absolute -top-2 left-3 px-1 bg-bg-0 text-[8px] font-black uppercase tracking-widest text-text-muted z-10">To</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-bg-1 border border-border-main rounded-2xl px-3 py-3 text-xs font-bold text-text-main outline-none focus:border-nexus-blue transition-all"
                />
              </div>
           </div>

           <div className="flex items-center gap-2 bg-bg-1 border border-border-main rounded-2xl px-4 shadow-sm">
              <Filter size={16} className="text-text-muted" />
              <span className="text-xs font-bold text-text-dim uppercase tracking-wider">Depth</span>
              <select 
                value={dataLimit}
                onChange={(e) => setDataLimit(Number(e.target.value))}
                className="bg-transparent text-xs font-black text-nexus-blue outline-none cursor-pointer flex-1"
              >
                 <option value={20}>20 Logs</option>
                 <option value={50}>50 Logs</option>
                 <option value={100}>100 Logs</option>
                 <option value={500}>500 Logs</option>
              </select>
           </div>
        </div>

        {/* Quick Statistics Bar - Only visible if device selected */}
        {selectedDevice && stats && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-4"
          >
            {selectedDevice.dataSchema.slice(0, 4).map(field => (
              <div key={field} className="flex-1 bg-bg-1 border border-border-main p-4 rounded-2xl shadow-sm group hover:border-nexus-blue transition-all">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-nexus-blue">{field}</span>
                   <ActivityIcon size={12} className="text-nexus-blue opacity-50" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                   <div>
                      <div className="text-[8px] font-bold text-text-muted uppercase italic">Avg</div>
                      <div className="text-sm font-black text-text-main">{stats[field]?.avg}</div>
                   </div>
                   <div>
                      <div className="text-[8px] font-bold text-text-muted uppercase italic">Max</div>
                      <div className="text-sm font-black text-nexus-red">{stats[field]?.max}</div>
                   </div>
                   <div>
                      <div className="text-[8px] font-bold text-text-muted uppercase italic">Min</div>
                      <div className="text-sm font-black text-nexus-teal">{stats[field]?.min}</div>
                   </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Dynamic Table/Content Rendering */}
        <div className="flex-1 bg-bg-1 border border-border-main rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
           <AnimatePresence mode="wait">
             {!selectedDevice ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center p-20 text-center"
                >
                   <div className="w-24 h-24 rounded-full bg-bg-2 border-2 border-dashed border-border-main flex items-center justify-center mb-6 relative">
                      <Database size={40} className="text-text-muted opacity-20" />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-nexus-blue flex items-center justify-center text-white border-4 border-bg-1 animate-pulse">
                         <Plus size={16} />
                      </div>
                   </div>
                   <h2 className="text-xl font-black text-text-dim uppercase italic tracking-widest leading-none">Awaiting Hardware Selection</h2>
                   <p className="text-sm text-text-muted max-w-[320px] mt-4 leading-relaxed">
                     Select a provisioned device from the registry to begin exploring the data stream using established protocols.
                   </p>
                   <div className="mt-8 flex items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-2 border border-border-main text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        <ArrowRight size={14} /> Scan Subnet
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-2 border border-border-main text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        <Calendar size={14} /> Date Range
                      </div>
                   </div>
                </motion.div>
             ) : (
                <motion.div 
                  key="data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-hidden flex flex-col"
                >
                   <div className="px-6 py-4 border-b border-border-main bg-bg-0/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-nexus-blue/10 flex items-center justify-center text-nexus-blue border border-nexus-blue/20">
                            <Clock size={16} />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Active Session</span>
                            <span className="text-xs font-bold text-text-main mt-0.5">{selectedDevice.name}</span>
                         </div>
                      </div>
                      <div className="text-[10px] font-mono text-text-muted lowercase tracking-tighter">
                         Established payload mapping: {selectedDevice.dataSchema?.join(' · ') || 'None'}
                      </div>
                   </div>
 
                    <div className="flex-1 overflow-auto scrollbar-thin">
                       {viewMode === 'table' ? (
                         <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-20 bg-bg-2/95 backdrop-blur-md shadow-sm">
                               <tr className="text-[10px] font-black text-text-muted uppercase tracking-[2px]">
                                  <th className="py-4 px-6 border-b border-border-main whitespace-nowrap">Log ID</th>
                                  <th className="py-4 px-6 border-b border-border-main whitespace-nowrap">Timestamp</th>
                                  {selectedDevice.dataSchema?.map(field => (
                                    <th key={field} className="py-4 px-6 border-b border-border-main whitespace-nowrap">
                                      <div className="flex items-center gap-1.5">
                                         <div className="w-1.5 h-1.5 rounded-full bg-nexus-blue" />
                                         {field}
                                      </div>
                                    </th>
                                  ))}
                                  <th className="py-4 px-6 border-b border-border-main text-right">Context</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-border-main/50">
                               {filteredData.map((row) => (
                                 <tr key={row.id} className="group hover:bg-nexus-blue/5 transition-colors font-mono">
                                   <td className="py-4 px-6 text-[11px] text-text-muted group-hover:text-nexus-blue font-bold">{row.id}</td>
                                   <td className="py-4 px-6 text-[11px] text-text-dim whitespace-nowrap" title={row.fullTimestamp}>{row.timestamp}</td>
                                   {selectedDevice.dataSchema?.map(field => (
                                     <td key={field} className="py-4 px-6">
                                        <span className="text-sm font-black text-text-main group-hover:text-nexus-blue transition-colors">{row[field]}</span>
                                     </td>
                                   ))}
                                   <td className="py-4 px-6 text-right">
                                      <button className="p-2 text-text-muted hover:text-text-main hover:bg-bg-3 rounded-lg transition-all opacity-0 group-hover:opacity-100 italic font-black text-[10px] uppercase tracking-widest">
                                         Expand Trace
                                      </button>
                                   </td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                       ) : viewMode === 'trends' ? (
                        <div className="h-full p-8 flex flex-col gap-8">
                           {selectedDevice.dataSchema.slice(0, 2).map((field, fIdx) => (
                              <div key={field} className="flex-1 min-h-[200px] flex flex-col">
                                 <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                       <div className={cn("w-2 h-2 rounded-full", fIdx === 0 ? "bg-nexus-blue" : "bg-nexus-purple")} />
                                       <h3 className="text-xs font-black uppercase tracking-widest text-text-dim">{field} Trendline</h3>
                                    </div>
                                    <div className="text-[10px] font-mono text-text-muted">Real-time normalization active</div>
                                 </div>
                                 <div className="flex-1 w-full bg-bg-2/30 rounded-2xl border border-border-main p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <AreaChart data={[...filteredData].reverse()}>
                                          <defs>
                                             <linearGradient id={`color-${field}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={fIdx === 0 ? "#3b82f6" : "#a855f7"} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={fIdx === 0 ? "#3b82f6" : "#a855f7"} stopOpacity={0}/>
                                             </linearGradient>
                                          </defs>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                          <XAxis 
                                            dataKey="timestamp" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 9, fill: '#666' }}
                                            interval={Math.ceil(filteredData.length / 8)}
                                          />
                                          <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 9, fill: '#666' }}
                                          />
                                          <Tooltip 
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '10px' }}
                                            itemStyle={{ color: '#fff' }}
                                          />
                                          <Area 
                                            type="monotone" 
                                            dataKey={field} 
                                            stroke={fIdx === 0 ? "#3b82f6" : "#a855f7"} 
                                            fillOpacity={1} 
                                            fill={`url(#color-${field})`} 
                                            strokeWidth={2}
                                          />
                                       </AreaChart>
                                    </ResponsiveContainer>
                                 </div>
                              </div>
                           ))}
                        </div>
                      ) : (
                        /* Reports Mode */
                        <div className="h-full bg-bg-2/20 p-8 flex flex-col gap-8 overflow-y-auto scrollbar-thin">
                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              <div className="lg:col-span-2 space-y-6">
                                 <div className="bg-bg-1 border border-border-main rounded-3xl p-8 shadow-sm">
                                    <div className="flex items-center gap-4 mb-8">
                                       <div className="w-12 h-12 rounded-2xl bg-nexus-blue/10 flex items-center justify-center text-nexus-blue border border-nexus-blue/20">
                                          <FileText size={24} />
                                       </div>
                                       <div>
                                          <h3 className="text-xl font-black uppercase italic tracking-widest text-text-main">Intelligent Report Catalyst</h3>
                                          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Cross-reference telemetry to generate verified insights</p>
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                       <div className="space-y-4">
                                          <label className="text-[9px] font-black uppercase tracking-[2px] text-text-muted ml-2">Analytics Profile</label>
                                          <div className="grid grid-cols-1 gap-2">
                                             {['Operational Summary', 'Security Audit', 'Compliance Verification', 'Maintenance Prediction'].map((type) => (
                                                <button key={type} className="flex items-center justify-between p-4 bg-bg-2/50 border border-border-main rounded-2xl hover:border-nexus-blue group transition-all text-left">
                                                   <span className="text-xs font-bold text-text-dim group-hover:text-nexus-blue">{type}</span>
                                                   <Plus size={14} className="text-text-muted" />
                                                </button>
                                             ))}
                                          </div>

                                          {/* Maintenance Specific Quick Look */}
                                          <div className="p-5 bg-bg-2/50 border border-border-main rounded-3xl mt-4">
                                             <div className="flex items-center gap-2 mb-4">
                                                <ShieldAlert size={14} className="text-nexus-red" />
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-main">Maintenance Queue</h4>
                                             </div>
                                             <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                   <span className="text-[10px] text-text-muted font-bold uppercase">Node W-05</span>
                                                   <span className="text-[9px] font-black text-nexus-red px-1.5 py-0.5 bg-nexus-red/10 rounded uppercase">Critical Service</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                   <span className="text-[10px] text-text-muted font-bold uppercase">Pump Array A</span>
                                                   <span className="text-[9px] font-black text-nexus-amber px-1.5 py-0.5 bg-nexus-amber/10 rounded uppercase">Due in 4d</span>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                       <div className="space-y-4">
                                          <div className="p-6 bg-nexus-blue/5 border border-nexus-blue/20 rounded-3xl">
                                             <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-blue mb-4">Export Configuration</h4>
                                             <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                   <span className="text-[11px] font-bold text-text-dim">Include Charts</span>
                                                   <div className="w-8 h-4 bg-nexus-blue rounded-full relative"><div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full transition-all"/></div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                   <span className="text-[11px] font-bold text-text-dim">Raw Data Appendix</span>
                                                   <div className="w-8 h-4 bg-bg-3 rounded-full relative"><div className="absolute left-1 top-1 w-2 h-2 bg-text-muted rounded-full transition-all"/></div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                   <span className="text-[11px] font-bold text-text-dim">Multi-node Comparison</span>
                                                   <div className="w-8 h-4 bg-nexus-blue rounded-full relative"><div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full transition-all"/></div>
                                                </div>
                                             </div>
                                          </div>
                                          <button 
                                            onClick={() => {
                                              setIsGenerating(true);
                                              setTimeout(() => setIsGenerating(false), 2000);
                                            }}
                                            disabled={isGenerating}
                                            className="w-full py-4 bg-text-main text-bg-1 rounded-2xl flex items-center justify-center gap-3 hover:bg-nexus-blue hover:text-white transition-all group overflow-hidden relative"
                                          >
                                             {isGenerating ? (
                                                <>
                                                   <RefreshCcw size={18} className="animate-spin" />
                                                   <span className="text-[11px] font-black uppercase tracking-[3px]">Generating Payload...</span>
                                                </>
                                             ) : (
                                                <>
                                                   <TrendingUp size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                                   <span className="text-[11px] font-black uppercase tracking-[3px]">Assemble Report Now</span>
                                                </>
                                             )}
                                          </button>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Report Preview Card */}
                                 <div className="bg-bg-1 border border-border-main rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                       <Database size={120} />
                                    </div>
                                    <div className="flex items-center justify-between mb-8">
                                       <div>
                                          <div className="flex items-center gap-2 mb-1">
                                             <div className="w-2 h-2 rounded-full bg-nexus-teal animate-pulse" />
                                             <span className="text-[10px] font-black text-nexus-teal uppercase tracking-widest">Active Analysis</span>
                                          </div>
                                          <h3 className="text-2xl font-black text-text-main italic">SYSMON-2024-OPERATIONAL</h3>
                                       </div>
                                       <div className="flex items-center gap-2">
                                          <button className="p-2.5 rounded-xl border border-border-main hover:bg-bg-2 transition-all"><Printer size={16} /></button>
                                          <button className="p-2.5 rounded-xl border border-border-main hover:bg-bg-2 transition-all"><FileDown size={16} /></button>
                                          <button className="p-2.5 rounded-xl border border-border-main hover:bg-bg-2 transition-all"><Mail size={16} /></button>
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                       <div className="p-5 bg-bg-2/30 rounded-2xl border border-border-main">
                                          <div className="text-[9px] font-black text-text-muted uppercase mb-2">Efficiency Rating</div>
                                          <div className="text-2xl font-black text-nexus-teal italic">98.2%</div>
                                          <div className="mt-2 h-1 bg-bg-3 rounded-full overflow-hidden">
                                             <div className="h-full bg-nexus-teal w-[98.2%]" />
                                          </div>
                                       </div>
                                       <div className="p-5 bg-bg-2/30 rounded-2xl border border-border-main">
                                          <div className="text-[9px] font-black text-text-muted uppercase mb-2">Anomaly Count</div>
                                          <div className="text-2xl font-black text-nexus-red italic">04</div>
                                          <div className="mt-2 text-[9px] font-bold text-text-muted uppercase italic">Handled Automatically</div>
                                       </div>
                                       <div className="p-5 bg-bg-2/30 rounded-2xl border border-border-main">
                                          <div className="text-[9px] font-black text-text-muted uppercase mb-2">Confidence Level</div>
                                          <div className="text-2xl font-black text-nexus-blue italic truncate">ISO-99.1</div>
                                          <div className="mt-2 flex items-center gap-1">
                                             <CheckCircle2 size={10} className="text-nexus-blue" />
                                             <span className="text-[9px] font-bold text-text-muted uppercase">Certified Data</span>
                                          </div>
                                       </div>
                                    </div>

                                    <div className="h-48 w-full bg-bg-2/20 border-border-main border rounded-2xl p-4">
                                       <ResponsiveContainer width="100%" height="100%">
                                          <BarChart data={[
                                             { name: 'Stability', val: 95 },
                                             { name: 'Safety', val: 100 },
                                             { name: 'Efficiency', val: 88 },
                                             { name: 'Uptime', val: 99 },
                                             { name: 'Throughput', val: 92 },
                                          ]}>
                                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#666' }} />
                                             <YAxis hide />
                                             <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#000', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                                             <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                                {[95, 100, 88, 99, 92].map((v, i) => (
                                                   <Cell key={i} fill={v > 90 ? '#2dd4bf' : '#3b82f6'} />
                                                ))}
                                             </Bar>
                                          </BarChart>
                                       </ResponsiveContainer>
                                    </div>
                                 </div>
                              </div>

                              <div className="space-y-8">
                                 {/* Scheduled Reports */}
                                 <div className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                       <div className="flex items-center gap-2">
                                          <Clock size={16} className="text-nexus-amber" />
                                          <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Automated Logic</h3>
                                       </div>
                                       <Plus size={16} className="text-nexus-blue cursor-pointer" />
                                    </div>
                                    <div className="space-y-3">
                                       {[
                                          { name: 'Daily Pulse', schedule: 'At 00:00 UTC', active: true },
                                          { name: 'Security Scrub', schedule: 'Sundays at 22:00', active: true },
                                          { name: 'Maintenance Sync', schedule: 'Monthly (1st)', active: false },
                                       ].map((sched) => (
                                          <div key={sched.name} className="p-4 bg-bg-2 border border-border-main rounded-2xl">
                                             <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-black text-text-main">{sched.name}</span>
                                                <div className={cn("w-2 h-2 rounded-full", sched.active ? "bg-nexus-teal" : "bg-text-muted")} />
                                             </div>
                                             <div className="text-[10px] text-text-muted font-bold italic">{sched.schedule}</div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>

                                 {/* Report History Archive */}
                                 <div className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm flex flex-col h-[400px]">
                                    <div className="flex items-center justify-between mb-6">
                                       <div className="flex items-center gap-2">
                                          <FileText size={16} className="text-nexus-blue" />
                                          <h3 className="text-xs font-black uppercase tracking-widest text-text-main">Report Archive</h3>
                                       </div>
                                       <Search size={14} className="text-text-muted" />
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                                       {reportArchive.map(report => (
                                          <div key={report.id} className="p-4 bg-bg-2 border border-border-main rounded-2xl group hover:border-nexus-blue transition-all cursor-pointer">
                                             <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-black text-text-muted font-mono">{report.id}</span>
                                                <span className={cn(
                                                  "text-[10px] font-black uppercase italic",
                                                  report.status === 'Under Maintenance' ? "text-nexus-amber animate-pulse" : "text-nexus-blue"
                                                )}>
                                                  {report.status === 'Under Maintenance' ? 'Under Maintenance' : report.size}
                                                </span>
                                             </div>
                                             <div className="text-xs font-black text-text-main mb-1 truncate">{report.name}</div>
                                             <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-2">
                                                   <Calendar size={10} className="text-text-muted" />
                                                   <span className="text-[9px] font-bold text-text-muted">{report.date}</span>
                                                </div>
                                                <div className="w-6 h-6 rounded-lg bg-bg-3 flex items-center justify-center text-text-muted group-hover:bg-nexus-blue group-hover:text-white transition-all">
                                                   <Download size={12} />
                                                </div>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                    <button className="w-full mt-6 py-3 border border-dashed border-border-main rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-nexus-blue hover:border-nexus-blue transition-all">
                                       Sync With External Drive
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                      )}
                      
                      {filteredData.length === 0 && viewMode !== 'reports' && (

                        <div className="py-20 flex flex-col items-center justify-center text-text-muted">
                           <RefreshCcw size={32} className="opacity-10 mb-4" />
                           <p className="text-sm italic font-bold">No data matches your active query profile.</p>
                        </div>
                      )}
                   </div>

                   <div className="px-6 py-3 border-t border-border-main bg-bg-2/30 flex items-center justify-between">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Streaming active (Buffer: {filteredData.length} records)</span>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-nexus-teal" />
                            <span className="text-[10px] font-bold text-nexus-teal">HEALTHY</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-nexus-purple animate-pulse" />
                            <span className="text-[10px] font-bold text-nexus-purple uppercase">Parsing JSON...</span>
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
