import { useState } from 'react';
import { 
  Link as LinkIcon, 
  Cloud, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw, 
  Plus, 
  Mail, 
  MessageSquare, 
  Globe, 
  Database,
  Lock,
  Search,
  Zap,
  Cpu,
  Unlink,
  Settings as SettingsIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../lib/i18n';

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  description: string;
  category: 'Cloud' | 'Communication' | 'IoT' | 'Data';
}

export default function Integrations() {
  const { language } = useSettings();
  const t = useTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeApiTab, setActiveApiTab] = useState<'devices' | 'metrics' | 'users' | 'logs'>('devices');
  const [selectedLang, setSelectedLang] = useState<'curl' | 'python' | 'node'>('curl');
  const [copied, setCopied] = useState(false);

  const getTemplates = (tab: string, origin: string) => {
    switch (tab) {
      case 'devices':
        return {
          curl: `curl -X POST "${origin}/api/devices" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "id": "SN-AS-001",\n    "name": "Alpha-Core Node",\n    "type": "air",\n    "lat": -1.9441,\n    "lng": 30.2012,\n    "status": "warn"\n  }'`,
          python: `import requests\n\nurl = "${origin}/api/devices"\npayload = {\n    "id": "SN-AS-001",\n    "name": "Alpha-Core Node",\n    "type": "air",\n    "lat": -1.9441,\n    "lng": 30.2012,\n    "status": "warn"\n}\n\nresponse = requests.post(url, json=payload)\nprint(response.json())`,
          node: `fetch('${origin}/api/devices', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    id: 'SN-AS-001',\n    name: 'Alpha-Core Node',\n    type: 'air',\n    lat: -1.9441,\n    lng: 30.2012,\n    status: 'warn'\n  })\n})\n.then(res => res.json())\n.then(console.log);`
        };
      case 'metrics':
        return {
          curl: `curl -X POST "${origin}/api/metrics" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "temp": 24.8,\n    "water": 58.2,\n    "air": 780,\n    "power": 322\n  }'`,
          python: `import requests\n\nurl = "${origin}/api/metrics"\npayload = {\n    "temp": 24.8,\n    "water": 58.2,\n    "air": 780,\n    "power": 322\n}\n\nresponse = requests.post(url, json=payload)\nprint(response.json())`,
          node: `fetch('${origin}/api/metrics', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    temp: 24.8,\n    water: 58.2,\n    air: 780,\n    power: 322\n  })\n})\n.then(res => res.json())\n.then(console.log);`
        };
      case 'users':
        return {
          curl: `curl -X POST "${origin}/api/users" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "id": "U-001",\n    "name": "Jean Luc (Custom Path)",\n    "lat": -1.9460,\n    "lng": 30.0650,\n    "status": "online"\n  }'`,
          python: `import requests\n\nurl = "${origin}/api/users"\npayload = {\n    "id": "U-001",\n    "name": "Jean Luc (Custom Path)",\n    "lat": -1.9460,\n    "lng": 30.0650,\n    "status": "online"\n}\n\nresponse = requests.post(url, json=payload)\nprint(response.json())`,
          node: `fetch('${origin}/api/users', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    id: 'U-001',\n    name: 'Jean Luc (Custom Path)',\n    lat: -1.9460,\n    lng: 30.0650,\n    status: 'online'\n  })\n})\n.then(res => res.json())\n.then(console.log);`
        };
      case 'logs':
      default:
        return {
          curl: `curl -X POST "${origin}/api/logs" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "source": "Python Worker",\n    "message": "Custom worker batch process completed.",\n    "type": "info"\n  }'`,
          python: `import requests\n\nurl = "${origin}/api/logs"\npayload = {\n    "source": "Python Worker",\n    "message": "Custom worker batch process completed.",\n    "type": "info"\n}\n\nresponse = requests.post(url, json=payload)\nprint(response.json())`,
          node: `fetch('${origin}/api/logs', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    source: 'Python Worker',\n    message: 'Custom worker batch process completed.',\n    type: 'info'\n  })\n})\n.then(res => res.json())\n.then(console.log);`
        };
    }
  };

  const integrations: Integration[] = [
    { id: 'mqtt-01', name: 'MQTT Broker', type: 'EMQX Enterprise', status: 'connected', lastSync: 'Real-time', description: 'Primary message broker for sensor telemetry and command routing.', category: 'IoT' },
    { id: 'aws-01', name: 'AWS S3 Cold Storage', type: 'Amazon Web Services', status: 'connected', lastSync: '12m ago', description: 'Long-term archival for historical sensor data and logs.', category: 'Cloud' },
    { id: 'twilio-01', name: 'Twilio SMS Gateway', type: 'Communication', status: 'connected', lastSync: '1h ago', description: 'Provider for SMS-based alerts and 2FA recovery codes.', category: 'Communication' },
    { id: 'sendgrid-01', name: 'SendGrid Email', type: 'Communication', status: 'error', lastSync: 'Failed 4h ago', description: 'SMTP relay for system notifications and reporting.', category: 'Communication' },
    { id: 'weather-01', name: 'OpenWeather API', type: 'External Data', status: 'connected', lastSync: '30m ago', description: 'Contextual weather data for environmental sensor correlation.', category: 'Data' },
    { id: 'influx-01', name: 'InfluxDB Cloud', type: 'Time-Series DB', status: 'disconnected', lastSync: 'N/A', description: 'Cloud-based time-series database for advanced analytics.', category: 'Data' },
  ];

  const filteredIntegrations = integrations.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-bg-0">
      {/* Header Area */}
      <div className="p-6 border-b border-border-main bg-bg-1/30">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-nexus-blue/10 flex items-center justify-center text-nexus-blue border border-nexus-blue/20 shadow-sm">
              <LinkIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-main tracking-tight italic uppercase">Integrations Ecosystem</h1>
              <p className="text-sm text-text-muted mt-1">Connect your industrial network with cloud infrastructure and communication services</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Filter integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-bg-1 border border-border-main rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-nexus-blue w-64 transition-all"
                />
             </div>
             <button className="flex items-center gap-2 px-5 py-2.5 bg-nexus-blue text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-nexus-blue/90 shadow-xl shadow-nexus-blue/20 transition-all active:scale-95">
                <Plus size={16} />
                Connect New
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <AnimatePresence>
              {filteredIntegrations.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-bg-1 border border-border-main rounded-3xl p-6 shadow-sm group hover:border-nexus-blue transition-all flex flex-col h-full"
                >
                   <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-bg-2 border border-border-main flex items-center justify-center text-text-dim group-hover:text-nexus-blue transition-colors">
                         {item.category === 'Cloud' && <Cloud size={24} />}
                         {item.category === 'Communication' && <MessageSquare size={24} />}
                         {item.category === 'IoT' && <Cpu size={24} />}
                         {item.category === 'Data' && <Database size={24} />}
                      </div>
                      <div className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        item.status === 'connected' ? "bg-nexus-teal/10 border-nexus-teal/20 text-nexus-teal" :
                        item.status === 'error' ? "bg-nexus-red/10 border-nexus-red/20 text-nexus-red" :
                        "bg-bg-3 border-border-main text-text-muted"
                      )}>
                         {item.status}
                      </div>
                   </div>

                   <div className="flex-1">
                      <h3 className="text-base font-bold text-text-main group-hover:text-nexus-blue transition-colors">{item.name}</h3>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1 italic">{item.type}</p>
                      <p className="text-xs text-text-dim mt-4 leading-relaxed line-clamp-3">{item.description}</p>
                   </div>

                   <div className="mt-8 flex items-center justify-between pt-6 border-t border-border-main">
                      <div className="flex items-center gap-2">
                         <RefreshCcw size={12} className={cn("text-text-muted", item.status === 'connected' && "animate-spin-slow")} />
                         <span className="text-[10px] font-mono text-text-muted">{item.lastSync}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <button className="p-2 text-text-muted hover:text-text-main hover:bg-bg-2 rounded-lg transition-colors">
                            <SettingsIcon size={14} />
                         </button>
                         <button className="p-2 text-text-muted hover:text-nexus-red hover:bg-nexus-red/10 rounded-lg transition-colors">
                            <Unlink size={14} />
                         </button>
                      </div>
                   </div>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* Interactive REST API Documentation and Playground */}
        <div className="mt-12 bg-bg-1 border border-border-main rounded-3xl p-6 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-nexus-blue/5 rounded-full blur-3xl -z-1" />
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-border-main pb-6">
             <div>
                <h2 className="text-sm font-black uppercase tracking-[3px] text-text-main flex items-center gap-3">
                   <Zap size={16} className="text-nexus-blue animate-pulse" />
                   REST API CONTROL HUB
                </h2>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                   Sync real industrial PLC controllers, telemetry streams, and hardware triggers directly into your live portal.
                </p>
             </div>
             
             <div className="flex items-center gap-1.5 p-1 bg-bg-2 rounded-xl border border-border-main">
                {(['devices', 'metrics', 'users', 'logs'] as const).map(tab => (
                   <button 
                      key={tab}
                      onClick={() => setActiveApiTab(tab)}
                      className={cn(
                        "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                        activeApiTab === tab 
                          ? "bg-bg-1 text-nexus-blue border border-border-main shadow-sm"
                          : "text-text-muted hover:text-text-dim"
                      )}
                   >
                      {tab} API
                   </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Left Column: Details & Custom Payload Trigger Test */}
             <div className="flex flex-col gap-5 justify-between">
                <div>
                   <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-nexus-teal/10 border border-nexus-teal/20 rounded text-[9px] font-black tracking-widest text-nexus-teal">POST</span>
                      <code className="text-xs font-mono font-bold text-text-main select-all">{typeof window !== 'undefined' ? window.location.origin : 'https://your-host'}/api/{activeApiTab === 'logs' ? 'logs' : activeApiTab}</code>
                   </div>
                   
                   <p className="text-xs text-text-dim mt-4 leading-relaxed">
                      {activeApiTab === 'devices' && "Registers, configures, or pushes real-time spatial adjustments for a device. Pushing coordinates updates its spot on the map live."}
                      {activeApiTab === 'metrics' && "Updates current climate, fluid, or energy grids variables. Pushing new measurements displays them instantaneously on Overview charts."}
                      {activeApiTab === 'users' && "Updates operator coordinates, assignments, and check-in statuses. Pushing checks in the operators and moves them geographically."}
                      {activeApiTab === 'logs' && "Appends diagnostic events, safety warnings, or operational statuses to the centralized operations logs registry."}
                   </p>

                   {/* Custom inline tester */}
                   <div className="mt-6 p-4 bg-bg-2 border border-border-main rounded-2xl flex flex-col gap-3">
                      <div className="text-[10px] font-black text-text-main uppercase tracking-widest">Test Live API Call</div>
                      <div className="text-[9px] text-text-muted leading-relaxed">
                         Trigger a payload update directly inside the active tab. No physical IoT processor needed!
                      </div>
                      <button 
                         onClick={async () => {
                            try {
                               const bodyPayload: Record<string, any> = {
                                 devices: { id: 'SN-AS-001', name: 'Ambient Sync Alpha', type: 'air', lat: -1.9441 + (Math.random() - 0.5) * 0.002, lng: 30.2012 + (Math.random() - 0.5) * 0.002, status: 'warn' },
                                 metrics: { temp: 22 + Math.random() * 5, water: 50 + Math.random() * 10, air: 700 + Math.floor(Math.random() * 200), power: 310 + Math.floor(Math.random() * 40) },
                                 users: { id: 'U-001', name: 'Jean Luc', lat: -1.9441 + (Math.random() - 0.5) * 0.005, lng: 30.0619 + (Math.random() - 0.5) * 0.005, status: 'online' },
                                 logs: { source: 'Portal Simulator', message: 'Manual simulator REST trigger initiated.', type: 'info' }
                               }[activeApiTab];

                               const res = await fetch(`/api/${activeApiTab === 'logs' ? 'logs' : activeApiTab}`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(bodyPayload)
                               });
                               if (res.ok) {
                                  alert(`Successfully triggered REST POST to /api/${activeApiTab}. Changes will appear instantly!`);
                               }
                            } catch (e) {
                               alert('Failed to connect to API, ensure server is running.');
                            }
                         }}
                         className="py-2.5 bg-nexus-blue/10 hover:bg-nexus-blue/15 text-nexus-blue rounded-xl text-[9px] font-black uppercase tracking-widest border border-nexus-blue/25 transition-all active:scale-95"
                      >
                         Send Probe Payload 📡
                      </button>
                   </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-nexus-teal/5 border border-nexus-teal/20 rounded-2xl text-[10px] text-nexus-teal">
                   <CheckCircle2 size={16} className="shrink-0" />
                   <div>
                       <strong className="font-extrabold uppercase">Persistent Sync Active</strong>: All posted signals are processed, distributed, and displayed dynamically in-memory.
                   </div>
                </div>
             </div>

             {/* Right Column: Code Snippets & Copy */}
             <div className="flex flex-col gap-3 min-w-0">
                <div className="flex items-center justify-between bg-bg-2 border border-border-main p-1 rounded-xl">
                   <div className="flex items-center gap-1.5">
                      {(['curl', 'python', 'node'] as const).map(langOpt => (
                         <button 
                            key={langOpt}
                            onClick={() => setSelectedLang(langOpt)}
                            className={cn(
                              "px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                              selectedLang === langOpt 
                                ? "bg-bg-1 text-text-main shadow-xs border border-border-main"
                                : "text-text-muted hover:text-text-dim"
                            )}
                         >
                            {langOpt}
                         </button>
                      ))}
                   </div>

                   <button 
                      onClick={() => {
                         navigator.clipboard.writeText(getTemplates(activeApiTab, typeof window !== 'undefined' ? window.location.origin : 'https://your-host')[selectedLang]);
                         setCopied(true);
                         setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-3 py-1 text-[9px] font-bold text-text-muted hover:text-text-main flex items-center gap-1 bg-bg-1 border border-border-main rounded-lg transition-all"
                   >
                      {copied ? 'Copied! ✅' : 'Copy'}
                   </button>
                </div>

                <div className="flex-1 bg-black/95 p-4 rounded-2xl border border-white/5 overflow-x-auto font-mono text-[10px] text-white/90 leading-relaxed shadow-lg max-h-64 scrollbar-thin">
                   <pre className="whitespace-pre">{getTemplates(activeApiTab, typeof window !== 'undefined' ? window.location.origin : 'https://your-host')[selectedLang]}</pre>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
