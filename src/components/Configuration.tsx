import { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Clock, 
  Map as MapIcon, 
  Ruler, 
  Link as LinkIcon, 
  Key, 
  Bell, 
  History, 
  Save, 
  Trash2, 
  Edit2, 
  Plus, 
  Globe, 
  ShieldAlert,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Settings2,
  Database,
  Download,
  Upload,
  Radio,
  Wifi,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../lib/i18n';

type ConfigTab = 
  | 'thresholds' 
  | 'polling' 
  | 'zones' 
  | 'units' 
  | 'mqtt' 
  | 'api' 
  | 'notif' 
  | 'escalation' 
  | 'retention' 
  | 'backup';

const ConfigSidebar = ({ active, setTab }: { active: ConfigTab, setTab: (t: ConfigTab) => void }) => {
  const { language } = useSettings();
  const t = useTranslation(language);

  const sections = [
    { title: t('sensors') || 'Sensors', items: [
      { id: 'thresholds', icon: Sliders, label: t('thresholds') || 'Thresholds' },
      { id: 'polling', icon: Clock, label: t('polling') || 'Polling & Sync' },
      { id: 'zones', icon: MapIcon, label: t('zones') || 'Zone Manager' },
      { id: 'units', icon: Ruler, label: t('units') || 'Units & Display' },
    ]},
    { title: t('integrations') || 'Integrations', items: [
      { id: 'mqtt', icon: LinkIcon, label: 'MQTT Broker' },
      { id: 'api', icon: Key, label: 'API Keys' },
    ]},
    { title: t('alerts') || 'Alerts', items: [
      { id: 'notif', icon: Bell, label: 'Channels' },
      { id: 'escalation', icon: ShieldAlert, label: 'Escalation' },
    ]},
    { title: t('reports') || 'Reports', items: [
      { id: 'retention', icon: History, label: 'Data Retention' },
      { id: 'backup', icon: Save, label: 'Backup & Export' },
    ]}
  ];

  return (
    <div className="w-52 bg-bg-1 border-r border-border-main py-4 flex flex-col shrink-0 overflow-y-auto">
      {sections.map((section, idx) => (
        <div key={idx} className="mb-2">
          <div className="px-[18px] py-3 text-[9px] font-bold text-text-muted uppercase tracking-widest">
            {section.title}
          </div>
          {section.items.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as ConfigTab)}
              className={cn(
                "w-full flex items-center gap-2.5 px-[18px] py-2 text-left text-xs transition-all relative",
                active === item.id 
                  ? "bg-nexus-blue/10 text-nexus-blue font-medium border-r-2 border-nexus-blue" 
                  : "text-text-dim hover:bg-bg-3 hover:text-text-main"
              )}
            >
              <item.icon size={13} className="shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default function Configuration() {
  const { language } = useSettings();
  const t = useTranslation(language);
  const [activeTab, setActiveTab] = useState<ConfigTab>('thresholds');
  const [devices, setDevices] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  
  // Custom states for thresholds
  const [searchQuery, setSearchQuery] = useState('');
  const [editedValues, setEditedValues] = useState<Record<string, { min: number; max: number; warn: number }>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Polling Configurations State
  const [pollingInterval, setPollingInterval] = useState<number>(15);
  const [syncStrategy, setSyncStrategy] = useState<string>('websocket');
  const [bufferSize, setBufferSize] = useState<number>(500);
  const [compressPayload, setCompressPayload] = useState<boolean>(true);
  const [retryAttempts, setRetryAttempts] = useState<number>(3);
  const [useBackoff, setUseBackoff] = useState<boolean>(true);
  const [heartbeatTimeout, setHeartbeatTimeout] = useState<number>(60);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  
  // Interactive Manual Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStep, setSyncStep] = useState<number>(0);
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Load and cache settings
  useEffect(() => {
    // Load devices
    const saved = localStorage.getItem('nexus_sensors');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setDevices(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to load registered devices:', e);
      }
    }
    const fallback = [
      { id: 'SN-2026-0101', name: 'AeroSafe', model: 'AQ-001', type: 'air', status: 'ok', location: 'KICUKIRO' },
      { id: 'SN-2026-0102', name: 'EnergyWatch', model: 'EW-042', type: 'energy', status: 'ok', location: 'REBERO' },
      { id: 'SN-2026-0103', name: 'AquaGuard', model: 'AG-012', type: 'water', status: 'ok', location: 'NYARUGENGE' }
    ];
    setDevices(fallback);
  }, []);

  // Polling Load
  useEffect(() => {
    const savedPoll = localStorage.getItem('nexus_polling_config');
    if (savedPoll) {
      try {
        const parsed = JSON.parse(savedPoll);
        if (parsed) {
          if (parsed.pollingInterval) setPollingInterval(parsed.pollingInterval);
          if (parsed.syncStrategy) setSyncStrategy(parsed.syncStrategy);
          if (parsed.bufferSize) setBufferSize(parsed.bufferSize);
          if (parsed.compressPayload !== undefined) setCompressPayload(parsed.compressPayload);
          if (parsed.retryAttempts) setRetryAttempts(parsed.retryAttempts);
          if (parsed.useBackoff !== undefined) setUseBackoff(parsed.useBackoff);
          if (parsed.heartbeatTimeout) setHeartbeatTimeout(parsed.heartbeatTimeout);
        }
      } catch (e) {
         console.error('Failed loading polling configurations:', e);
      }
    }
  }, []);

  // Live log simulation loop for Polling Tab
  useEffect(() => {
    if (activeTab !== 'polling') return;
    
    // Setup initial logs
    if (liveLog.length === 0) {
      setLiveLog([
        `[${new Date().toLocaleTimeString()}] INIT: Synchronization module bootstrap initialized.`,
        `[${new Date().toLocaleTimeString()}] ACTIVE: Broker pipeline utilizing direct ${syncStrategy.toUpperCase()} link.`,
        `[${new Date().toLocaleTimeString()}] STATUS: Active network listening at 0.0.0.0:3000.`
      ]);
    }

    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const mockFeeds = [
        `TX -> KEEPALIVE_HEARTBEAT { sequence: ${Math.floor(Math.random() * 10000)} }`,
        `RX <- TELEMETRY_INGRESS_CHUNK [buffered: ${Math.floor(Math.random() * 40)} packets]`,
        `STATUS: Dynamic packet health rating: 100% (No packet drop detected)`,
        `DB_SYNC: Flush queue batch committed successfully (${Math.floor(Math.random() * 5)} rows updated)`,
        `STATS: Current link load is ${(1.2 + Math.random() * 0.8).toFixed(2)} KB/s. Latency: ${22 + Math.floor(Math.random() * 8)}ms`
      ];

      const r = Math.floor(Math.random() * mockFeeds.length);
      setLiveLog(prev => {
        const next = [...prev, `[${timestamp}] ${mockFeeds[r]}`];
        if (next.length > 30) next.shift(); // Keep logs constrained
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [activeTab, syncStrategy, liveLog.length]);

  // Scroll live log to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [liveLog]);

  const getParamSpec = (param: string) => {
    const p = param.toLowerCase();
    if (p.includes('pm10')) return { name: 'Particulate Matter 10.0', unit: 'µg/m³', min: 0, max: 50, warn: 75 };
    if (p.includes('pm2.5')) return { name: 'Particulate Matter 2.5', unit: 'µg/m³', min: 0, max: 35, warn: 45 };
    if (p.includes('pm1')) return { name: 'Particulate Matter 1.0', unit: 'µg/m³', min: 0, max: 15, warn: 25 };
    if (p.includes('temp')) return { name: 'Ambient Temperature', unit: '°C', min: 18, max: 28, warn: 32 };
    if (p.includes('humid')) return { name: 'Relative Humidity', unit: '% RH', min: 30, max: 70, warn: 80 };
    if (p.includes('noise')) return { name: 'Acoustic Sound', unit: 'dB', min: 30, max: 75, warn: 85 };
    if (p.includes('volt')) return { name: 'Line Voltage', unit: 'V', min: 210, max: 250, warn: 255 };
    if (p.includes('curr')) return { name: 'Line Current', unit: 'A', min: 0.1, max: 15, warn: 16 };
    if (p.includes('power')) return { name: 'Real Power Demand', unit: 'kW', min: 0.1, max: 10, warn: 12 };
    if (p.includes('energ')) return { name: 'Accumulated Energy', unit: 'kWh', min: 0, max: 5000, warn: 5200 };
    if (p.includes('flow')) return { name: 'Discharge Flow', unit: 'L/min', min: 10, max: 80, warn: 85 };
    if (p.includes('pres')) return { name: 'Pipe Pressure', unit: 'Bar', min: 1.5, max: 5.5, warn: 6.0 };
    if (p.includes('vol')) return { name: 'Volumetric Total', unit: 'm³', min: 0, max: 1000, warn: 1050 };
    return { name: param, unit: 'units', min: 0, max: 100, warn: 110 };
  };

  const isLocationParam = (p: string) => {
    const low = p.toLowerCase();
    return low.includes('lat') || low.includes('long') || low.includes('lng') || low.includes('latitude') || low.includes('longitude') || low.includes('gsp') || low.includes('gps');
  };

  const getDeviceThresholdRows = (typeFilter: string) => {
    const rows: any[] = [];
    devices
      .filter(d => typeFilter === 'air' ? (d.type === 'air' || d.type === 'motion') : d.type === typeFilter)
      .forEach(d => {
        const schema = d.dataSchema || (d.type === 'air' ? ['pm1', 'pm2.5', 'pm10', 'temperature', 'Humidity', 'Noise'] : d.type === 'energy' ? ['voltage', 'current', 'power', 'energy'] : ['flowRate', 'pressure', 'totalVolume']);
        
        schema.forEach((param: string) => {
          if (isLocationParam(param)) return;
          
          const spec = getParamSpec(param);
          const edited = editedValues[`${d.id}_${param}`];
          
          rows.push({
            id: `${d.id}_${param}`,
            sensorId: d.id,
            deviceName: d.name,
            deviceModel: d.model,
            loc: `${d.location || 'HQ'}`,
            paramName: param,
            paramLabel: spec.name,
            min: edited ? edited.min : spec.min,
            max: edited ? edited.max : spec.max,
            warn: edited ? edited.warn : spec.warn,
            unit: spec.unit,
            status: d.status === 'ok' ? 'Online' : d.status === 'warn' ? 'Watch' : 'Offline'
          });
        });
      });
    return rows;
  };

  const airSensors = getDeviceThresholdRows('air');
  const energySensors = getDeviceThresholdRows('energy');
  const waterSensors = getDeviceThresholdRows('water');

  const filterRow = (row: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      row.sensorId.toLowerCase().includes(q) ||
      row.paramLabel.toLowerCase().includes(q) ||
      row.paramName.toLowerCase().includes(q) ||
      row.loc.toLowerCase().includes(q) ||
      row.deviceName.toLowerCase().includes(q)
    );
  };

  const filteredAir = airSensors.filter(filterRow);
  const filteredEnergy = energySensors.filter(filterRow);
  const filteredWater = waterSensors.filter(filterRow);

  const handleValueChange = (rowId: string, field: 'min' | 'max' | 'warn', value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;

    // Get current values to validate
    const existing = editedValues[rowId];
    const defaultSpec = getParamSpec(rowId.split('_')[1] || '');
    
    const current = {
      min: existing ? existing.min : defaultSpec.min,
      max: existing ? existing.max : defaultSpec.max,
      warn: existing ? existing.warn : defaultSpec.warn,
      ...{ [field]: num }
    };

    // Construct validation check
    let errorMsg = '';
    if (current.min >= current.max) {
      errorMsg = 'Min bound must be strictly less than Max bound';
    } else if (current.max >= current.warn) {
      errorMsg = 'Max bound must be below critical warning limit';
    }

    setValidationErrors(prev => {
      const updated = { ...prev };
      if (errorMsg) updated[rowId] = errorMsg;
      else delete updated[rowId];
      return updated;
    });

    setEditedValues(prev => ({
      ...prev,
      [rowId]: current
    }));
  };

  const handleResetThresholds = () => {
    setEditedValues({});
    setValidationErrors({});
    setSaveStatus('All parameter limits restored to hardware presets.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleSaveThresholds = () => {
    if (Object.keys(validationErrors).length > 0) {
      alert('Cannot save limits! Please resolve highlighted validation bound errors first.');
      return;
    }
    setSaveStatus('Thresholds successfully saved and deployed!');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  // Triggers professional step-by-step connection test synchronization
  const triggerManualSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStep(1);
    
    // Simulate real logs going through steps
    const ts = () => new Date().toLocaleTimeString();
    
    setLiveLog(prev => [
      ...prev,
      `[${ts()}] ACTION: User triggered Manual Ingress Pipeline synchronization.`,
      `[${ts()}] STEP 1: Querying active device registers for AeroSafe, EnergyWatch and AquaGuard...`
    ]);

    setTimeout(() => {
      setSyncStep(2);
      setLiveLog(prev => [
        ...prev,
        `[${ts()}] STEP 2: Downloading buffer packets... Found ${Math.floor(Math.random() * 250) + 120} non-flushed telemetry records.`,
        `[${ts()}] STEP 2: Compression optimization ratio output: 3.82:1 with GZIP scheme.`
      ]);
    }, 1200);

    setTimeout(() => {
      setSyncStep(3);
      setLiveLog(prev => [
        ...prev,
        `[${ts()}] STEP 3: Flushing buffer database sync into TimeSeries indices.`,
        `[${ts()}] STEP 3: Dispatching schema confirmations. No calibration drifts detected.`
      ]);
    }, 2400);

    setTimeout(() => {
      setSyncStep(4);
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsSyncing(false);
      setLiveLog(prev => [
        ...prev,
        `[${ts()}] COMPLETE: Network queue is pristine. Sync finalized successfully.`
      ]);
    }, 3500);
  };

  const handleSavePollingConfig = () => {
    const config = {
      pollingInterval,
      syncStrategy,
      bufferSize,
      compressPayload,
      retryAttempts,
      useBackoff,
      heartbeatTimeout
    };
    localStorage.setItem('nexus_polling_config', JSON.stringify(config));
    setSaveStatus('Polling and Sync configurations stored successfully.');
    setTimeout(() => setSaveStatus(null), 4000);
  };

  return (
    <div className="flex h-full animate-in fade-in duration-500 overflow-hidden transition-colors duration-200">
      <ConfigSidebar active={activeTab} setTab={setActiveTab} />
      
      <div className="flex-1 overflow-y-auto p-7 flex flex-col gap-6 scroll-smooth bg-bg-0 transition-colors duration-200">
        
        {/* Thresholds Panel */}
        {activeTab === 'thresholds' && (
          <div className="animate-in slide-in-from-right-2 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-base font-semibold">{t('sensorThresholds') || 'Device Threshold Configurations'}</h1>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Modify the acceptable ranges. When sensor bounds transition past thresholds, alerts are routed instantly.
                </p>
              </div>

              {/* Fast Parameters Global Filter query */}
              <div className="relative w-full max-w-xs shrink-0">
                <Search size={14} className="absolute left-3 top-2.5 text-text-muted" />
                <input 
                  type="text"
                  placeholder="Filter parameters or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-1 border border-border-main text-xs p-2.5 pl-9 rounded-lg focus:border-nexus-blue/80 focus:ring-1 focus:ring-nexus-blue/30 outline-none transition-all placeholder:text-text-muted/70"
                />
              </div>
            </div>

            {/* Quick Helper Banner */}
            {searchQuery && (
              <div className="bg-bg-1/80 border border-border-main/50 px-3.5 py-2 rounded-lg flex items-center justify-between text-xs mb-4">
                <div className="flex items-center gap-2 text-text-dim">
                  <SlidersHorizontal size={12} className="text-nexus-cyan" />
                  <span>Filtered down to active matching records</span>
                </div>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-nexus-blue font-semibold hover:underline"
                >
                  Clear filter
                </button>
              </div>
            )}
            
            <div className="space-y-6">
              {filteredAir.length > 0 && (
                <ThresholdCard 
                  title={t('airQuality') || 'Air Quality Domain'} 
                  type="AIR" 
                  colorClass="text-nexus-teal bg-nexus-teal/10"
                  sensors={filteredAir}
                  onValueChange={handleValueChange}
                  errors={validationErrors}
                />
              )}

              {filteredEnergy.length > 0 && (
                <ThresholdCard 
                  title="Energy Grid Domain" 
                  type="ENERGY" 
                  colorClass="text-nexus-purple bg-nexus-purple/10"
                  sensors={filteredEnergy}
                  onValueChange={handleValueChange}
                  errors={validationErrors}
                />
              )}

              {filteredWater.length > 0 && (
                <ThresholdCard 
                  title={t('waterSensors') || 'Water sentinel Domain'} 
                  type="WATER" 
                  colorClass="text-nexus-blue bg-nexus-blue/10"
                  sensors={filteredWater}
                  onValueChange={handleValueChange}
                  errors={validationErrors}
                />
              )}

              {filteredAir.length === 0 && filteredEnergy.length === 0 && filteredWater.length === 0 && (
                <div className="bg-bg-1 border border-border-main border-dashed py-14 flex flex-col items-center justify-center text-center rounded-xl p-6">
                  <Search size={32} className="text-text-muted opacity-30 mb-2.5" />
                  <p className="text-sm font-semibold text-text-main">No active parameters match your search query</p>
                  <p className="text-xs text-text-muted mt-0.5">Try searching with other tags, sectors, models, or sensor names.</p>
                </div>
              )}
            </div>
            
            {/* Deploy Controls Dashboard */}
            <div className="mt-8 bg-bg-1 border border-border-main p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl shadow-sm">
              <div className="text-[11px] text-text-muted flex items-center gap-2">
                {saveStatus ? (
                  <span className="text-nexus-teal font-extrabold flex items-center gap-1.5 animate-pulse">
                    ✓ {saveStatus}
                  </span>
                ) : Object.keys(validationErrors).length > 0 ? (
                  <span className="text-nexus-red font-semibold flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle size={13} /> Please correct the boundary overlap mistakes highlighted in red.
                  </span>
                ) : (
                  <>
                    <span className="text-nexus-amber font-bold">⚠</span> 
                    {language === 'en' ? 'Unsaved changes — Limits will take effect immediately upon hardware deployment' : 'Kuna mabadiliko hayajahifadhiwa'}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleResetThresholds}
                  className="px-4 py-2 text-xs font-semibold text-text-dim border border-border-main rounded-lg hover:bg-bg-3 hover:text-text-main transition-all whitespace-nowrap"
                >
                  Reset Defaults
                </button>
                <button 
                  onClick={handleSaveThresholds}
                  disabled={Object.keys(validationErrors).length > 0}
                  className={cn(
                    "px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all shadow-sm whitespace-nowrap",
                    Object.keys(validationErrors).length > 0 
                      ? "bg-text-muted cursor-not-allowed opacity-50"
                      : "bg-nexus-blue hover:bg-nexus-blue/90"
                  )}
                >
                  {t('saveThresholds') || 'Deploy Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Polling & Synchronization Panel */}
        {activeTab === 'polling' && (
          <div className="animate-in slide-in-from-right-2 duration-300 space-y-6">
            <div>
              <h1 className="text-base font-semibold">{t('polling') || 'Polling & Network Synchronization'}</h1>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Configure rate cycles, communication protocols, edge memory queues, and timeout thresholds for IoT ingestion loops.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form panel */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Loop controls card */}
                <div className="bg-bg-1 border border-border-main rounded-xl p-5 space-y-5 shadow-sm">
                  <div className="flex items-center gap-2 pb-3 border-b border-border-main/50">
                    <Settings2 size={16} className="text-nexus-blue" />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-text-main">Ingress Protocol Parameters</h2>
                  </div>

                  {/* Sync strategy selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold text-text-dim uppercase mb-2">Synchronization Strategy</label>
                      <div className="space-y-2">
                        {[
                          { id: 'websocket', label: 'Continuous WebSockets', desc: 'Persistent duplex channel' },
                          { id: 'rest_poll', label: 'Periodic REST Pulling', desc: 'Intermittent interval querying' },
                          { id: 'mqtt_demand', label: 'MQTT Demand Pipeline', desc: 'Trigger-based keepalive' }
                        ].map(opt => (
                          <label 
                            key={opt.id}
                            className={cn(
                              "flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all",
                              syncStrategy === opt.id 
                                ? "bg-nexus-blue/5 border-nexus-blue/50 text-nexus-blue font-medium" 
                                : "bg-bg-0/30 border-border-main hover:bg-bg-2"
                            )}
                          >
                            <input 
                              type="radio" 
                              name="sync_strat" 
                              checked={syncStrategy === opt.id}
                              onChange={() => setSyncStrategy(opt.id)}
                              className="mt-0.5 accent-nexus-blue"
                            />
                            <div>
                              <div>{opt.label}</div>
                              <div className="text-[10px] text-text-muted font-normal">{opt.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Polling cycles slide */}
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-text-dim mb-1">
                          <span className="uppercase">Ingestion Rate Cycle</span>
                          <span className="text-nexus-cyan font-mono">{pollingInterval} seconds</span>
                        </div>
                        <input 
                          type="range" 
                          min={1} 
                          max={300} 
                          value={pollingInterval} 
                          onChange={(e) => setPollingInterval(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-bg-2 rounded-lg appearance-none cursor-pointer accent-nexus-blue"
                        />
                        <div className="flex justify-between text-[9px] text-text-muted mt-1.5 uppercase font-mono">
                          <span>1s (Real-time)</span>
                          <span>60s (Medium)</span>
                          <span>300s (ECO)</span>
                        </div>
                      </div>

                      {/* Heartbeat Timeout */}
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-text-dim mb-1">
                          <span className="uppercase">Heartbeat Timeout Limit</span>
                          <span className="text-nexus-amber font-mono">{heartbeatTimeout} seconds</span>
                        </div>
                        <input 
                          type="range" 
                          min={5} 
                          max={600} 
                          value={heartbeatTimeout} 
                          onChange={(e) => setHeartbeatTimeout(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-bg-2 rounded-lg appearance-none cursor-pointer accent-nexus-amber"
                        />
                        <p className="text-[10px] text-text-muted mt-1.5 leading-relaxed">
                          Marks nodes as <span className="text-nexus-amber font-bold">Watch</span> if they stop broadcasting telemetry past this span.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Buffer configurations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-border-main/40">
                    <div>
                      <label className="block text-[11px] font-bold text-text-dim uppercase mb-1.5">Edge Record Queue Buffer</label>
                      <div className="flex gap-2.5 items-center">
                        <Database size={15} className="text-text-muted shrink-0" />
                        <input 
                          type="number"
                          min={50}
                          max={10000}
                          step={50}
                          value={bufferSize}
                          onChange={(e) => setBufferSize(parseInt(e.target.value) || 500)}
                          className="w-28 bg-bg-2 border border-border-main text-xs p-2 rounded-lg text-right font-mono focus:border-nexus-blue outline-none transition-colors"
                        />
                        <span className="text-[11px] text-text-muted font-medium">packets/device</span>
                      </div>
                      <p className="text-[10px] text-text-muted mt-1.5 leading-relaxed">
                        Max buffers archived in secure gateway local flash storage before clearing.
                      </p>
                    </div>

                    {/* Checkbox fields */}
                    <div className="flex flex-col justify-center space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={compressPayload}
                          onChange={(e) => setCompressPayload(e.target.checked)}
                          className="w-4 h-4 accent-nexus-blue rounded border-border-main"
                        />
                        <div>
                          <div className="text-xs font-semibold text-text-main">Enable GZIP Payload Compression</div>
                          <p className="text-[10px] text-text-muted font-normal mt-0.5">Saves ~73% ingress data transit consumption</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={useBackoff}
                          onChange={(e) => setUseBackoff(e.target.checked)}
                          className="w-4 h-4 accent-nexus-blue rounded border-border-main"
                        />
                        <div>
                          <div className="text-xs font-semibold text-text-main">Exponential Backoff Strategy</div>
                          <p className="text-[10px] text-text-muted font-normal mt-0.5">Multiplies delay dynamically on reconnect drops</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Reconnect fail limits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-border-main/40">
                    <div>
                      <label className="block text-[11px] font-bold text-text-dim uppercase mb-1.5">Max Dropped Broadcast Retries</label>
                      <input 
                        type="number"
                        min={1}
                        max={10}
                        value={retryAttempts}
                        onChange={(e) => setRetryAttempts(parseInt(e.target.value) || 3)}
                        className="w-20 bg-bg-2 border border-border-main text-xs p-2 rounded-lg text-right font-mono focus:border-nexus-blue outline-none transition-colors"
                      />
                      <p className="text-[10px] text-text-muted mt-1.5">
                        Failed checks before triggering alert pipelines.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confirm Save / Discard */}
                <div className="bg-bg-1 border border-border-main p-4 flex items-center justify-between rounded-xl shadow-sm">
                  <div className="text-[11px] text-text-muted">
                    {saveStatus ? (
                      <span className="text-nexus-teal font-extrabold flex items-center gap-1.5 animate-pulse">
                        ✓ {saveStatus}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Info size={12} className="text-nexus-blue" />
                        Settings applied locally dynamically. Build profiles saved on commit.
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSavePollingConfig}
                      className="px-4 py-2 text-xs font-semibold bg-nexus-blue text-white rounded-lg hover:bg-nexus-blue/90"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced Network Terminal Widget */}
              <div className="space-y-6">
                
                {/* Real-time sync console and Manual trigger */}
                <div className="bg-bg-1 border border-border-main rounded-xl p-5 shadow-sm flex flex-col h-[340px]">
                  <div className="flex items-center justify-between pb-3 border-b border-border-main/50 mb-3">
                    <div className="flex items-center gap-2">
                      <Radio size={14} className={cn("text-nexus-teal animate-pulse", isSyncing && "text-nexus-blue")} />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-main">Network Diagnostics</h3>
                    </div>
                    <span className="bg-nexus-teal/10 text-nexus-teal text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">
                      ONLINE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                    <div className="bg-bg-0 border border-border-main/50 p-2 rounded-lg">
                      <div className="text-[10px] text-text-muted uppercase">Last Sync Time</div>
                      <div className="text-xs font-semibold text-text-main mt-0.5">{lastSyncTime}</div>
                    </div>
                    <div className="bg-bg-0 border border-border-main/50 p-2 rounded-lg">
                      <div className="text-[10px] text-text-muted uppercase">Ingress Success</div>
                      <div className="text-xs font-semibold text-nexus-teal mt-0.5">99.98%</div>
                    </div>
                  </div>

                  {/* Diagnostic details scrolling JSON console */}
                  <div className="flex-1 bg-black text-[#51ff51] font-mono text-[9px] p-2.5 rounded-lg overflow-y-auto" ref={logContainerRef}>
                    <div className="text-[8px] border-b border-white/20 pb-1 mb-1 text-white/60">LIVE PACKET TRANSPORT SNIFFER</div>
                    {liveLog.map((log, index) => (
                      <div key={index} className="leading-relaxed mb-1 break-all select-all hover:bg-white/10">{log}</div>
                    ))}
                  </div>

                  {/* Manual Syncer button with loading spinner states */}
                  <button 
                    onClick={triggerManualSync}
                    disabled={isSyncing}
                    className={cn(
                      "mt-4 w-full text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all",
                      isSyncing 
                        ? "bg-bg-3 border border-border-main text-text-muted cursor-not-allowed" 
                        : "bg-nexus-cyan text-black hover:bg-nexus-cyan/90 font-bold"
                    )}
                  >
                    <RefreshCw size={13} className={cn("shrink-0", isSyncing && "animate-spin")} />
                    <span>{isSyncing ? `Running (Step ${syncStep}/4)...` : 'Force Manual Synchronize'}</span>
                  </button>
                </div>

                {/* Interactive synchronization track step visualizer */}
                {isSyncing && (
                  <div className="bg-bg-1 border border-border-main rounded-xl p-4 space-y-3.5 shadow-sm animate-in zoom-in-95 duration-200">
                    <h4 className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Sync Sequence Track</h4>
                    <div className="space-y-2">
                      {[
                        { step: 1, label: 'Query active sensor registries' },
                        { step: 2, label: 'Decompress gateway buffer packets' },
                        { step: 3, label: 'Batch write time-series index rows' },
                        { step: 4, label: 'Verify signal drift parameters' },
                      ].map((item) => (
                        <div key={item.step} className="flex items-center gap-2.5 text-xs">
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border",
                            syncStep > item.step 
                              ? "bg-nexus-teal border-nexus-teal text-black" 
                              : syncStep === item.step 
                              ? "bg-nexus-blue border-nexus-blue text-white animate-pulse" 
                              : "bg-bg-2 border-border-main text-text-muted"
                          )}>
                            {syncStep > item.step ? '✓' : item.step}
                          </div>
                          <span className={cn(
                            syncStep >= item.step ? "text-text-main font-semibold" : "text-text-muted"
                          )}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Outer remaining settings placeholder blocks */}
        {activeTab !== 'thresholds' && activeTab !== 'polling' && (
           <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted opacity-50">
             <Sliders size={48} className="opacity-20" />
             <div className="text-center">
               <div className="text-sm font-semibold capitalize prose-none">{activeTab.replace(/([A-Z])/g, ' $1').trim()} Settings</div>
               <p className="text-[11px] mt-1">This configuration panel is under development and will be connected in future releases.</p>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}

// Highly stylized, advanced Threshold config table
function ThresholdCard({ title, type, colorClass, sensors, onValueChange, errors }: any) {
  return (
    <div className="bg-bg-1 border border-border-main rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-[14px_18px] border-b border-border-main/70 flex items-center justify-between bg-bg-1/40">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className={cn("text-nexus-cyan", type === 'ENERGY' ? 'text-nexus-purple' : type === 'WATER' ? 'text-nexus-blue' : 'text-nexus-teal')} />
          <div>
            <div className="text-[13px] font-bold text-text-main leading-none">{title}</div>
            <p className="text-[10px] text-text-muted mt-1">Configuring trigger bounds. All location telemetry and GPS coordinate streams mapped externally.</p>
          </div>
        </div>
        <span className={cn("text-[9px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm select-none", colorClass)}>
          {type} Segment
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-main bg-bg-2/20">
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">{type} NODE ID</th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Device Parameter / Metric</th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Site Zone</th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">MIN TRIGGER</th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">MAX TRIGGER</th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">CRIT WARNING</th>
              <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main/40">
            {sensors.map((s: any) => {
              const hasValError = errors && errors[s.id];
              return (
                <tr 
                  key={s.id} 
                  className={cn(
                    "hover:bg-bg-3/40 transition-all select-none group border-l-2",
                    hasValError ? "border-l-nexus-red bg-nexus-red/5" : "border-l-transparent"
                  )}
                >
                  {/* Node reference */}
                  <td className="px-4 py-3 font-mono text-[11px] text-nexus-cyan font-bold whitespace-nowrap">
                    {s.sensorId}
                  </td>
                  
                  {/* Parameter name with micro label */}
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    <div className="font-semibold text-text-main group-hover:text-nexus-blue transition-colors">{s.paramLabel}</div>
                    <div className="text-[9px] font-mono text-text-muted uppercase mt-0.5 tracking-wider">{s.paramName}</div>
                  </td>

                  {/* Clean site location with tag styling */}
                  <td className="px-4 py-3 text-text-dim text-xs whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-bg-2 text-[11px] text-text-main font-medium border border-border-main/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-text-muted shrink-0" />
                      {s.loc}
                    </div>
                  </td>

                  {/* Input min value changes styled with bounds control warnings */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <input 
                        type="number"
                        step="0.1"
                        onChange={(e) => onValueChange(s.id, 'min', e.target.value)}
                        className={cn(
                          "w-16 bg-bg-2 border font-mono text-[11px] rounded px-1.5 py-1 text-text-main text-right outline-none transition-all shadow-inner",
                          hasValError 
                            ? "border-nexus-red focus:ring-1 focus:ring-nexus-red" 
                            : "border-border-main focus:border-nexus-blue focus:ring-1 focus:ring-nexus-blue/30"
                        )}
                        defaultValue={s.min} 
                      />
                      <span className="text-[10px] font-mono font-semibold text-text-muted w-10 text-left shrink-0">{s.unit}</span>
                    </div>
                  </td>

                  {/* Input max value changes styled */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <input 
                        type="number"
                        step="0.1"
                        onChange={(e) => onValueChange(s.id, 'max', e.target.value)}
                        className={cn(
                          "w-16 bg-bg-2 border font-mono text-[11px] rounded px-1.5 py-1 text-text-main text-right outline-none transition-all shadow-inner",
                          hasValError 
                            ? "border-nexus-red focus:ring-1 focus:ring-nexus-red" 
                            : "border-border-main focus:focus:border-nexus-blue focus:ring-1 focus:ring-nexus-blue/30"
                        )}
                        defaultValue={s.max} 
                      />
                      <span className="text-[10px] font-mono font-semibold text-text-muted w-10 text-left shrink-0">{s.unit}</span>
                    </div>
                  </td>

                  {/* Input warn value changes styled */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <input 
                        type="number"
                        step="0.1"
                        onChange={(e) => onValueChange(s.id, 'warn', e.target.value)}
                        className={cn(
                          "w-16 bg-bg-2 border font-mono text-[11px] rounded px-1.5 py-1 text-text-main text-right outline-none transition-all shadow-inner",
                          hasValError 
                            ? "border-nexus-red focus:ring-1 focus:ring-nexus-red" 
                            : "border-border-main focus:focus:border-nexus-blue focus:ring-1 focus:ring-nexus-blue/30"
                        )}
                        defaultValue={s.warn} 
                      />
                      <span className="text-[10px] font-mono font-semibold text-text-muted w-10 text-left shrink-0">{s.unit}</span>
                    </div>
                  </td>

                  {/* Status Indicator bubble */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-[9px] font-extrabold px-2 py-0.5 rounded-full select-none inline-flex items-center gap-1 tracking-wider border",
                      s.status === 'Online' ? "bg-nexus-teal/15 border-nexus-teal/25 text-nexus-teal" : 
                      s.status === 'Watch' || s.status === 'Degraded' ? "bg-nexus-amber/15 border-nexus-amber/25 text-nexus-amber" : 
                      "bg-nexus-red/15 border-nexus-red/25 text-nexus-red"
                    )}>
                      <span className={cn(
                        "w-1 h-1 rounded-full",
                        s.status === 'Online' ? "bg-nexus-teal animate-pulse" : 
                        s.status === 'Watch' || s.status === 'Degraded' ? "bg-nexus-amber" : 
                        "bg-nexus-red"
                      )} />
                      {s.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Embedded footer warning if some error validation tags overlap */}
      {Object.values(errors || {}).some((val: any) => sensors.some((s: any) => s.id === val)) && (
        <div className="bg-nexus-red/10 px-4 py-2 border-t border-nexus-red/20 text-nexus-red text-[11px] font-medium flex items-center gap-1.5">
          <AlertTriangle size={13} /> Bound overlapping detected: Ensure Min &lt; Max &lt; Warning settings.
        </div>
      )}
    </div>
  );
}
