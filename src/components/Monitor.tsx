import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Wind, 
  Zap, 
  Droplets, 
  Activity, 
  Wifi, 
  Radio, 
  MapPin, 
  Navigation, 
  Settings as SettingsIcon, 
  Database, 
  Maximize2, 
  RefreshCw, 
  Sliders, 
  Cpu, 
  Layers, 
  Globe, 
  Terminal, 
  CircleDot, 
  Clock, 
  ArrowUpRight, 
  Check, 
  Play, 
  Pause,
  CloudLightning,
  HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Map as PigeonMap, Overlay as PigeonOverlay } from 'pigeon-maps';

const cartoDarkProvider = (x: number, y: number, z: number) => {
  return `https://basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`;
};

interface SensorDevice {
  id: string;
  name: string;
  type: 'air' | 'energy' | 'water' | 'motion';
  model: string;
  status: 'ok' | 'warn' | 'crit';
  location: string;
  lat?: number;
  lng?: number;
  lastSeen: string;
  battery?: number;
  signal?: number;
  ip: string;
  dataSchema: string[];
  communication?: 'gsm' | 'wifi';
  installationDate?: string;
  buildingSite?: string;
  protocol?: string;
  interval?: string;
  gatewayId?: string;
  firmware?: string;
}

// Fallback high-fidelity initial devices list if none exist, matching system-wide Registry
const DEFAULT_DEVICES: SensorDevice[] = [
  { 
    id: 'SN-2026-0101', 
    name: 'AeroSafe', 
    model: 'AQ-001', 
    type: 'air', 
    status: 'ok', 
    location: 'KICUKIRO', 
    lat: -1.9462,
    lng: 30.2059,
    lastSeen: '2m ago', 
    battery: 88, 
    signal: -45,
    firmware: 'v2.1.4', 
    ip: '192.168.1.45',
    dataSchema: ['pm1', 'pm2.5', 'pm10', 'temperature', 'Humidity', 'Noise'],
    communication: 'wifi',
    installationDate: '2026-05-21',
    buildingSite: 'KICUKIRO MARKET',
    protocol: 'WiFi Local Gateway'
  },
  { 
    id: 'SN-2026-0102', 
    name: 'EnergyWatch', 
    model: 'EW-042', 
    type: 'energy', 
    status: 'ok', 
    location: 'REBERO', 
    lat: -1.9680,
    lng: 30.0920,
    lastSeen: 'Now', 
    signal: -32,
    firmware: 'v3.1.0', 
    ip: '192.168.1.112',
    dataSchema: ['voltage', 'current', 'power', 'energy'],
    communication: 'gsm',
    installationDate: '2026-04-18',
    buildingSite: 'REBERO CENTER',
    protocol: '4G/LTE Cellular'
  },
  { 
    id: 'SN-2026-0103', 
    name: 'AquaGuard', 
    model: 'AG-012', 
    type: 'water', 
    status: 'ok', 
    location: 'NYARUGENGE', 
    lat: -1.9448,
    lng: 30.0618,
    lastSeen: '5m ago', 
    battery: 12, 
    signal: -78,
    firmware: 'v1.0.8', 
    ip: '192.168.1.18',
    dataSchema: ['flowRate', 'pressure', 'totalVolume'],
    communication: 'gsm',
    installationDate: '2026-05-02',
    buildingSite: 'NYARUGENGE HUB',
    protocol: 'LoRaWAN Network'
  }
];

// High fidelity metrics simulation configuration
const generateRandomVal = (field: string) => {
  const norm = field.toLowerCase();
  if (norm.includes('pm10')) return Math.floor(14 + Math.random() * 6);
  if (norm.includes('pm2.5')) return Math.floor(7 + Math.random() * 4);
  if (norm.includes('pm1')) return Math.floor(3 + Math.random() * 2);
  if (norm.includes('temp')) return parseFloat((21.5 + Math.random() * 5).toFixed(1));
  if (norm.includes('humid')) return Math.floor(48 + Math.random() * 12);
  if (norm.includes('noise')) return Math.floor(40 + Math.random() * 18);
  if (norm.includes('voltage')) return parseFloat((224.2 + Math.random() * 4.5).toFixed(1));
  if (norm.includes('current')) return parseFloat((1.8 + Math.random() * 2.2).toFixed(2));
  if (norm.includes('power')) return parseFloat((380.0 + Math.random() * 80).toFixed(1));
  if (norm.includes('flow')) return parseFloat((16.2 + Math.random() * 6).toFixed(1));
  if (norm.includes('press')) return parseFloat((3.4 + Math.random() * 1.1).toFixed(1));
  if (norm.includes('volume')) return Math.floor(1680 + Math.random() * 150);
  return Math.floor(15 + Math.random() * 75);
};

const getFieldNameDescription = (field: string) => {
  const f = field.toLowerCase();
  if (f === 'pm1') return { name: 'Particulate Matter 1.0', unit: 'µg/m³', type: 'Dust Density' };
  if (f === 'pm2.5') return { name: 'Particulate Matter 2.5', unit: 'µg/m³', type: 'Coarse Dust' };
  if (f === 'pm10') return { name: 'Particulate Matter 10.0', unit: 'µg/m³', type: 'Fine Dust/Soot' };
  if (f === 'temperature') return { name: 'Ambient Temp', unit: '°C', type: 'Thermodynamics' };
  if (f === 'humidity') return { name: 'Relative Humidity', unit: '% RH', type: 'Atmospheric State' };
  if (f === 'noise') return { name: 'Acoustic Vol', unit: 'dB', type: 'Environmental Sound' };
  if (f === 'voltage') return { name: 'AC Grid Voltage', unit: 'V', type: 'Electrical Pressure' };
  if (f === 'current') return { name: 'AC Circuit Current', unit: 'A', type: 'Electrical Flow' };
  if (f === 'power') return { name: 'Instant Active Power', unit: 'kW', type: 'Electric Load' };
  if (f === 'energy') return { name: 'Intermittent Energy', unit: 'kWh', type: 'Total Consumed Accumulation' };
  if (f === 'flowrate') return { name: 'Discharge Flow Rate', unit: 'L/min', type: 'Fluid Dynamics' };
  if (f === 'pressure') return { name: 'Intra-pipe Pressure', unit: 'Bar', type: 'Liquid Force' };
  if (f === 'totalvolume') return { name: 'Accumulation Volume', unit: 'm³', type: 'Volumetric Sum' };
  return { name: field, unit: 'units', type: 'Unspecified Parameter' };
};

export default function Monitor() {
  const [devices, setDevices] = useState<SensorDevice[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'air' | 'energy' | 'water'>('all');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  // Real-time interactive simulators
  const [liveData, setLiveData] = useState<Record<string, Record<string, number>>>({});
  const [history, setHistory] = useState<Record<string, Record<string, number[]>>>({});
  const [rawLogs, setRawLogs] = useState<Array<{ time: string; deviceId: string; data: string }>>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [mapZoom, setMapZoom] = useState(13);

  // Initialize devices on mount
  useEffect(() => {
    const saved = localStorage.getItem('nexus_sensors');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SensorDevice[];
        if (parsed && parsed.length > 0) {
          // Keep only types matching air/energy/water
          const filtered = parsed.filter(d => ['air', 'energy', 'water'].includes(d.type));
          setDevices(filtered);
          if (filtered.length > 0) {
            setSelectedDeviceId(filtered[0].id);
          }
          return;
        }
      } catch (e) {
        console.error('Failed to load registered devices:', e);
      }
    }
    // Fallback to defaults
    setDevices(DEFAULT_DEVICES);
    setSelectedDeviceId(DEFAULT_DEVICES[0].id);
    localStorage.setItem('nexus_sensors', JSON.stringify(DEFAULT_DEVICES));
  }, []);

  // Filter devices list depending on categories
  const filteredDevices = useMemo(() => {
    return devices.filter(d => activeTab === 'all' ? true : d.type === activeTab);
  }, [devices, activeTab]);

  // Read current active device
  const selectedDevice = useMemo(() => {
    return devices.find(d => d.id === selectedDeviceId) || filteredDevices[0] || null;
  }, [devices, selectedDeviceId, filteredDevices]);

  // Standard live metric stream loops
  useEffect(() => {
    if (isPaused || devices.length === 0) return;

    const runSimulationStep = () => {
      setLiveData(prevData => {
        const nextData = { ...prevData };
        setHistory(prevHist => {
          const nextHist = { ...prevHist };
          const logEntries: Array<{ time: string; deviceId: string; data: string }> = [];

          devices.forEach(dev => {
            // Only update live metrics if status is online / warning
            if (dev.status === 'crit') return;

            const devData: Record<string, number> = {};
            const devHist = nextHist[dev.id] || {};

            dev.dataSchema.forEach(field => {
              const currentVal = generateRandomVal(field);
              devData[field] = currentVal;

              const fieldHist = devHist[field] || [];
              devHist[field] = [...fieldHist, currentVal].slice(-16);
            });

            nextData[dev.id] = devData;
            nextHist[dev.id] = devHist;

            // Generate JSON raw log packets matching real WebSocket frames
            if (selectedDevice && dev.id === selectedDevice.id) {
              logEntries.push({
                time: new Date().toLocaleTimeString(),
                deviceId: dev.id,
                data: JSON.stringify({
                  event: 'telemetry_push',
                  deviceId: dev.id,
                  ip: dev.ip,
                  rssi: `${dev.signal ?? -52} dBm`,
                  metrics: devData
                })
              });
            }
          });

          if (logEntries.length > 0) {
            setRawLogs(prev => [...logEntries, ...prev].slice(0, 30));
          }

          return nextHist;
        });
        return nextData;
      });
    };

    // Run first wave of metrics on mount
    runSimulationStep();
    const interval = setInterval(runSimulationStep, 2000);
    return () => clearInterval(interval);
  }, [devices, isPaused, selectedDevice]);

  // Quick action options
  const handleRebootDevice = () => {
    if (!selectedDevice) return;
    alert(`Initiating standard remote diagnostic cycle on gateway for ${selectedDevice.name} (${selectedDevice.id})...`);
    // Briefly simulate log cycle
    setRawLogs(prev => [
      {
        time: new Date().toLocaleTimeString(),
        deviceId: selectedDevice.id,
        data: `[SYSTEM] CMD REBOOT SIGNAL SENT TO IP ${selectedDevice.ip}`
      },
      ...prev
    ]);
  };

  const handleManualPoll = () => {
    if (!selectedDevice) return;
    const now = new Date().toLocaleTimeString();
    setLiveData(prev => {
      const next = { ...prev };
      const data = next[selectedDevice.id] || {};
      selectedDevice.dataSchema.forEach(f => {
        data[f] = generateRandomVal(f);
      });
      next[selectedDevice.id] = data;
      return next;
    });
    setRawLogs(prev => [
      {
        time: now,
        deviceId: selectedDevice.id,
        data: `[SYSTEM] CMD DIRECT TELEMETRY POLL RECEIVED (STATUS: OK)`
      },
      ...prev
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-[#070d16] text-[#b4c6ef]">
      {/* Upper header segment */}
      <div className="px-6 py-5 border-b border-[#172134]/50 bg-[#0d1420]/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] border border-[#172134] shadow-inner">
            <Activity className="animate-pulse" size={22} />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-extrabold text-[#f1f5f9] tracking-tight flex items-center gap-2">
              <span>Live Monitor</span>
              <span className="bg-nexus-teal/15 text-nexus-teal border border-nexus-teal/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-nexus-teal animate-ping" />
                Active Stream
              </span>
            </h1>
            <p className="text-xs text-[#526a97]/90 font-medium">Real-time signal tracking and payload verification telemetry</p>
          </div>
        </div>

        {/* Global category selection Tabs */}
        <div className="flex flex-wrap items-center bg-[#090f1a] border border-[#172134]/60 p-1 rounded-xl gap-0.5 self-start md:self-center">
          {[
            { id: 'all', label: 'All Sensors', icon: Layers },
            { id: 'air', label: 'Air Quality', icon: Wind },
            { id: 'energy', label: 'Energy Grid', icon: Zap },
            { id: 'water', label: 'Water Sentinel', icon: Droplets }
          ].map(tab => {
            const Icon = tab.icon;
            const count = devices.filter(d => tab.id === 'all' ? true : d.type === tab.id).length;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  // Auto focus first device under tab
                  const matches = devices.filter(d => tab.id === 'all' ? true : d.type === tab.id);
                  if (matches.length > 0) {
                    setSelectedDeviceId(matches[0].id);
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer select-none",
                  active 
                    ? "bg-[#3b82f6] text-white shadow-xl scale-102" 
                    : "text-[#526a97] hover:bg-[#0c1322] hover:text-[#b4c6ef]"
                )}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
                <span className={cn(
                  "text-[9px] px-1.5 py-0.2 rounded font-black",
                  active ? "bg-white/20 text-white" : "bg-[#172134]/50 text-[#526a97]"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main double column split layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 overflow-hidden">
        
        {/* Left side list of online filtered devices */}
        <div className="xl:col-span-1 border-r border-[#172134]/40 bg-[#080d16]/95 overflow-y-auto flex flex-col p-4 space-y-3.5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-widest block">
              Live Devices ({filteredDevices.length})
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className={cn(
                  "p-1.5 rounded-lg border border-[#172134] text-[#526a97] hover:text-[#f1f5f9] bg-[#0c1322] cursor-pointer transition-all",
                  isPaused && "border-nexus-amber text-nexus-amber bg-nexus-amber/10"
                )}
                title={isPaused ? "Resume telemetry feed" : "Pause telemetry feed"}
              >
                {isPaused ? <Play size={11} /> : <Pause size={11} />}
              </button>
            </div>
          </div>

          <div className="space-y-2 flex-1">
            {filteredDevices.length === 0 ? (
              <div className="py-12 px-4 rounded-xl border border-dashed border-[#172134] text-center text-[#526a97]">
                <Database size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">No registered devices found.</p>
                <p className="text-[10px] italic mt-1">Add devices in the Device Registry panel.</p>
              </div>
            ) : (
              filteredDevices.map(device => {
                const isActive = selectedDeviceId === device.id;
                const statusColor = device.status === 'ok' ? 'text-nexus-teal border-nexus-teal/20' : 'text-nexus-amber border-nexus-amber/20';
                
                return (
                  <div
                    key={device.id}
                    onClick={() => setSelectedDeviceId(device.id)}
                    className={cn(
                      "group relative p-4 bg-[#0d1420]/50 border border-[#172134]/70 rounded-xl cursor-pointer text-left transition-all duration-200 select-none hover:border-[#3b82f6]/40",
                      isActive && "bg-[#13213a]/50 border-[#3b82f6]/70 shadow-lg scale-101"
                    )}
                  >
                    {/* Tiny glowing feed indicator */}
                    {!isPaused && device.status !== 'crit' && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-nexus-teal animate-ping" />
                        <span className="text-[8px] font-mono font-black uppercase text-nexus-teal">LIVE</span>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 shadow-sm",
                        device.type === 'air' ? "bg-nexus-teal/10 border-nexus-teal/20 text-nexus-teal" :
                        device.type === 'energy' ? "bg-nexus-purple/10 border-nexus-purple/20 text-nexus-purple" :
                        "bg-[#3b82f6]/10 border-[#3b82f6]/20 text-[#3b82f6]"
                      )}>
                        {device.type === 'air' && <Wind size={16} />}
                        {device.type === 'energy' && <Zap size={16} />}
                        {device.type === 'water' && <Droplets size={16} />}
                      </div>

                      <div className="space-y-1">
                        <p className="font-extrabold text-[#f1f5f9] text-xs leading-none group-hover:text-[#3b82f6] transition-colors">
                          {device.name}
                        </p>
                        <p className="text-[10px] font-mono font-bold text-[#526a97]">
                          {device.id} • {device.model}
                        </p>
                        <div className="flex items-center gap-2 pt-1 font-sans text-[10px] font-semibold text-[#94a3b8]">
                          <span className="inline-flex items-center">
                            <Wifi size={10} className="mr-1 text-nexus-teal/80" /> {device.signal ?? -45} dBm
                          </span>
                          <span>•</span>
                          <span>{device.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right side telemetry active cockpit */}
        <div className="xl:col-span-3 bg-[#070b12] overflow-y-auto p-6 flex flex-col space-y-6">
          {selectedDevice ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* --- 1:1 REPLICA OF THE REQUESTED DEVICE REGISTRY INFORMATION HERO PANEL --- */}
              <div className="relative bg-[#0d1420]/75 border border-[#172134]/70 rounded-2xl p-5 md:p-6 transition-all hover:border-[#3b82f6]/40 flex flex-col gap-5 text-left group">
                
                {/* High Contrast Vertical Status Accord Line */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-[5px] rounded-l-2xl",
                  selectedDevice.status === 'ok' ? "bg-nexus-teal" : "bg-nexus-amber"
                )} />

                {/* Main Header Container */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-1">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                       "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-inner",
                       selectedDevice.type === 'air' ? "bg-nexus-teal/10 border-nexus-teal/20 text-nexus-teal" :
                       selectedDevice.type === 'energy' ? "bg-nexus-purple/10 border-nexus-purple/20 text-nexus-purple" :
                       "bg-[#3b82f6]/10 border-[#3b82f6]/20 text-[#3b82f6]"
                    )}>
                      {selectedDevice.type === 'air' && <Wind size={22} />}
                      {selectedDevice.type === 'energy' && <Zap size={22} />}
                      {selectedDevice.type === 'water' && <Droplets size={22} />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-extrabold text-[#f1f5f9] text-base leading-tight select-all">
                          {selectedDevice.name} ({selectedDevice.model})
                        </h3>
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border shadow-inner",
                          selectedDevice.status === 'ok' ? "bg-nexus-teal/10 border-nexus-teal/25 text-nexus-teal animate-none" :
                          "bg-nexus-amber/10 border-nexus-amber/25 text-nexus-amber"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full mr-0.5", selectedDevice.status === 'ok' ? "bg-nexus-teal" : "bg-nexus-amber")} />
                          {selectedDevice.status === 'ok' ? 'HEALTHY' : 'DEGRADED'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] font-semibold flex-wrap select-all">
                        <span>Device ID: {selectedDevice.id}</span>
                        <span className="text-[#526a97]">•</span>
                        <span>Model: {selectedDevice.model}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational quick controls */}
                  <div className="flex items-center gap-2 self-start sm:self-center pr-1">
                    <button 
                      onClick={handleManualPoll}
                      className="p-2 px-3 bg-[#0c1322] hover:bg-[#3b82f6]/15 hover:text-[#3b82f6] text-text-muted border border-[#172134] rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-sm scale-95 hover:scale-100 cursor-pointer"
                      title="Remote Direct Poll"
                    >
                      <RefreshCw size={12} className={cn(!isPaused && "animate-pulse")} />
                      Force Poll
                    </button>
                    <button 
                      onClick={handleRebootDevice}
                      className="p-2 px-3 bg-[#0c1322] hover:bg-nexus-amber/15 hover:text-nexus-amber text-text-muted border border-[#172134] rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-sm scale-95 hover:scale-100 cursor-pointer"
                      title="Gateway Diagnostic Cycles"
                    >
                      <Cpu size={12} />
                      Reprovision
                    </button>
                  </div>
                </div>

                {/* Mid deck: Communication network and deployment physical location (Match 1:1) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 pb-4 border-t border-b border-[#172134]/50">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-wider block">COMMUNICATION PROTOCOL</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border leading-none transition-all duration-200 select-all shadow-inner",
                        selectedDevice.communication === 'gsm' 
                          ? "bg-[#6a3bf6]/10 border-[#8b5cf6]/25 text-[#d8b4fe]"
                          : "bg-[#0c1e35] border-[#0074BC] text-[#3b82f6]"
                      )}>
                        {selectedDevice.communication === 'gsm' ? (
                          <>
                            <Radio size={12} className="text-[#c084fc]" />
                            {selectedDevice.protocol || '4G/LTE Cellular Sim Network'}
                          </>
                        ) : (
                          <>
                            <Wifi size={12} className="text-[#3b82f6]" />
                            {selectedDevice.protocol || 'WiFi Local Gateway Network'}
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-wider block">DEPLOYMENT LOCATION</span>
                    <div className="flex items-center gap-3.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase border bg-[#1e293b]/50 border-[#334155] text-white">
                        <MapPin size={12} className="text-[#3b82f6] shrink-0" />
                        <span>{selectedDevice.location || 'HQ Complex A'}</span>
                      </span>
                      <span className="font-mono text-xs text-[#9dadd2] font-semibold select-all bg-[#0a101b] border border-[#172134] px-2.5 py-1 rounded-lg">
                        GPS: {selectedDevice.lat ? selectedDevice.lat.toFixed(4) : '-1.9462'}, {selectedDevice.lng ? selectedDevice.lng.toFixed(4) : '30.2059'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ingress payload fields and format mapping (Match 1:1) */}
                <div className="bg-[#080d16]/75 border border-[#172134]/70 rounded-xl p-4.5 space-y-2.5 transition-all text-left">
                  <span className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-widest block mb-2.5">
                    PAYLOAD FORMAT STRUCTURE
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDevice.dataSchema && selectedDevice.dataSchema.length > 0 ? (
                      selectedDevice.dataSchema.map((field, sIdx) => (
                        <span key={`${field}-${sIdx}`} className="bg-[#0e1627] text-[#f1f5f9] border border-[#17243c] rounded-lg px-2.5 py-1 text-xs font-mono font-medium shadow-inner select-all tracking-tight leading-none hover:border-[#3b82f6]/40 transition-colors">
                          {field}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-muted italic px-1">No schema contracts registered for this model ID.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid block mapping: Live Telemetry Gauges Content */}
              <div>
                <span className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-widest block mb-3 text-left">
                  Live Telemetry Streams
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedDevice.dataSchema.map((field) => {
                    const activeDevData = liveData[selectedDevice.id] || {};
                    const activeDevHistory = history[selectedDevice.id] || {};
                    const fieldHistory = activeDevHistory[field] || [];
                    const lastVal = activeDevData[field];
                    const meta = getFieldNameDescription(field);
                    
                    return (
                      <motion.div 
                        key={field}
                        layout
                        className="relative bg-[#0d1420]/75 border border-[#172134]/70 p-5 rounded-2xl overflow-hidden pl-7 group hover:border-[#3b82f6]/50 transition-all shadow-sm text-left"
                      >
                        {/* Status sidebar style */}
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-[4.5px]",
                          selectedDevice.type === 'air' ? 'bg-[#10B981]' :
                          selectedDevice.type === 'energy' ? 'bg-[#8B5CF6]' : 'bg-[#3B82F6]'
                        )} />
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-[10px] font-black tracking-widest text-[#94A3B8] uppercase">
                              {field}
                            </div>
                            <span className="text-[9px] font-semibold text-[#526a97] font-mono block mt-0.5 truncate max-w-[160px]" title={meta.name}>
                              {meta.name}
                            </span>
                          </div>
                          
                          <div className="w-8 h-8 rounded-full border border-[#172134]/60 bg-[#090f1a] flex items-center justify-center text-[#526a97]">
                            {selectedDevice.type === 'air' && <Wind size={14} />}
                            {selectedDevice.type === 'energy' && <Zap size={14} />}
                            {selectedDevice.type === 'water' && <Droplets size={14} />}
                          </div>
                        </div>
                        
                        <div className="mt-5 flex items-baseline">
                          <div className="text-3xl font-extrabold italic tracking-tighter text-[#f1f5f9] font-mono">
                            {lastVal !== undefined ? lastVal : '--'}
                          </div>
                          <div className="text-[10px] font-bold text-[#526a97] uppercase ml-1.5 font-sans tracking-wide">
                            {meta.unit}
                          </div>
                        </div>

                        {/* Telemetry scrolling historical sparklines */}
                        <div className="mt-5 flex items-center justify-between">
                          <span className="text-[9px] font-bold tracking-widest uppercase text-nexus-teal flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-nexus-teal rounded-full animate-ping" />
                            Streaming
                          </span>
                          
                          <div className="h-6 flex items-end gap-0.5 max-w-[110px]">
                            {fieldHistory.slice(-12).map((val, idx) => {
                              const max = Math.max(...(fieldHistory || [100]));
                              const min = Math.min(...(fieldHistory || [0]));
                              const range = max - min || 1;
                              const heightPercentage = ((val - min) / range) * 100;
                              return (
                                <div 
                                  key={idx}
                                  className="w-1.5 bg-[#3b82f6]/20 rounded-t-sm group-hover:bg-[#3b82f6]/40 transition-colors"
                                  style={{ height: `${Math.max(15, heightPercentage)}%` }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive dual console split: GPS Signal Tracker + Raw Telemetry Log */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Real-time Live Signal map tracking */}
                <div className="bg-[#0b0f19] border border-[#172134]/70 rounded-2xl p-5 flex flex-col justify-between text-left h-[370px]">
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] border border-[#172134]">
                        <Globe size={15} />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-[#f1f5f9] block">GPS Signal Lock</span>
                        <span className="text-[9px] text-[#526a97] uppercase font-bold">Latitude and Longitude pinpoint</span>
                      </div>
                    </div>
                    <div className="flex items-center bg-[#070b13] border border-[#172134] rounded-lg text-[9px] font-mono text-[#526a97] px-2 py-0.5">
                      ZOOM: {mapZoom}
                    </div>
                  </div>

                  <div className="flex-1 bg-[#070b13] rounded-xl overflow-hidden border border-[#172134]/50 relative">
                    <PigeonMap
                      center={[selectedDevice.lat || -1.9462, selectedDevice.lng || 30.2059]}
                      zoom={mapZoom}
                      onBoundsChanged={({ zoom }) => setMapZoom(zoom)}
                      provider={cartoDarkProvider}
                    >
                      <PigeonOverlay
                        anchor={[selectedDevice.lat || -1.9462, selectedDevice.lng || 30.2059]}
                        offset={[16, 16]}
                      >
                        <div className="relative flex flex-col items-center">
                          <div className="absolute inset-0 rounded-full bg-[#3b82f6] animate-ping opacity-30 w-8 h-8 -mt-4 -ml-4" style={{ animationDuration: '3s' }} />
                          <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-white border-2 border-[#0d1420] shadow-md z-10">
                            {selectedDevice.type === 'air' && <Wind size={13} />}
                            {selectedDevice.type === 'energy' && <Zap size={13} />}
                            {selectedDevice.type === 'water' && <Droplets size={13} />}
                          </div>
                          <div className="mt-1 bg-black/95 border border-[#3b82f6]/30 px-2 py-0.5 rounded text-[8px] font-black text-[#f1f5f9] whitespace-nowrap tracking-wider uppercase">
                            {selectedDevice.name}
                          </div>
                        </div>
                      </PigeonOverlay>
                    </PigeonMap>
                  </div>
                </div>

                {/* 2. Raw WebSocket/MQTT system stream console logs */}
                <div className="bg-[#0b0f19] border border-[#172134]/70 rounded-2xl p-5 flex flex-col justify-between text-left h-[370px]">
                  <div className="flex items-center justify-between pb-3 border-b border-[#172134]/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-nexus-teal/10 flex items-center justify-center text-nexus-teal border border-[#172134]">
                        <Terminal size={15} />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-[#f1f5f9] block">Data Payload Stream</span>
                        <span className="text-[9px] text-[#526a97] uppercase font-bold">Raw JSON WebSocket Frames</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-[9px] text-[#526a97] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-nexus-teal animate-pulse" />
                      Listening
                    </span>
                  </div>

                  <div className="flex-1 mt-3 bg-black/60 border border-[#172134]/60 p-3 rounded-xl font-mono text-[10px] text-nexus-teal overflow-y-auto leading-relaxed shadow-inner">
                    {rawLogs.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[#526a97]/60 italic">
                        Waiting for raw stream packets...
                      </div>
                    ) : (
                      rawLogs.map((log, lIdx) => (
                        <div key={lIdx} className="mb-2.5 border-b border-[#172134]/20 pb-2 text-left opacity-90 hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2 text-[9px] text-[#526a97] font-semibold">
                            <span className="text-nexus-teal">[{log.time}]</span>
                            <span>(ID: {log.deviceId})</span>
                          </div>
                          <pre className="mt-1 font-mono text-[9px] text-white/90 whitespace-pre-wrap break-all select-all pr-1">
                            {log.data}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[#526a97] py-20 border border-dashed border-[#172134] rounded-2xl m-6 bg-[#080d16]/30">
              <Database size={40} className="opacity-30 mb-3" />
              <h3 className="text-sm font-extrabold text-[#f1f5f9]">No device active</h3>
              <p className="text-xs max-w-[320px] mt-1 leading-relaxed">
                Choose a registered online gateway sensor to view high frequency stream gauges and mapping interfaces.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
