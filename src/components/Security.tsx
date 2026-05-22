import { useState, useMemo } from 'react';
import { 
  Shield, 
  Monitor, 
  Activity, 
  Key, 
  MapPin, 
  Smartphone, 
  Globe, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Clock, 
  Eye, 
  MoreVertical,
  Zap,
  Server,
  Fingerprint,
  Bluetooth,
  Wifi,
  Cpu,
  ShieldOff,
  UserX,
  History,
  Settings as SettingsIcon,
  ChevronRight,
  Slash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell as ReCell
} from 'recharts';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../lib/i18n';

interface Session {
  id: string;
  device: string;
  os: string;
  browser: string;
  ip: string;
  location: string;
  isCurrent: boolean;
  lastActive: string;
}

interface AuditLog {
  id: string;
  event: string;
  user: string;
  status: 'success' | 'failed' | 'warning';
  time: string;
  details: string;
}

export default function Security() {
  const { language } = useSettings();
  const t = useTranslation(language);

  const sessions: Session[] = [
    { id: '1', device: 'MacBook Pro 16"', os: 'macOS 14.2', browser: 'Chrome 121', ip: '197.243.12.55', location: 'Kigali, Rwanda', isCurrent: true, lastActive: 'Active now' },
    { id: '2', device: 'iPhone 15 Pro', os: 'iOS 17.1', browser: 'Safari Mobile', ip: '197.243.12.55', location: 'Kigali, Rwanda', isCurrent: false, lastActive: '2 hours ago' },
    { id: '3', device: 'Workstation X', os: 'Windows 11', browser: 'Edge 120', ip: '41.216.115.3', location: 'Nairobi, Kenya', isCurrent: false, lastActive: '1 day ago' },
  ];

  const auditLogs: AuditLog[] = [
    { id: '101', event: 'Super Admin Login', user: 'admin@ishmatek.rw', status: 'success', time: '2024-03-21 09:12:04', details: 'Successful login from trusted device' },
    { id: '102', event: 'Failed API Access', user: 'ESP32-NODE-04', status: 'failed', time: '2024-03-21 08:45:12', details: 'Expired MQTT token used' },
    { id: '103', event: '2FA Enabled', user: 'engineer_01', status: 'success', time: '2024-03-20 16:22:00', details: 'Authenticator app linked' },
    { id: '104', event: 'Unusual Login Attempt', user: 'admin@ishmatek.rw', status: 'warning', time: '2024-03-20 14:10:55', details: 'Login attempt from untrusted IP in Russia' },
    { id: '105', event: 'Firmware Update', user: 'System', status: 'success', time: '2024-03-20 10:00:00', details: 'Signed OTA build v3.2.1 installed' },
  ];

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'sessions' | 'audit' | 'config'>('overview');
  const [sessionList, setSessionList] = useState<Session[]>(sessions);
  const [blockedEntities, setBlockedEntities] = useState<{id: string, ip: string, device: string, type: 'IP' | 'Device'}[]>([]);
  const [watchList, setWatchList] = useState<{id: string, ip: string, device: string, lastSeen?: string}[]>([]);
  const [securityNotifications, setSecurityNotifications] = useState<{id: string, message: string, type: 'alert' | 'watch'}[]>([]);

  // Detect current session info
  const currentSessionInfo = useMemo(() => {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    return { browser, os };
  }, []);

  const securityScore = 94;
  const threatLevel = 6; // 0-100

  // Mock heatmap data (4 weeks x 7 days)
  const heatmapData = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      day: i,
      intensity: Math.floor(Math.random() * 5), // 0 to 4
      date: new Date(Date.now() - (27 - i) * 24 * 60 * 60 * 1000).toLocaleDateString()
    }));
  }, []);

  const handleKillSession = (id: string, block: boolean = false) => {
    const sessionToKill = sessionList.find(s => s.id === id);
    if (block && sessionToKill) {
      setBlockedEntities(prev => [...prev, { 
        id: Math.random().toString(36).substr(2, 9), 
        ip: sessionToKill.ip, 
        device: sessionToKill.device,
        type: 'IP' 
      }]);
    }
    setSessionList(prev => prev.filter(s => s.id !== id));
  };

  const scoreData = [
    { name: 'Secure', value: securityScore, color: '#3b82f6' },
    { name: 'At Risk', value: 100 - securityScore, color: '#1e293b' },
  ];

  const apiUsageData = [
    { time: '08:00', calls: 1200 },
    { time: '10:00', calls: 2100 },
    { time: '12:00', calls: 1800 },
    { time: '14:00', calls: 3500 },
    { time: '16:00', calls: 2900 },
    { time: '18:00', calls: 1500 },
  ];

  return (
    <div className="flex flex-col h-full bg-bg-0">
      {/* Header Area */}
      <div className="p-6 border-b border-border-main bg-bg-1/30">
        <AnimatePresence>
           {securityNotifications.length > 0 && (
             <div className="mb-6 space-y-2">
                {securityNotifications.map(notif => (
                  <motion.div 
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={cn(
                      "p-3 rounded-xl border flex items-center justify-between shadow-sm",
                      notif.type === 'watch' ? "bg-nexus-blue/10 border-nexus-blue/20 text-nexus-blue" : "bg-nexus-red/10 border-nexus-red/20 text-nexus-red"
                    )}
                  >
                     <div className="flex items-center gap-3">
                        {notif.type === 'watch' ? <Eye size={16} /> : <AlertTriangle size={16} />}
                        <span className="text-xs font-bold uppercase tracking-widest leading-none">{notif.message}</span>
                     </div>
                     <button 
                       onClick={() => setSecurityNotifications(prev => prev.filter(n => n.id !== notif.id))}
                       className="p-1 hover:bg-bg-1 rounded-md transition-colors"
                     >
                        <Trash2 size={12} />
                     </button>
                  </motion.div>
                ))}
             </div>
           )}
        </AnimatePresence>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-nexus-red/10 flex items-center justify-center text-nexus-red border border-nexus-red/20 shadow-sm relative overflow-hidden">
              <Shield size={24} className="z-10" />
              <div className="absolute inset-0 bg-linear-to-tr from-nexus-red/5 to-transparent animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-main tracking-tight italic uppercase">Security Center</h1>
              <p className="text-sm text-text-muted mt-1">Industrial-grade protection for nodes, infrastructure, and access control</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 bg-bg-2 border border-border-main rounded-xl">
            {(['overview', 'sessions', 'audit', 'config'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                  activeSubTab === tab 
                    ? "bg-nexus-blue text-white shadow-lg shadow-nexus-blue/20" 
                    : "text-text-muted hover:text-text-main"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <AnimatePresence mode="wait">
          {activeSubTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Top Row: Gauges and Meters */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Security Score Gauge */}
                <div className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm relative overflow-hidden">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">Security Integrity</h3>
                      <CheckCircle2 size={16} className="text-nexus-teal" />
                   </div>
                   <div className="h-48 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                               data={scoreData}
                               cx="50%"
                               cy="80%"
                               startAngle={180}
                               endAngle={0}
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={0}
                               dataKey="value"
                            >
                               {scoreData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                            </Pie>
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[-10%] text-center">
                         <div className="text-4xl font-black text-text-main italic">{securityScore}%</div>
                         <div className="text-[10px] font-bold text-nexus-blue uppercase tracking-widest">Optimized</div>
                      </div>
                   </div>
                   <div className="mt-4 p-3 bg-bg-2 rounded-xl border border-border-main">
                      <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Recommended Action</div>
                      <div className="text-xs text-text-dim">Update rotating MQTT keys for 3 older gateway nodes.</div>
                   </div>
                </div>

                {/* Threat Level Meter */}
                <div className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm flex flex-col">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">Risk Surface</h3>
                      <AlertTriangle size={16} className="text-nexus-red" />
                   </div>
                   <div className="flex-1 flex flex-col justify-center items-center gap-4">
                      <div className="w-full h-4 bg-bg-2 rounded-full overflow-hidden border border-border-main relative p-0.5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${threatLevel}%` }}
                           className={cn(
                             "h-full rounded-full shadow-lg",
                             threatLevel < 20 ? "bg-nexus-teal" : threatLevel < 50 ? "bg-nexus-amber" : "bg-nexus-red"
                           )}
                         />
                      </div>
                      <div className="text-5xl font-black text-text-main italic uppercase leading-none">Low</div>
                      <div className="text-xs text-text-muted font-medium text-center">Active defense systems are successfully mitigating 12 known threat vectors.</div>
                   </div>
                   <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="p-3 bg-nexus-red/5 border border-nexus-red/10 rounded-xl">
                         <div className="text-[10px] font-black text-nexus-red uppercase">Attacks Blocked</div>
                         <div className="text-xl font-bold text-text-main">1.2k</div>
                      </div>
                      <div className="p-3 bg-nexus-teal/5 border border-nexus-teal/10 rounded-xl">
                         <div className="text-[10px] font-black text-nexus-teal uppercase">Safe Logins</div>
                         <div className="text-xl font-bold text-text-main">459</div>
                      </div>
                   </div>
                </div>

                {/* Global Threat Map */}
                <div className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">Global Threat Surface</h3>
                      <Globe size={16} className="text-nexus-blue" />
                   </div>
                   <div className="h-40 relative group bg-bg-2/30 rounded-2xl border border-border-main overflow-hidden">
                      <svg viewBox="0 0 1000 500" className="w-full h-full opacity-30 fill-text-muted transition-all group-hover:opacity-50">
                        <path d="M150,150 L200,100 L250,120 L300,80 L350,110 L400,90 L450,130 L500,100 L550,120 L600,90 L650,110 L700,85 L750,115 L800,95 L850,125 L850,250 L800,300 L750,280 L700,320 L650,290 L600,330 L550,300 L500,340 L450,310 L400,350 L350,320 L300,360 L250,330 L200,370 L150,340 Z" />
                      </svg>
                      <AnimatePresence>
                        {[
                          { id: 1, t: '40%', l: '20%', c: 'bg-nexus-red' },
                          { id: 2, t: '35%', l: '55%', c: 'bg-nexus-red' },
                          { id: 3, t: '65%', l: '45%', c: 'bg-nexus-teal' },
                        ].map((p) => (
                           <motion.div 
                             key={p.id}
                             animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }}
                             transition={{ duration: 3, repeat: Infinity, delay: p.id * 0.5 }}
                             className={cn("absolute w-2 h-2 rounded-full", p.c)}
                             style={{ top: p.t, left: p.l, boxShadow: `0 0 10px ${p.c === 'bg-nexus-red' ? '#ef4444' : '#2dd4bf'}` }}
                           />
                        ))}
                      </AnimatePresence>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="text-[10px] font-black uppercase tracking-[3px] text-text-muted bg-bg-1/90 px-3 py-1 rounded-full border border-border-main group-hover:text-nexus-blue transition-colors">Orbit Scan Active</div>
                      </div>
                   </div>
                   <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-text-muted uppercase italic">3 Anomalies Detected</span>
                      <span className="text-[10px] font-black text-nexus-red uppercase underline cursor-pointer">Live Buffer</span>
                   </div>
                </div>

                {/* Threat Analysis Table */}
                <div className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">Threat Intelligence</h3>
                      <div className="px-2 py-0.5 rounded-full bg-nexus-blue/10 text-nexus-blue text-[9px] font-black uppercase border border-nexus-blue/20">Real-time</div>
                   </div>
                   <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                      {[
                        { origin: 'Nairobi, KE', vector: 'Brute Force', risk: 'High', time: 'Active' },
                        { origin: 'San Jose, US', vector: 'Port Scan', risk: 'Medium', time: '2m ago' },
                        { origin: 'London, UK', vector: 'SQL Injection', risk: 'Low', time: '15m ago' },
                      ].map((threat, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-bg-2/50 rounded-xl border border-border-main group hover:border-nexus-red transition-all">
                           <div>
                              <div className="text-[10px] font-bold text-text-main">{threat.origin}</div>
                              <div className="text-[9px] text-text-muted font-mono uppercase italic">{threat.vector}</div>
                           </div>
                           <div className="text-right">
                              <div className={cn(
                                "text-[9px] font-black uppercase px-1.5 py-0.25 rounded-sm inline-block mb-1",
                                threat.risk === 'High' ? "bg-nexus-red/10 text-nexus-red" : 
                                threat.risk === 'Medium' ? "bg-nexus-amber/10 text-nexus-amber" : 
                                "bg-nexus-teal/10 text-nexus-teal"
                              )}>
                                 {threat.risk}
                              </div>
                              <div className="text-[9px] text-text-muted italic">{threat.time}</div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Middle Row: Quick Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                   { icon: Smartphone, label: '2FA Status', val: 'Active', color: 'text-nexus-teal' },
                   { icon: Key, label: 'API Keys', val: '12 Secret', color: 'text-nexus-blue' },
                   { icon: Lock, label: 'Encryption', val: 'TLS 1.3', color: 'text-nexus-purple' },
                   { icon: History, label: 'Last Audit', val: '5m Ago', color: 'text-text-muted' },
                 ].map((stat, i) => (
                   <div key={i} className="bg-bg-1 border border-border-main p-4 rounded-2xl flex items-center gap-4 group hover:border-nexus-blue transition-colors">
                      <div className={cn("w-10 h-10 rounded-xl bg-bg-2 flex items-center justify-center border border-border-main group-hover:scale-110 transition-transform", stat.color)}>
                         <stat.icon size={20} />
                      </div>
                      <div>
                         <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</div>
                         <div className="text-sm font-bold text-text-main">{stat.val}</div>
                      </div>
                   </div>
                 ))}
              </div>

              {/* Bottom Sections: Features & Alerts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 {/* Audit Timeline Component */}
                 <div className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <Activity size={18} className="text-nexus-blue" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Security Audit Log</h3>
                       </div>
                       <button className="text-[10px] font-black text-nexus-blue uppercase border-b border-nexus-blue/30">Detailed Feed</button>
                    </div>
                    <div className="space-y-3 flex-1">
                       {auditLogs.slice(0, 4).map((log, i) => (
                          <div key={i} className="flex gap-4 group">
                             <div className="mt-1 relative">
                                <div className={cn(
                                  "w-2 h-2 rounded-full z-10 relative",
                                  log.status === 'success' ? "bg-nexus-teal" : log.status === 'failed' ? "bg-nexus-red" : "bg-nexus-amber"
                                )} />
                                {i !== 3 && <div className="absolute top-2 left-1 w-[1px] bottom-[-15px] bg-border-main" />}
                             </div>
                             <div className="flex-1 pb-4">
                                <div className="flex items-center justify-between">
                                   <div className="text-xs font-bold text-text-dim group-hover:text-text-main transition-colors">{log.event}</div>
                                   <div className="text-[9px] font-mono text-text-muted">{log.time.split(' ')[1]}</div>
                                </div>
                                <div className="text-[10px] text-text-muted mt-1 leading-relaxed">{log.details}</div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Login Heatmap */}
                 <div className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <History size={18} className="text-nexus-blue" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Access Patterns (28D)</h3>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] text-text-muted italic">Less</span>
                          <div className="flex gap-1">
                             {[0, 1, 2, 3, 4].map(v => (
                               <div 
                                 key={v} 
                                 className={cn(
                                   "w-2.5 h-2.5 rounded-sm",
                                   v === 0 ? "bg-bg-2" : v === 1 ? "bg-nexus-blue/20" : v === 2 ? "bg-nexus-blue/40" : v === 3 ? "bg-nexus-blue/70" : "bg-nexus-blue"
                                 )} 
                               />
                             ))}
                          </div>
                          <span className="text-[10px] text-text-muted italic">More</span>
                       </div>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center p-4">
                       <div className="grid grid-cols-7 gap-2">
                          {heatmapData.map((data) => (
                             <motion.div 
                               key={data.day}
                               whileHover={{ scale: 1.2, zIndex: 10 }}
                               className={cn(
                                 "w-8 h-8 rounded-lg cursor-help border border-border-main/20",
                                 data.intensity === 0 ? "bg-bg-2" : 
                                 data.intensity === 1 ? "bg-nexus-blue/20" : 
                                 data.intensity === 2 ? "bg-nexus-blue/40" : 
                                 data.intensity === 3 ? "bg-nexus-blue/70" : "bg-nexus-blue"
                               )}
                               title={`${data.date}: Intensity ${data.intensity}`}
                             />
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* Advanced Defense System */}
                 <div className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <Zap size={120} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-text-main mb-6 flex items-center gap-2">
                       <Fingerprint size={18} className="text-nexus-purple" />
                       Intelligence Engine
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-4 bg-bg-2/50 border border-border-main rounded-2xl hover:border-nexus-purple transition-all">
                          <div className="flex items-center gap-2 mb-2">
                             <Server size={14} className="text-nexus-purple" />
                             <span className="text-[10px] font-black uppercase text-text-dim">Device Heartbeat</span>
                          </div>
                          <p className="text-[11px] text-text-muted leading-relaxed">Continuous analysis of gateway pulse and protocol headers to identify anomalies.</p>
                       </div>
                       <div className="p-4 bg-bg-2/50 border border-border-main rounded-2xl hover:border-nexus-purple transition-all">
                          <div className="flex items-center gap-2 mb-2">
                             <Globe size={14} className="text-nexus-blue" />
                             <span className="text-[10px] font-black uppercase text-text-dim">Geo-IP Fencing</span>
                          </div>
                          <p className="text-[11px] text-text-muted leading-relaxed">Restricting administrative access to verified orbital corridors and industrial IP blocks.</p>
                       </div>
                       <div className="p-4 bg-bg-2/50 border border-border-main rounded-2xl hover:border-nexus-purple transition-all">
                          <div className="flex items-center gap-2 mb-2">
                             <Cpu size={14} className="text-nexus-teal" />
                             <span className="text-[10px] font-black uppercase text-text-dim">Signed Firmware</span>
                          </div>
                          <p className="text-[11px] text-text-muted leading-relaxed">Ensuring all over-the-air updates correlate with cryptographic master signatures.</p>
                       </div>
                       <div className="p-4 bg-bg-2/50 border border-border-main rounded-2xl hover:border-nexus-purple transition-all">
                          <div className="flex items-center gap-2 mb-2">
                             <MoreVertical size={14} className="text-text-muted" />
                             <span className="text-[10px] font-black uppercase text-text-dim">Audit Enforcement</span>
                          </div>
                          <p className="text-[11px] text-text-muted leading-relaxed">Maintenance logs are automatically cross-referenced with authorized worker presence.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'sessions' && (
            <motion.div 
              key="sessions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-bg-1 border border-border-main rounded-3xl shadow-lg overflow-hidden"
            >
               <div className="px-6 py-4 border-b border-border-main bg-bg-0/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Monitor size={18} className="text-nexus-blue" />
                     <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Active Sessions</h3>
                  </div>
                  <button className="text-[10px] font-black text-nexus-red border border-nexus-red/30 px-3 py-1 rounded-lg hover:bg-nexus-red/10 transition-colors uppercase">Kill All Other Sessions</button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-bg-2/50">
                        <tr className="text-[10px] font-black text-text-muted uppercase tracking-[2px]">
                           <th className="py-4 px-6 border-b border-border-main">Device & ID</th>
                           <th className="py-4 px-6 border-b border-border-main">Operating System</th>
                           <th className="py-4 px-6 border-b border-border-main">IP & Location</th>
                           <th className="py-4 px-6 border-b border-border-main text-right">Status</th>
                           <th className="py-4 px-6 border-b border-border-main text-right">Action</th>
                        </tr>
                     </thead>
                      <tbody className="divide-y divide-border-main/50">
                        {sessionList.map((session) => (
                           <tr key={session.id} className={cn("group transition-colors", session.isCurrent ? "bg-nexus-blue/5" : "hover:bg-bg-2/30")}>
                              <td className="py-4 px-6">
                                 <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", 
                                      session.isCurrent ? "bg-nexus-blue/10 border-nexus-blue/20 text-nexus-blue" : "bg-bg-2 border-border-main text-text-muted")}>
                                       {session.device.includes('iPhone') ? <Smartphone size={16} /> : <Monitor size={16} />}
                                    </div>
                                    <div>
                                       <div className="text-xs font-bold text-text-main">
                                         {session.isCurrent ? `${session.device} (Current Session)` : session.device}
                                         {watchList.some(w => w.ip === session.ip || w.device === session.device) && (
                                           <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-nexus-blue text-white text-[8px] font-black uppercase tracking-widest animate-pulse">
                                              Watching
                                           </span>
                                         )}
                                       </div>
                                       <div className="text-[10px] text-text-muted font-mono uppercase italic">
                                         {session.isCurrent ? `${currentSessionInfo.browser} on ${currentSessionInfo.os}` : session.browser}
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-4 px-6">
                                 <div className="text-xs font-medium text-text-dim">
                                   {session.isCurrent ? currentSessionInfo.os : session.os}
                                 </div>
                              </td>
                              <td className="py-4 px-6">
                                 <div className="text-xs font-bold text-text-dim">{session.ip}</div>
                                 <div className="text-[10px] text-text-muted flex items-center gap-1">
                                    <MapPin size={8} /> {session.location}
                                 </div>
                              </td>
                              <td className="py-4 px-6 text-right">
                                 {session.isCurrent ? (
                                    <span className="text-[9px] font-black bg-nexus-blue/10 text-nexus-blue px-2 py-0.5 rounded-full uppercase tracking-widest border border-nexus-blue/20">Active Session</span>
                                 ) : (
                                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{session.lastActive}</span>
                                 )}
                              </td>
                              <td className="py-4 px-6 text-right">
                                 {!session.isCurrent && (
                                    <div className="flex items-center justify-end gap-2">
                                       <button 
                                         onClick={() => handleKillSession(session.id)}
                                         className="p-2 text-text-muted hover:text-nexus-red hover:bg-nexus-red/10 rounded-lg transition-all"
                                         title="Kill Session"
                                       >
                                          <Trash2 size={16} />
                                       </button>
                                       <button 
                                         onClick={() => handleKillSession(session.id, true)}
                                         className="p-2 text-text-muted hover:text-nexus-red hover:bg-nexus-red/20 rounded-lg transition-all group/block"
                                         title="Kill & Block IP"
                                       >
                                          <UserX size={16} className="group-hover/block:scale-110" />
                                       </button>
                                    </div>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="p-4 bg-bg-2/30 text-[10px] italic text-text-muted text-center border-t border-border-main">
                  Sessions are automatically rotated every 24 hours. Browser fingerprinting is active to detect cookie theft.
               </div>
            </motion.div>
          )}

          {activeSubTab === 'audit' && (
            <motion.div 
               key="audit"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="grid grid-cols-1 gap-6"
            >
               <div className="bg-bg-1 border border-border-main rounded-3xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <History size={18} className="text-nexus-blue" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Comprehensive Access Audit</h3>
                     </div>
                     <div className="flex gap-2">
                        <input 
                           type="text" 
                           placeholder="Filter events..." 
                           className="bg-bg-2 border border-border-main rounded-xl px-3 py-1.5 text-xs outline-none focus:border-nexus-blue w-48"
                        />
                        <button className="bg-bg-2 border border-border-main rounded-xl px-3 py-1.5 text-xs font-bold text-text-dim hover:text-text-main border-dashed">Export Log (CSV)</button>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     {auditLogs.map((log) => (
                        <div key={log.id} className="bg-bg-0/50 border border-border-main rounded-2xl p-4 hover:border-nexus-blue transition-colors flex items-start gap-4 group">
                           <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                             log.status === 'success' ? "bg-nexus-teal/10 border-nexus-teal/20 text-nexus-teal" : 
                             log.status === 'failed' ? "bg-nexus-red/10 border-nexus-red/20 text-nexus-red" : 
                             "bg-nexus-amber/10 border-nexus-amber/20 text-nexus-amber"
                           )}>
                              {log.status === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                 <h4 className="text-xs font-black uppercase tracking-widest text-text-main">{log.event}</h4>
                                 <span className="text-[10px] font-mono text-text-muted">{log.time}</span>
                              </div>
                              <p className="text-xs text-text-dim mt-1 font-medium italic">User: {log.user}</p>
                              <div className="text-[10px] text-text-muted mt-2 p-2 bg-bg-2 rounded-lg border border-border-main font-mono">
                                 {log.details}
                              </div>
                           </div>
                           <button className="p-1.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical size={16} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeSubTab === 'config' && (
            <motion.div 
               key="config"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
               {/* 2FA Section */}
               <div className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-main">
                     <Smartphone size={18} className="text-nexus-teal" />
                     <h3 className="text-sm font-black uppercase tracking-widest text-text-main">2FA Authentication</h3>
                  </div>
                  <div className="space-y-6">
                     <div className="flex items-start justify-between">
                        <div>
                           <div className="text-xs font-bold text-text-main">Google Authenticator</div>
                           <div className="text-[10px] text-text-muted mt-1 max-w-[240px]">Primary secure method for generating time-based one-time passwords.</div>
                        </div>
                        <span className="text-[9px] font-black bg-nexus-teal/10 text-nexus-teal px-2 py-0.5 rounded-full uppercase">Enabled</span>
                     </div>
                     <div className="flex items-start justify-between opacity-50">
                        <div>
                           <div className="text-xs font-bold text-text-main">SMS OTP Recovery</div>
                           <div className="text-[10px] text-text-muted mt-1 max-w-[240px]">Backup method for emergency access via encrypted cellular channel.</div>
                        </div>
                        <button className="text-[9px] font-black text-nexus-blue uppercase underline">Setup</button>
                     </div>
                     <div className="p-4 bg-bg-2 rounded-2xl border-2 border-dashed border-border-main flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-bg-1 rounded-xl flex items-center justify-center mb-3">
                           <Eye size={24} className="text-text-muted opacity-30" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[2px] text-text-dim">Device Trust Center</h4>
                        <p className="text-[10px] text-text-muted mt-2">Manage authorized keys and orbital fingerprinting for zero-trust access.</p>
                     </div>
                  </div>
               </div>

               {/* API & Network Section */}
               <div className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-main">
                     <Zap size={18} className="text-nexus-blue" />
                     <h3 className="text-sm font-black uppercase tracking-widest text-text-main">API Token Architecture</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-3 bg-bg-2 rounded-xl border border-border-main group cursor-pointer hover:border-nexus-blue transition-all">
                        <div className="flex items-center gap-3">
                           <Wifi size={14} className="text-nexus-blue" />
                           <span className="text-xs font-bold text-text-dim">MQTT Auth Token</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-mono text-text-muted italic">•••• •••• •••• 12B4</span>
                           <ChevronRight size={14} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                        </div>
                     </div>
                     <div className="flex items-center justify-between p-3 bg-bg-2 rounded-xl border border-border-main group cursor-pointer hover:border-nexus-blue transition-all">
                        <div className="flex items-center gap-3">
                           <Bluetooth size={14} className="text-nexus-purple" />
                           <span className="text-xs font-bold text-text-dim">Local Proxy Key</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-mono text-text-muted italic">•••• •••• •••• 99FF</span>
                           <ChevronRight size={14} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                        </div>
                     </div>
                     <div className="mt-8 p-4 bg-nexus-blue/5 border border-nexus-blue/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 text-nexus-blue">
                           <Lock size={14} />
                           <span className="text-[10px] font-black uppercase tracking-widest">TLS Encryption</span>
                        </div>
                        <p className="text-[11px] text-text-muted font-medium italic leading-relaxed">
                           All communication between ISHMATEK cloud and edge sensors is force-encrypted with a 4096-bit master key.
                        </p>
                     </div>
                  </div>
               </div>

               {/* Blocklist Section */}
               <div className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-main">
                     <div className="flex items-center gap-3">
                        <ShieldOff size={18} className="text-nexus-red" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Blacklisted Entities</h3>
                     </div>
                     <span className="text-[10px] font-bold text-nexus-red px-2 py-0.5 bg-nexus-red/10 rounded-full border border-nexus-red/20 uppercase tracking-[2px]">
                        {blockedEntities.length} Blocked
                     </span>
                  </div>
                  
                  {blockedEntities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                       <div className="w-16 h-16 rounded-full bg-bg-2 flex items-center justify-center mb-4 border border-dashed border-border-main opacity-40">
                          <Slash size={24} className="text-text-muted" />
                       </div>
                       <div className="text-xs font-bold text-text-muted uppercase tracking-widest">No active blocks</div>
                       <p className="text-[10px] text-text-muted mt-2 max-w-xs">Entities blocked during session termination will appear here for management.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {blockedEntities.map(block => (
                         <div key={block.id} className="p-4 bg-bg-2 border border-border-main rounded-2xl group hover:border-nexus-red transition-all">
                            <div className="flex items-center justify-between mb-2">
                               <div className="text-[9px] font-black uppercase tracking-widest text-nexus-red bg-nexus-red/10 px-1.5 py-0.5 rounded-sm">
                                  {block.type} BLOCK
                               </div>
                               <button 
                                 onClick={() => {
                                    setWatchList(prev => [...prev, { ...block, lastSeen: 'Just unblocked' }]);
                                    setBlockedEntities(prev => prev.filter(b => b.id !== block.id));
                                    setSecurityNotifications(prev => [
                                      { id: Math.random().toString(), message: `New Watch: ${block.ip} is being monitored.`, type: 'watch' },
                                      ...prev
                                    ]);
                                 }}
                                 className="text-[10px] font-black text-nexus-blue uppercase hover:underline"
                               >
                                  Unblock & Watch
                               </button>
                            </div>
                            <div className="text-xs font-bold text-text-main truncate">{block.ip}</div>
                            <div className="text-[10px] text-text-muted mt-1 uppercase italic tracking-tighter truncate">{block.device}</div>
                            <div className="mt-4 flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                               <div className="w-1.5 h-1.5 rounded-full bg-nexus-red" />
                               <span className="text-[8px] font-mono text-text-muted uppercase tracking-widest">Permanent Lockdown Active</span>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
               </div>

               {/* Watchlist Section */}
               <div className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-main">
                     <div className="flex items-center gap-3">
                        <Eye size={18} className="text-nexus-blue" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Monitored Watchlist</h3>
                     </div>
                     <span className="text-[10px] font-bold text-nexus-blue px-2 py-0.5 bg-nexus-blue/10 rounded-full border border-nexus-blue/20 uppercase tracking-[2px]">
                        {watchList.length} Watching
                     </span>
                  </div>
                  
                  {watchList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                       <div className="text-xs font-bold text-text-muted uppercase tracking-widest">No active watches</div>
                       <p className="text-[10px] text-text-muted mt-2 max-w-xs">Unblocked entities are automatically moved here for monitoring.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {watchList.map(item => (
                         <div key={item.id} className="p-4 bg-bg-2 border border-border-main rounded-2xl group hover:border-nexus-blue transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2">
                               <motion.div 
                                 animate={{ opacity: [1, 0.4, 1] }} 
                                 transition={{ duration: 2, repeat: Infinity }}
                                 className="w-2 h-2 rounded-full bg-nexus-blue shadow-[0_0_8px_#3b82f6]" 
                               />
                            </div>
                            <div className="flex items-center justify-between mb-2">
                               <div className="text-[9px] font-black uppercase tracking-widest text-nexus-blue bg-nexus-blue/10 px-1.5 py-0.5 rounded-sm">
                                  Monitoring Active
                               </div>
                               <button 
                                 onClick={() => setWatchList(prev => prev.filter(w => w.id !== item.id))}
                                 className="text-[10px] font-black text-text-muted uppercase hover:text-nexus-red transition-colors"
                               >
                                  Stop Watch
                               </button>
                            </div>
                            <div className="text-xs font-bold text-text-main truncate">{item.ip}</div>
                            <div className="text-[10px] text-text-muted mt-1 uppercase italic tracking-tighter truncate">{item.device}</div>
                            <div className="mt-4 flex items-center justify-between">
                               <div className="flex items-center gap-1.5">
                                  <Clock size={10} className="text-text-muted" />
                                  <span className="text-[8px] font-mono text-text-muted uppercase">{item.lastSeen}</span>
                               </div>
                               <div className="text-[8px] font-black text-nexus-teal uppercase bg-nexus-teal/10 px-1 rounded-sm border border-nexus-teal/20">Authorized</div>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Security Alerts Footer Bar */}
      <div className="px-6 py-3 border-t border-border-main bg-bg-1 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-nexus-teal animate-pulse" />
               <span className="text-[10px] font-black text-nexus-teal uppercase tracking-widest">TLS 1.3 Active</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-nexus-blue" />
               <span className="text-[10px] font-black text-nexus-blue uppercase tracking-widest">IP Whitelisting Enabled</span>
            </div>
         </div>
         <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 group cursor-pointer">
            <SettingsIcon size={12} className="group-hover:rotate-90 transition-transform" />
            Security Preference Hash: 0x44A...8B1
         </div>
      </div>
    </div>
  );
}
