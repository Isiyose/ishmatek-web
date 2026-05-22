import { useState } from 'react';
import { Search, Filter, CheckCircle2, AlertCircle, Info, BellRing, Sliders, Plus, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../lib/i18n';

type Severity = 'all' | 'crit' | 'warn' | 'info' | 'resolved';

export default function Alerts() {
  const { language } = useSettings();
  const t = useTranslation(language);

  const [filter, setFilter] = useState<Severity>('all');

  const stats = [
    { label: t('critical'), val: 1, color: 'text-nexus-red' },
    { label: t('watch'), val: 2, color: 'text-nexus-amber' },
    { label: t('info') || 'Info', val: 1, color: 'text-nexus-blue' },
    { label: t('resolvedTdy'), val: 24, color: 'text-nexus-teal' },
  ];

  const alerts = [
    { id: 'AQ-08', sev: 'crit', zone: 'Lab C', msg: 'CO₂ exceeded 1100 ppm — immediate ventilation required', time: '09:42:11', status: 'Open' },
    { id: 'T-14', sev: 'warn', zone: 'Server F', msg: 'Temperature 25.1°C approaching 26°C critical limit', time: '09:38:55', status: 'Open' },
    { id: 'W-05', sev: 'info', zone: 'Zone C', msg: 'Sensor offline — no heartbeat for 4 minutes', time: '09:35:00', status: 'Open' },
    { id: 'P-02', sev: 'warn', zone: 'Server F', msg: 'Power draw 112 kW — exceeding zone limit of 100 kW', time: '09:21:03', status: 'Acked' },
  ];

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'crit') return a.sev === 'crit';
    if (filter === 'warn') return a.sev === 'warn';
    if (filter === 'info') return a.sev === 'info';
    return false;
  });

  return (
    <div className="p-6 flex flex-col gap-6 animate-in fade-in duration-500 overflow-y-auto h-full transition-colors duration-200">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-bg-1 border border-border-main rounded-lg p-4 text-center">
            <div className={cn("text-2xl font-bold tabular-nums", s.color)}>{s.val}</div>
            <div className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: `${t('all') || 'All'} (4)` },
          { id: 'crit', label: `🔴 ${t('critical')}`, active: 'bg-nexus-red/10 border-nexus-red/30 text-nexus-red' },
          { id: 'warn', label: `🟡 ${t('watch')}`, active: 'bg-nexus-amber/10 border-nexus-amber/30 text-nexus-amber' },
          { id: 'info', label: `🔵 ${t('info') || 'Info'}`, active: 'bg-nexus-blue/10 border-nexus-blue/30 text-nexus-blue' },
          { id: 'resolved', label: `✅ ${t('resolve') || 'Resolved'}` },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as Severity)}
            className={cn(
              "text-[11px] px-3 py-1.5 rounded-full border border-border-accent bg-bg-2 text-text-dim hover:bg-bg-3 transition-colors",
              filter === btn.id ? (btn.active || "bg-nexus-blue/15 border-nexus-blue/30 text-nexus-blue") : ""
            )}
          >
            {btn.label}
          </button>
        ))}
        <button className="ml-auto text-[11px] font-medium border border-border-accent rounded-lg px-3 py-1.5 hover:bg-bg-3 text-text-dim transition-colors">
          {t('acknowledgeAll')}
        </button>
      </div>

      {/* Alerts Table */}
      <div className="bg-bg-1 border border-border-main rounded-xl overflow-hidden shadow-sm transition-colors duration-200">
         <div className="overflow-x-auto min-h-[300px]">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-bg-2 border-b border-border-main">
                 <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('severity')}</th>
                 <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('sensor')}</th>
                 <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('zone')}</th>
                 <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('message')}</th>
                 <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('time')}</th>
                 <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('status')}</th>
                 <th className="px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('actions')}</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border-main/50">
               {filteredAlerts.map((alert, i) => (
                 <tr key={i} className="hover:bg-bg-2/30 cursor-pointer transition-colors group">
                   <td className="px-4 py-3">
                     <span className={cn(
                       "text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase",
                       alert.sev === 'crit' ? "bg-nexus-red/15 text-nexus-red" : alert.sev === 'warn' ? "bg-nexus-amber/15 text-nexus-amber" : "bg-nexus-blue/15 text-nexus-blue"
                     )}>
                       {alert.sev === 'crit' ? t('critical') : alert.sev === 'warn' ? t('watch') : (t('info') || 'Info')}
                     </span>
                   </td>
                   <td className="px-4 py-3 font-mono text-[11px] text-nexus-cyan">{alert.id}</td>
                   <td className="px-4 py-3 text-text-dim text-xs">{alert.zone}</td>
                   <td className="px-4 py-3 text-text-main text-xs max-w-sm truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">{alert.msg}</td>
                   <td className="px-4 py-3 text-[11px] font-mono text-text-muted">{alert.time}</td>
                   <td className="px-4 py-3">
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                        alert.status === 'Open' ? (alert.sev === 'crit' ? "bg-nexus-red/10 text-nexus-red" : "bg-nexus-amber/10 text-nexus-amber") : "bg-nexus-blue/10 text-nexus-blue"
                      )}>
                        {alert.status}
                      </span>
                   </td>
                   <td className="px-4 py-3">
                     <div className="flex gap-1.5">
                       <button className="text-[10px] px-2.5 py-1 rounded border border-border-accent bg-bg-3 text-text-dim hover:border-nexus-blue hover:text-nexus-blue transition-colors">{t('ack')}</button>
                       <button className="text-[10px] px-2.5 py-1 rounded border border-nexus-teal/20 bg-nexus-teal/5 text-nexus-teal hover:bg-nexus-teal/10 transition-colors">{t('resolve')}</button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      {/* Rules Section */}
      <div className="bg-bg-1 border border-border-main rounded-xl overflow-hidden mt-2 shadow-sm transition-colors duration-200">
        <div className="p-[14px_18px] border-b border-border-main flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold">{t('alertRules')}</div>
              <div className="text-[11px] text-text-muted mt-0.5">{t('conditionsTrigger')}</div>
            </div>
            <button className="bg-nexus-blue text-white text-[11px] font-medium px-3 py-1 rounded-lg hover:bg-nexus-blue/90 transition-colors flex items-center gap-1.5">
              <Plus size={14} /> {t('addRule')}
            </button>
        </div>
        <div className="p-4 space-y-2">
          {[
            { name: 'CO₂ Critical Threshold', cond: 'IF co2_ppm > 1000 FOR 2 min → CRITICAL', tag: 'CRITICAL', tagColor: 'bg-nexus-red/15 text-nexus-red', apps: 'Applies to: AQ-05 → AQ-09' },
            { name: 'Temperature Warning', cond: 'IF temp_c > 25 FOR 5 min → WARNING', tag: 'WARNING', tagColor: 'bg-nexus-amber/15 text-nexus-amber', apps: 'Applies to: T-10 → T-14' },
          ].map((rule, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-bg-2 border border-border-main rounded-lg group">
              <div className="relative w-9 h-5 shrink-0">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-bg-3 border border-border-accent rounded-full peer-checked:bg-nexus-blue/30 peer-checked:border-nexus-blue transition-colors cursor-pointer" />
                <div className="absolute top-1 left-1 w-3 h-3 bg-text-muted rounded-full peer-checked:translate-x-4 peer-checked:bg-nexus-blue transition-all cursor-pointer" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium">{rule.name}</div>
                <div className="font-mono text-[10px] text-text-muted mt-1">{rule.cond}</div>
                <div className="flex gap-2 mt-2">
                   <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", rule.tagColor)}>{rule.tag}</span>
                   <span className="text-[10px] text-text-muted">{rule.apps}</span>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 text-[10px] p-2 text-text-muted hover:text-text-main transition-all">
                <Edit2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
