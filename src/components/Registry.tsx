import { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Activity, 
  Wind, 
  Zap, 
  Droplets,
  Trash2,
  Pencil,
  MapPin,
  Settings as SettingsIcon,
  CircleCheck,
  CircleAlert,
  CircleX,
  Navigation,
  ExternalLink,
  ChevronRight,
  Wifi,
  Radio,
  User,
  Shield,
  Copy,
  Check,
  Cpu,
  Tag,
  Globe,
  Monitor as MonitorIcon,
  Key,
  X,
  Info,
  Calendar,
  Code,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../lib/i18n';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { Map as PigeonMap, Overlay as PigeonOverlay } from 'pigeon-maps';
import GoogleMapsHelpModal from './GoogleMapsHelpModal';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

const cartoDarkProvider = (x: number, y: number, z: number) => {
  return `https://basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`;
};

interface SensorDevice {
  id: string;
  name: string;
  model: string;
  type: 'air' | 'energy' | 'water' | 'motion';
  status: 'ok' | 'warn' | 'crit';
  location: string;
  lat?: number;
  lng?: number;
  lastSeen: string;
  battery?: number;
  signal?: number; // RSSI in dBm
  firmware: string;
  ip: string;
  dataSchema: string[];
  communication: 'gsm' | 'wifi';
  installationDate?: string;
  buildingSite?: string;
  protocol?: string;
  interval?: string;
  gatewayId?: string;
}

interface RegistryUser {
  id: string;
  name: string;
  role: string;
  location: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline';
  lastSeen: string;
  email?: string;
  phone?: string;
  department?: string;
}

const DEVICES: SensorDevice[] = [
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
    dataSchema: ['pm1', 'pm2.5', 'pm10', 'temperature', 'Humidity', 'Noise', 'LAT', 'LONG', 'LAT', 'LONG'],
    communication: 'wifi',
    installationDate: '2026-05-21',
    buildingSite: 'KICUKIRO MARKET',
    protocol: 'WiFi Local Gateway Network'
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
    protocol: '4G/LTE Cellular Sim'
  },
  { 
    id: 'SN-2026-0103', 
    name: 'AquaGuard', 
    model: 'AG-012', 
    type: 'water', 
    status: 'warn', 
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
  },
  { 
    id: 'SN-2026-0104', 
    name: 'AeroSafe', 
    model: 'AQ-002', 
    type: 'air', 
    status: 'ok', 
    location: 'GISOZI', 
    lat: -1.9320,
    lng: 30.0825,
    lastSeen: '1m ago', 
    battery: 95, 
    signal: -52,
    firmware: 'v2.1.4', 
    ip: '192.168.1.46',
    dataSchema: ['pm1', 'pm2.5', 'pm10', 'temperature', 'Humidity', 'Noise', 'LAT', 'LONG', 'LAT', 'LONG'],
    communication: 'wifi',
    installationDate: '2026-05-10',
    buildingSite: 'GISOZI COMPLEX',
    protocol: 'WiFi Local Gateway Network'
  },
  { 
    id: 'SN-2026-0105', 
    name: 'EnergyWatch', 
    model: 'EW-043', 
    type: 'energy', 
    status: 'crit', 
    location: 'KIMIHURURA', 
    lat: -1.9510,
    lng: 30.0930,
    lastSeen: 'Disconnected', 
    signal: -95,
    firmware: 'v3.1.0', 
    ip: '192.168.1.115',
    dataSchema: ['voltage', 'current', 'power', 'energy'],
    communication: 'wifi',
    installationDate: '2026-03-22',
    buildingSite: 'KIMIHURURA SECTOR',
    protocol: 'WiFi Local Gateway Network'
  }
];

const REGISTRY_USERS: RegistryUser[] = [
  { 
    id: 'U-001', 
    name: 'Jean Luc', 
    role: 'Super Admin', 
    location: 'Kigali, Rwanda', 
    lat: -1.9441, 
    lng: 30.0619, 
    status: 'online', 
    lastSeen: 'Active now',
    email: 'ishimwe.jeanluc48@gmail.com',
    phone: '+250 788 111 222',
    department: 'Global Control Admin'
  },
  { 
    id: 'U-002', 
    name: 'Alice Smith', 
    role: 'Operator', 
    location: 'London, UK', 
    lat: 51.5074, 
    lng: -0.1278, 
    status: 'online', 
    lastSeen: '2m ago',
    email: 'a.smith@nexus-network.com',
    phone: '+44 7911 123456',
    department: 'Remote Operations'
  },
  { 
    id: 'U-003', 
    name: 'Bob Johnson', 
    role: 'Technician', 
    location: 'Nairobi, Kenya', 
    lat: -1.2921, 
    lng: 36.8219, 
    status: 'offline', 
    lastSeen: '3h ago',
    email: 'b.johnson@field.nexus.org',
    phone: '+254 700 987 654',
    department: 'Field Engineering'
  },
];

export default function Registry({ user, initialView = 'inventory' }: { user?: any, initialView?: 'inventory' | 'definition' }) {
  const { language } = useSettings();
  const t = useTranslation(language);
  const [currentView, setCurrentView] = useState<'inventory' | 'definition'>(initialView as any);
  const [users, setUsers] = useState<RegistryUser[]>(REGISTRY_USERS);
  
  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  useEffect(() => {
    if (user && user.lat && user.lng) {
      const currentUserAsRegistryUser: RegistryUser = {
        id: 'U-CURRENT',
        name: user.name + ' (You)',
        role: user.role,
        location: 'Detected Location',
        lat: user.lat,
        lng: user.lng,
        status: 'online',
        lastSeen: 'Active now',
        email: 'ishimwe.jeanluc48@gmail.com',
        phone: '+250 788 123 456',
        department: 'Operations Command'
      };
      setUsers(prev => [currentUserAsRegistryUser, ...prev.filter(u => u.id !== 'U-CURRENT')]);
    }
  }, [user]);

  const [globalSchemas, setGlobalSchemas] = useState(() => {
    const saved = localStorage.getItem('nexus_global_schemas');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.AeroSafe && (parsed.AeroSafe.includes('temp') || !parsed.AeroSafe.includes('temperature'))) {
          // Reset to updated specification mappings
          const updated = {
            AeroSafe: ['pm1', 'pm2.5', 'pm10', 'temperature', 'Humidity', 'Noise'],
            EnergyWatch: ['voltage', 'current', 'power', 'energy'],
            AquaGuard: ['flowRate', 'pressure', 'totalVolume'],
            Custom: ['data']
          };
          localStorage.setItem('nexus_global_schemas', JSON.stringify(updated));
          return updated;
        }
        return parsed;
      } catch (e) {}
    }
    return {
      AeroSafe: ['pm1', 'pm2.5', 'pm10', 'temperature', 'Humidity', 'Noise'],
      EnergyWatch: ['voltage', 'current', 'power', 'energy'],
      AquaGuard: ['flowRate', 'pressure', 'totalVolume'],
      Custom: ['data']
    };
  });

  const [devices, setDevices] = useState<SensorDevice[]>(() => {
    const saved = localStorage.getItem('nexus_sensors');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some((p: any) => p.id === 'SN-AS-001' || p.id === 'SN-EW-042')) {
          localStorage.setItem('nexus_sensors', JSON.stringify(DEVICES));
          return DEVICES;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved sensors', e);
        return DEVICES;
      }
    }
    return DEVICES;
  });

  const [brandProtocols, setBrandProtocols] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('nexus_brand_protocols');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      AeroSafe: 'MQTT / JSON Stream',
      EnergyWatch: 'MODBUS / C-RTU',
      AquaGuard: 'LoRaWAN Gateway',
      Custom: 'GENERIC CONTR'
    };
  });

  const [editingSchema, setEditingSchema] = useState<{ brand: string; protocol: string; fields: string[] } | null>(null);
  const [isEditingSchemaOpen, setIsEditingSchemaOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('nexus_sensors', JSON.stringify(devices));
    localStorage.setItem('nexus_global_schemas', JSON.stringify(globalSchemas));
    localStorage.setItem('nexus_brand_protocols', JSON.stringify(brandProtocols));
  }, [devices, globalSchemas, brandProtocols]);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [editingDevice, setEditingDevice] = useState<SensorDevice | null>(null);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [trackingLocation, setTrackingLocation] = useState<{ lat: number, lng: number, title: string } | null>(null);

  const filteredDevices = devices.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && d.type !== filterType) return false;
    return true;
  });

  const handleAddDevice = (newDevice: Omit<SensorDevice, 'status' | 'lastSeen' | 'firmware' | 'ip'> & { id?: string }) => {
    const brand = (newDevice as any).brand || 'Custom';
    const type = newDevice.type;
    const generatedId = newDevice.id || `SN-${type === 'air' ? 'AS' : type === 'energy' ? 'EW' : 'AG'}-${Math.floor(100 + Math.random() * 900)}`;
    const device: SensorDevice = {
      ...newDevice,
      id: generatedId,
      status: 'ok',
      lastSeen: 'Just now',
      firmware: (newDevice as any).firmware || 'v2.1.4',
      signal: -Math.floor(Math.random() * 40 + 30),
      ip: `192.168.1.${Math.floor(Math.random() * 254 + 1)}`,
      dataSchema: (globalSchemas as any)[brand] || globalSchemas.Custom,
      communication: (newDevice as any).communication || 'wifi'
    };
    setDevices([device, ...devices]);
    setIsAddingDevice(false);
  };

  const handleRemoveDevice = (id: string) => {
    setDevices(devices.filter(d => d.id !== id));
  };

  const handleUpdateDevice = (updatedDevice: SensorDevice) => {
    setDevices(devices.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    setEditingDevice(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CircleCheck className="text-nexus-teal" size={14} />;
      case 'warn': return <CircleAlert className="text-nexus-amber" size={14} />;
      case 'crit': return <CircleX className="text-nexus-red" size={14} />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok': return 'Healthy';
      case 'warn': return 'Warning';
      case 'crit': return 'Critical';
      default: return 'Unknown';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'air': return <Wind className="text-nexus-blue" size={16} />;
      case 'energy': return <Zap className="text-nexus-purple" size={16} />;
      case 'water': return <Droplets className="text-nexus-teal" size={16} />;
      default: return <Activity className="text-text-muted" size={16} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-0">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-nexus-blue/10 flex items-center justify-center text-nexus-blue border border-nexus-blue/20">
              <Database size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-main tracking-tight">Device Registry</h1>
              <p className="text-sm text-text-muted">Manage hardware inventory and data contracts</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddingDevice(true)}
            className="flex items-center gap-2 px-4 py-2 bg-nexus-blue text-white text-sm font-bold rounded-xl hover:bg-nexus-blue/90 shadow-lg shadow-nexus-blue/20 transition-all active:scale-95"
          >
            <Plus size={16} />
            Add New Device
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-6 text-[11px] font-bold uppercase tracking-wider">
          <span className="text-text-muted">Device Registry</span>
          <span className="text-text-muted">/</span>
          <span className="text-nexus-blue">
            {currentView === 'definition' ? 'Data Definition' : 'Devices'}
          </span>
        </div>

        {currentView === 'inventory' && (
          <div className="flex flex-wrap items-center gap-3 py-6 border-b border-border-main">
            <div className="flex-1 min-w-[300px] relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-nexus-blue transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search inventory..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-bg-1 border border-border-main rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-nexus-blue transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType(null)}
                className={cn(
                  "px-3 py-2 text-xs font-medium rounded-lg border transition-all flex items-center gap-2",
                  filterType === null 
                    ? "bg-nexus-blue/10 border-nexus-blue text-nexus-blue" 
                    : "bg-bg-1 border-border-main text-text-dim hover:border-text-muted"
                )}
              >
                <Activity size={14} />
                <span>All Sensors</span>
              </button>
              {['air', 'energy', 'water'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "px-3 py-2 text-xs font-medium rounded-lg border transition-all flex items-center gap-2",
                    filterType === type 
                      ? "bg-nexus-blue/10 border-nexus-blue text-nexus-blue" 
                      : "bg-bg-1 border-border-main text-text-dim hover:border-text-muted"
                  )}
                >
                  {getTypeIcon(type)}
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6 pt-2">
        {currentView === 'inventory' ? (
          /* Premium Devices Inventory Card List or Detail View */
          selectedDevice && devices.some(d => d.id === selectedDevice) ? (
            <DeviceDetailView 
              device={devices.find(d => d.id === selectedDevice)!}
              onBack={() => setSelectedDevice(null)}
              onEdit={setEditingDevice}
              onRemove={(id) => {
                handleRemoveDevice(id);
                setSelectedDevice(null);
              }}
            />
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredDevices.map((device, idx) => (
                  <motion.div
                    key={device.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04 }}
                    className={cn(
                      "relative bg-[#0d1420]/75 border rounded-2xl p-5 md:p-6 transition-all hover:border-[#3b82f6]/40 flex flex-col gap-5 text-left group cursor-pointer",
                      "border-[#172134]/70"
                    )}
                    onClick={() => setSelectedDevice(device.id)}
                  >
                  {/* High Contrast Vertical Accent line */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-[5px] rounded-l-2xl",
                    selectedDevice === device.id ? "bg-[#3b82f6]" :
                    device.type === 'air' ? "bg-nexus-teal" :
                    device.type === 'energy' ? "bg-nexus-purple" : "bg-[#3b82f6]"
                  )} />

                  {/* Header info row containing Name, ID, Model, and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-1">
                    <div className="flex items-start gap-4">
                      {/* Brand & Type Icon Indicator */}
                      <div className={cn(
                        "w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-inner",
                        device.type === 'air' ? "bg-nexus-teal/10 border-nexus-teal/20 text-nexus-teal" :
                        device.type === 'energy' ? "bg-nexus-purple/10 border-nexus-purple/20 text-nexus-purple" :
                        "bg-[#3b82f6]/10 border-[#3b82f6]/20 text-[#3b82f6]"
                      )}>
                        {device.type === 'air' && <Wind size={20} />}
                        {device.type === 'energy' && <Zap size={20} />}
                        {device.type === 'water' && <Droplets size={20} />}
                        {device.type === 'motion' && <Activity size={20} />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-extrabold text-[#f1f5f9] group-hover:text-[#3b82f6] transition-colors text-base leading-tight select-all">
                            {device.name.includes(device.model) ? device.name : `${device.name} (${device.model})`}
                          </h3>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border",
                            device.status === 'ok' ? "bg-nexus-teal/10 border-nexus-teal/25 text-nexus-teal" :
                            device.status === 'warn' ? "bg-nexus-amber/10 border-nexus-amber/25 text-nexus-amber" :
                            "bg-nexus-red/10 border-nexus-red/25 text-nexus-red"
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", device.status === 'ok' ? "bg-nexus-teal" : device.status === 'warn' ? "bg-nexus-amber" : "bg-nexus-red")} />
                            {getStatusText(device.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] font-semibold flex-wrap">
                          <span>Device ID: {device.id}</span>
                          <span className="text-text-muted">•</span>
                          <span>Model: {device.model}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right-aligned Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                      {device.lat && device.lng && (
                        <button 
                          onClick={() => setTrackingLocation({ lat: device.lat!, lng: device.lng!, title: device.name })}
                          className="p-2 bg-[#0c1322] hover:bg-[#3b82f6]/10 text-text-muted hover:text-[#3b82f6] border border-[#172134] rounded-xl transition-all hover:scale-105 active:scale-90 shadow-sm"
                          title="Locate Signal Map"
                        >
                          <Navigation size={15} />
                        </button>
                      )}
                      <button 
                        onClick={() => setEditingDevice(device)}
                        className="p-2 bg-[#0c1322] hover:bg-[#3b82f6]/10 text-text-muted hover:text-[#3b82f6] border border-[#172134] rounded-xl transition-all hover:scale-105 active:scale-90 shadow-sm"
                        title="Configure Registry Settings"
                      >
                        <SettingsIcon size={15} />
                      </button>
                      <button 
                        onClick={() => handleRemoveDevice(device.id)}
                        className="p-2 bg-[#0c1322] hover:bg-red-500/10 text-text-muted hover:text-red-400 border border-[#172134] rounded-xl transition-all hover:scale-105 active:scale-90 shadow-sm"
                        title="Decommission Hardware"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Specification HUD details (Communication Network and Physical Site) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 pb-4 border-t border-b border-[#172134]/50">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-wider block">Communication protocol</span>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border leading-none transition-all",
                          device.communication === 'gsm' 
                            ? "bg-[#a855f7]/10 border-[#a855f7]/25 text-[#d8b4fe]"
                            : "bg-[#3b82f6]/10 border-[#3b82f6]/25 text-[#3b82f6]"
                        )}>
                          {device.communication === 'gsm' ? (
                            <>
                              <Radio size={12} className="text-[#c084fc]" />
                              {device.protocol || '4G/LTE Cellular Sim'}
                            </>
                          ) : (
                            <>
                              <Wifi size={12} className="text-[#3b82f6]" />
                              {device.protocol || 'WiFi Local Gateway Network'}
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-wider block">Deployment location</span>
                      <div className="flex items-center gap-3.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold uppercase border bg-[#1e293b]/50 border-[#334155] text-white">
                          <MapPin size={12} className="text-[#3b82f6] shrink-0" />
                          <span>{device.location}</span>
                        </span>
                        {device.lat && device.lng && (
                          <span className="font-mono text-xs text-[#94a3b8] font-semibold select-all">
                            GPS: {device.lat.toFixed(4)}, {device.lng.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payload Format Structure directly underneath */}
                  <div className="bg-[#080d16]/75 border border-[#172134]/70 rounded-xl p-4 space-y-2 transition-all group-hover:bg-[#0a0f1d]/50">
                    <span className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-widest block mb-2.5">
                      Payload Format Structure
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {device.dataSchema && device.dataSchema.length > 0 ? (
                        device.dataSchema.map((field, sIdx) => (
                          <span key={`${field}-${sIdx}`} className="bg-[#0e1627] text-white border border-[#17243c] rounded-lg px-2.5 py-1 text-xs font-mono font-medium shadow-inner select-all tracking-tight leading-none">
                            {field}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-text-muted italic px-1">No schema contracts registered for this model ID.</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
         )
        ) : (currentView as any) === 'users' ? (
          /* Operators Command Deck */
          <div className="py-4 font-sans text-white">
             <table className="w-full text-left border-separate border-spacing-0">
               <thead>
                 <tr className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-widest bg-[#070d16] border-b border-[#172134]">
                   <th className="py-4 px-6 border-b border-[#172134]/70">Operator Profile</th>
                   <th className="py-4 px-6 border-b border-[#172134]/70">Department & Security Role</th>
                   <th className="py-4 px-6 border-b border-[#172134]/70">Wireless Activity Status</th>
                   <th className="py-4 px-6 border-b border-[#172134]/70">Field Node Center</th>
                   <th className="py-4 px-6 border-b border-[#172134]/70 text-right">Telemetry Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {users.map((u) => (
                   <tr key={u.id} className="group hover:bg-bg-1/50 transition-colors">
                     <td className="py-6 px-4 border-b border-border-main/50">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-nexus-blue/10 flex items-center justify-center text-nexus-blue font-bold">
                             {u.name.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div>
                              <div className="font-bold text-text-main">{u.name}</div>
                              <div className="text-[11px] text-text-muted">{u.id}</div>
                           </div>
                        </div>
                     </td>
                     <td className="py-6 px-4 border-b border-border-main/50">
                        <span className="text-sm text-text-dim font-medium">{u.role}</span>
                     </td>
                     <td className="py-6 px-4 border-b border-border-main/50">
                        <div className="flex items-center gap-2">
                           <div className={cn("w-2 h-2 rounded-full", u.status === 'online' ? "bg-nexus-teal animate-pulse" : "bg-text-muted")} />
                           <span className="text-xs text-text-dim">{u.lastSeen}</span>
                        </div>
                     </td>
                     <td className="py-6 px-4 border-b border-border-main/50">
                        <div className="flex flex-col">
                           <span className="text-xs text-text-main font-semibold mb-1">{u.location}</span>
                           <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-2 border border-border-main rounded-lg w-fit">
                              <MapPin size={12} className="text-nexus-blue" />
                              <span className="text-[11px] font-mono text-text-dim">{u.lat}, {u.lng}</span>
                           </div>
                        </div>
                     </td>
                     <td className="py-6 px-4 border-b border-border-main/50 text-right">
                        <button 
                           onClick={() => setTrackingLocation({ lat: u.lat, lng: u.lng, title: u.name })}
                           className="px-4 py-2 bg-nexus-blue/10 text-nexus-blue text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-nexus-blue hover:text-white transition-all flex items-center gap-2 ml-auto"
                        >
                           <Navigation size={12} />
                           Track Signal
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        ) : currentView === 'definition' ? (
          /* Premium Protocol Schema Dictionary Deck */
          <div className="py-4">
            <div className="bg-[#0b0f19] border border-[#172134]/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-[#172134]/70 bg-[#070d16]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-xl flex items-center justify-center text-[#3b82f6]">
                    <Database size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-extrabold text-[#f1f5f9]">Global System Payload Dictionaries</h3>
                    <p className="text-xs text-[#94a3b8] font-semibold mt-0.5">Define standardized payload contracts and network protocol mappings</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSchema(null);
                    setIsEditingSchemaOpen(true);
                  }}
                  className="px-4 py-2 bg-nexus-blue hover:bg-nexus-blue/90 border border-nexus-blue/50 text-white rounded-xl text-xs font-bold leading-none select-none transition-all flex items-center gap-1.5 shadow-lg shadow-nexus-blue/10 shrink-0 cursor-pointer"
                >
                  <Plus size={14} />
                  Add Definition
                </button>
              </div>

              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-widest bg-[#070d16] border-b border-[#172134]">
                    <th className="py-4 px-6 border-b border-[#172134]/70">Hardware Brand Engine</th>
                    <th className="py-4 px-6 border-b border-[#172134]/70">Transmission Protocol</th>
                    <th className="py-4 px-6 border-b border-[#172134]/70">Standardized Registry Mappings</th>
                    <th className="py-4 px-6 border-b border-[#172134]/70 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172134]/40 bg-[#080d16]/30 animate-none">
                  {Object.entries(globalSchemas).map(([brand, schema]: [any, any]) => (
                    <tr key={brand} className="group hover:bg-[#0e1423]/50 transition-colors">
                      <td className="py-6 px-6 align-top">
                        <div className="flex items-center gap-3.5">
                          <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105",
                            brand === 'AeroSafe' ? "bg-nexus-teal/10 border-nexus-teal/20 text-nexus-teal" :
                            brand === 'EnergyWatch' ? "bg-nexus-purple/10 border-nexus-purple/20 text-nexus-purple" :
                            brand === 'AquaGuard' ? "bg-nexus-blue/10 border-nexus-blue/20 text-nexus-blue" :
                            "bg-bg-2 border-border-main text-text-muted"
                          )}>
                            {brand === 'AeroSafe' && <Wind size={20} />}
                            {brand === 'EnergyWatch' && <Zap size={20} />}
                            {brand === 'AquaGuard' && <Droplets size={20} />}
                            {brand !== 'AeroSafe' && brand !== 'EnergyWatch' && brand !== 'AquaGuard' && <Activity size={20} />}
                          </div>
                          <div className="text-left space-y-0.5">
                            <div className="font-extrabold text-[#f1f5f9] text-sm">{brand}</div>
                            <div className="text-[10px] font-mono text-[#526a97] font-bold">ID: {brand.toUpperCase()}_NODE_SPEC</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-6 px-6 align-top">
                         <div className="text-left mt-1.5 font-sans">
                           <span className={cn(
                             "inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase border font-mono tracking-wider",
                             brand === 'AeroSafe' ? "bg-nexus-teal/10 border-nexus-teal/25 text-nexus-teal" :
                             brand === 'EnergyWatch' ? "bg-nexus-purple/10 border-nexus-purple/25 text-nexus-purple" :
                             brand === 'AquaGuard' ? "bg-[#3498db]/10 border-[#3498db]/25 text-[#9fe3ff]" :
                             "bg-bg-2 border-primary/20 text-text-light"
                           )}>
                             {brandProtocols[brand] || 'GENERIC CONTR'}
                           </span>
                         </div>
                      </td>

                      <td className="py-6 px-6 align-top">
                        <div className="space-y-4 text-left max-w-lg">
                          <div className="flex flex-wrap gap-1.5 min-h-[32px] content-start">
                            <AnimatePresence mode="popLayout">
                              {schema.map((field: string) => (
                                <motion.div 
                                  key={field} 
                                  layout
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className="flex items-center gap-2 h-8 pl-3 pr-1 bg-[#070d16] border border-[#172134] hover:border-[#3b82f6]/40 rounded-xl shadow-sm group/tag transition-all"
                                >
                                  <span className="text-[11px] font-mono font-bold text-[#f1f5f9] group-hover/tag:text-[#3b82f6] transition-colors">{field}</span>
                                  <button 
                                    onClick={() => {
                                      const newSchema = schema.filter((f: string) => f !== field);
                                      setGlobalSchemas({ ...globalSchemas, [brand]: newSchema });
                                    }}
                                    className="p-1 text-text-muted hover:text-nexus-red hover:bg-nexus-red/10 rounded transition-all"
                                  >
                                    <CircleX size={12} />
                                  </button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                          
                          <div className="relative flex gap-2">
                             <div className="relative flex-1 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-[#3b82f6] transition-colors" size={12} />
                                <input 
                                  type="text"
                                  placeholder="Define new parameter..."
                                  className="w-full bg-[#070d16] border border-[#172134] rounded-xl pl-9 pr-3 py-2 text-[11px] font-mono font-bold text-white outline-none focus:border-[#3b82f6] transition-all"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const val = e.currentTarget.value.trim();
                                      if (val && !schema.includes(val)) {
                                        setGlobalSchemas({ ...globalSchemas, [brand]: [...schema, val] });
                                        e.currentTarget.value = '';
                                      }
                                    }
                                  }}
                                />
                             </div>
                             <button 
                               onClick={(e) => {
                                 const input = e.currentTarget.previousElementSibling?.querySelector('input');
                                 if (input) {
                                   const val = input.value.trim();
                                   if (val && !schema.includes(val)) {
                                      setGlobalSchemas({ ...globalSchemas, [brand]: [...schema, val] });
                                      input.value = '';
                                   }
                                 }
                               }}
                               className="px-4.5 bg-[#3b82f6]/10 text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white border border-[#3b82f6]/25 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all whitespace-nowrap"
                             >
                               Register
                             </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-6 px-6 align-top">
                        <div className="flex justify-end pt-1.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col items-end gap-3.5">
                            <div className="flex items-center gap-1.5">
                              {/* Edit Schema Definition Button */}
                              <button
                                onClick={() => {
                                  setEditingSchema({
                                    brand,
                                    protocol: brandProtocols[brand] || 'GENERIC CONTR',
                                    fields: schema
                                  });
                                  setIsEditingSchemaOpen(true);
                                }}
                                className="px-2.5 py-1.5 bg-[#3b82f6]/10 border border-[#3b82f6]/25 hover:border-[#3b82f6] text-[#3b82f6] hover:text-white hover:bg-[#3b82f6] rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                title={`Edit ${brand} specifications`}
                              >
                                <Pencil size={11} />
                                <span>Edit</span>
                              </button>

                              {/* Delete Schema Definition Button */}
                              {brand !== 'Custom' ? (
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete the standardized metrics schema for brand "${brand}"? Uniquely matched devices will fallback to Generic/Custom settings.`)) {
                                      const newSchemas = { ...globalSchemas };
                                      delete newSchemas[brand];
                                      setGlobalSchemas(newSchemas);

                                      const newProtocols = { ...brandProtocols };
                                      delete newProtocols[brand];
                                      setBrandProtocols(newProtocols);

                                      setDevices(devices.map(d => {
                                        if (d.name === brand || (d as any).brand === brand) {
                                          return { 
                                            ...d, 
                                            name: 'Custom Device', 
                                            dataSchema: newSchemas.Custom || ['data'] 
                                          };
                                        }
                                        return d;
                                      }));
                                    }
                                  }}
                                  className="px-2.5 py-1.5 bg-nexus-red/10 border border-nexus-red/25 hover:border-nexus-red text-nexus-red hover:text-white hover:bg-nexus-red rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  title={`Delete ${brand} specifications`}
                                >
                                  <Trash2 size={11} />
                                  <span>Delete</span>
                                </button>
                              ) : (
                                <span className="px-2.5 py-1.5 text-[11px] text-text-muted bg-white/5 border border-dashed border-white/10 rounded-xl select-none font-bold italic block">
                                  Default
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-extrabold text-[#526a97] uppercase tracking-wider hidden lg:inline">Telemetry</span>
                              <div className="w-9 h-5 bg-nexus-teal/20 border border-nexus-teal/30 rounded-full relative cursor-pointer shadow-inner">
                                <div className="absolute right-0.5 top-0.5 w-3.5 h-3.5 bg-nexus-teal rounded-full shadow-[0_0_8px_#10b981]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {currentView === 'inventory' && filteredDevices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <div className="w-16 h-16 rounded-full bg-bg-1 flex items-center justify-center mb-4">
              <Database size={32} className="opacity-20" />
            </div>
            <h3 className="text-base font-bold text-text-dim">No devices found</h3>
            <p className="text-sm max-w-[240px] text-center mt-1">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              onClick={() => { setSearch(''); setFilterType(null); }}
              className="mt-6 text-nexus-blue font-bold text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>


      {/* Footer Stats */}
      <div className="px-6 py-4 border-t border-border-main bg-bg-1/50 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Online:</span>
          <span className="text-xs font-bold text-nexus-teal">4</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Degraded:</span>
          <span className="text-xs font-bold text-nexus-amber">1</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Disconnected:</span>
          <span className="text-xs font-bold text-nexus-red">1</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-[10px] text-text-muted">Auto-sync active</div>
          <div className="w-1.5 h-1.5 rounded-full bg-nexus-teal animate-pulse" />
        </div>
      </div>

      <AnimatePresence>
        {editingDevice && (
          <SettingsModal 
            device={editingDevice} 
            onClose={() => setEditingDevice(null)} 
            onSave={handleUpdateDevice}
            globalSchemas={globalSchemas}
          />
        )}
        {isAddingDevice && (
          <AddDeviceModal 
            onClose={() => setIsAddingDevice(false)} 
            onAdd={handleAddDevice}
            globalSchemas={globalSchemas}
            existingDevices={devices}
          />
        )}
        {trackingLocation && (
          <TrackingModal 
            location={trackingLocation}
            onClose={() => setTrackingLocation(null)}
          />
        )}
        {isEditingSchemaOpen && (
          <SchemaDefinitionModal
            isOpen={isEditingSchemaOpen}
            onClose={() => {
              setIsEditingSchemaOpen(false);
              setEditingSchema(null);
            }}
            onSave={(schemaData) => {
              const { brand, oldBrand, protocol, fields } = schemaData;
              
              setGlobalSchemas(prev => {
                const nextGlobalSchemas = { ...prev };
                if (oldBrand && oldBrand !== brand) {
                  delete nextGlobalSchemas[oldBrand];
                }
                nextGlobalSchemas[brand] = fields;
                return nextGlobalSchemas;
              });

              setBrandProtocols(prev => {
                const nextBrandProtocols = { ...prev };
                if (oldBrand && oldBrand !== brand) {
                  delete nextBrandProtocols[oldBrand];
                }
                nextBrandProtocols[brand] = protocol;
                return nextBrandProtocols;
              });

              // Update any devices using the old brand
              if (oldBrand && oldBrand !== brand) {
                setDevices(prev => prev.map(d => {
                  let updated = { ...d };
                  if (d.name === oldBrand) {
                    updated.name = brand;
                  }
                  if ((d as any).brand === oldBrand) {
                    (updated as any).brand = brand;
                  }
                  return updated;
                }));
              }

              setIsEditingSchemaOpen(false);
              setEditingSchema(null);
            }}
            initialData={editingSchema || undefined}
            isEdit={!!editingSchema}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DeviceDetailView({ 
  device, 
  onBack, 
  onEdit, 
  onRemove 
}: { 
  device: SensorDevice; 
  onBack: () => void; 
  onEdit: (device: SensorDevice) => void; 
  onRemove: (id: string) => void; 
}) {
  const getDeviceBrand = (d: SensorDevice) => {
    if (d.name.startsWith('AeroSafe') || d.id.includes('AS')) return 'AeroSafe';
    if (d.name.startsWith('EnergyWatch') || d.id.includes('EW')) return 'EnergyWatch';
    if (d.name.startsWith('AquaGuard') || d.id.includes('AG')) return 'AquaGuard';
    return 'Custom';
  };

  const getLiveReadings = (d: SensorDevice) => {
    const type = d.type;
    if (type === 'air') {
      return [
        { name: 'PM1.0', value: '8', unit: 'µg/m³', statusColor: 'text-nexus-teal' },
        { name: 'PM2.5', value: '28', unit: 'µg/m³', statusColor: 'text-nexus-amber' },
        { name: 'PM10', value: '14', unit: 'µg/m³', statusColor: 'text-[nexus-teal]' },
        { name: 'Temperature', value: '24.3', unit: '°C', statusColor: 'text-[#f1f5f9]' },
        { name: 'Humidity', value: '61', unit: '%', statusColor: 'text-[#f1f5f9]' },
        { name: 'Noise', value: '72', unit: 'dB', statusColor: 'text-nexus-red' },
      ];
    } else if (type === 'energy') {
      return [
        { name: 'Voltage', value: '228.4', unit: 'V', statusColor: 'text-nexus-teal' },
        { name: 'Current', value: '14.2', unit: 'A', statusColor: 'text-[#f1f5f9]' },
        { name: 'Power', value: '3.24', unit: 'kW', statusColor: 'text-nexus-amber' },
        { name: 'Energy', value: '14,832', unit: 'kWh', statusColor: 'text-[#f1f5f9]' },
      ];
    } else if (type === 'water') {
      return [
        { name: 'Flow Rate', value: '12.4', unit: 'L/min', statusColor: 'text-nexus-teal' },
        { name: 'Pressure', value: '3.6', unit: 'bar', statusColor: 'text-nexus-amber' },
        { name: 'Total Volume', value: '458.2', unit: 'm³', statusColor: 'text-[#f1f5f9]' },
      ];
    } else {
      return [
        { name: 'State', value: 'Active', unit: 'status', statusColor: 'text-nexus-teal' },
        { name: 'Signal Pulse', value: '98.4', unit: 'Hz', statusColor: 'text-[#f1f5f9]' },
      ];
    }
  };

  const readings = getLiveReadings(device);
  const brand = getDeviceBrand(device);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-[#0b1222]/90 border border-[#172134]/80 rounded-2xl p-4 md:p-5 flex flex-col gap-4 text-left w-full shadow-2xl"
    >
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0c1322] hover:bg-[#152035] border border-[#172134] rounded-xl text-xs font-bold text-[#f1f5f9] hover:text-[#3b82f6] transition-all cursor-pointer"
        >
          <ChevronRight className="rotate-180" size={14} />
          <span>Back</span>
        </button>
        <p className="text-base font-extrabold text-[#f1f5f9] tracking-tight">{device.name.includes(device.model) ? device.name : `${device.name} (${device.model})`}</p>
        <span className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border",
          device.status === 'ok' ? "bg-nexus-teal/10 border-nexus-teal/25 text-nexus-teal" :
          device.status === 'warn' ? "bg-nexus-amber/10 border-nexus-amber/25 text-nexus-amber" :
          "bg-nexus-red/10 border-nexus-red/25 text-nexus-red"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", device.status === 'ok' ? "bg-nexus-teal" : device.status === 'warn' ? "bg-nexus-amber" : "bg-nexus-red")} />
          {device.status === 'ok' ? 'Online' : device.status === 'warn' ? 'Warning' : 'Offline'}
        </span>
        
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={() => onEdit(device)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0c1322] hover:bg-[#3b82f6]/10 text-[#94a3b8] hover:text-[#3b82f6] border border-[#172134] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <SettingsIcon size={13} />
            <span>Edit</span>
          </button>
          <button 
            onClick={() => onRemove(device.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0c1322] hover:bg-red-500/10 text-[#94a3b8] hover:text-red-400 border border-[#172134] rounded-xl text-xs font-bold transition-all cursor-pointer animate-none"
          >
            <Trash2 size={13} />
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL BASIC INFO STRIP */}
      <div className="bg-[#070d16] rounded-2xl border border-[#172134]/60 p-4 md:px-5 md:py-4.5 overflow-hidden select-none">
        <div className="flex items-stretch gap-0 overflow-x-auto no-scrollbar scrollbar-none">
          {/* Brand */}
          <div className="flex flex-col gap-1 pr-5 min-w-[90px] shrink-0">
            <span className="text-[10px] text-[#526a97] font-extrabold uppercase tracking-widest leading-none">Brand</span>
            <span className="text-sm font-bold text-[#f1f5f9]">{brand}</span>
          </div>
          <div className="w-[1px] bg-[#172134]/65 mx-4.5 self-stretch shrink-0" />

          {/* Model ID */}
          <div className="flex flex-col gap-1 pr-5 min-w-[80px] shrink-0">
            <span className="text-[10px] text-[#526a97] font-extrabold uppercase tracking-widest leading-none">Model ID</span>
            <span className="text-sm font-bold text-[#f1f5f9] font-mono">{device.model}</span>
          </div>
          <div className="w-[1px] bg-[#172134]/65 mx-4.5 self-stretch shrink-0" />

          {/* Serial Number */}
          <div className="flex flex-col gap-1 pr-5 min-w-[130px] shrink-0">
            <span className="text-[10px] text-[#526a97] font-extrabold uppercase tracking-widest leading-none">Serial Number</span>
            <span className="text-sm font-bold text-[#f1f5f9] font-mono select-all">{device.id}</span>
          </div>
          <div className="w-[1px] bg-[#172134]/65 mx-4.5 self-stretch shrink-0" />

          {/* Type */}
          <div className="flex flex-col gap-1 pr-5 min-w-[100px] shrink-0 justify-center">
            <span className="text-[10px] text-[#526a97] font-extrabold uppercase tracking-widest leading-none mb-0.5">Type</span>
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold w-fit leading-none",
              device.type === 'air' ? "bg-nexus-teal/15 text-nexus-teal" :
              device.type === 'energy' ? "bg-nexus-purple/15 text-nexus-purple" :
              "bg-[#3b82f6]/15 text-[#3b82f6]"
            )}>
              {device.type === 'air' ? 'Air Quality' : device.type === 'energy' ? 'Energy Watch' : device.type === 'water' ? 'Water Flow' : 'Standard'}
            </span>
          </div>
          <div className="w-[1px] bg-[#172134]/65 mx-4.5 self-stretch shrink-0" />

          {/* Firmware */}
          <div className="flex flex-col gap-1 pr-5 min-w-[85px] shrink-0">
            <span className="text-[10px] text-[#526a97] font-extrabold uppercase tracking-widest leading-none">Firmware</span>
            <span className="text-sm font-bold text-[#f1f5f9] font-mono">{device.firmware}</span>
          </div>
          <div className="w-[1px] bg-[#172134]/65 mx-4.5 self-stretch shrink-0" />

          {/* Installed */}
          <div className="flex flex-col gap-1 pr-5 min-w-[110px] shrink-0">
            <span className="text-[10px] text-[#526a97] font-extrabold uppercase tracking-widest leading-none">Installed</span>
            <span className="text-sm font-bold text-[#f1f5f9]">{device.installationDate || '12 Jan 2025'}</span>
          </div>
          <div className="w-[1px] bg-[#172134]/65 mx-4.5 self-stretch shrink-0" />

          {/* Building */}
          <div className="flex flex-col gap-1 pr-5 min-w-[100px] shrink-0">
            <span className="text-[10px] text-[#526a97] font-extrabold uppercase tracking-widest leading-none">Building</span>
            <span className="text-sm font-bold text-[#f1f5f9]">{device.buildingSite || 'HQ Kigali'}</span>
          </div>
          <div className="w-[1px] bg-[#172134]/65 mx-4.5 self-stretch shrink-0" />

          {/* Zone */}
          <div className="flex flex-col gap-1 min-w-[80px] shrink-0">
            <span className="text-[10px] text-[#526a97] font-extrabold uppercase tracking-widest leading-none">Zone</span>
            <span className="text-sm font-bold text-[#f1f5f9]">{device.location}</span>
          </div>
        </div>
      </div>

      {/* "More details" label */}
      <div className="flex items-center gap-2 select-none my-1">
        <div className="flex-1 h-[0.5px] bg-[#172134]/60"></div>
        <span className="text-[10px] font-extrabold text-[#526a97] tracking-[2px] uppercase whitespace-nowrap leading-none">More details</span>
        <div className="flex-1 h-[0.5px] bg-[#172134]/60"></div>
      </div>

      {/* Live readings */}
      <div className="bg-[#070d16] rounded-2xl border border-[#172134]/60 p-4">
        <div className="flex items-center justify-between mb-3.5 select-none">
          <p className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-widest flex items-center gap-1.5 leading-none">
            <Activity size={13} className="text-[#3b82f6]" />
            <span>Latest readings</span>
          </p>
          <span className="text-[11px] text-[#94a3b8]">Updated Just Now</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {readings.map((reading) => (
            <div key={reading.name} className="bg-[#0b1322]/80 border border-[#172134]/35 rounded-xl p-3 text-center transition-all hover:bg-[#10192e]">
              <p className="text-[10px] text-[#94a3b8] font-semibold mb-1 uppercase tracking-tight">{reading.name}</p>
              <p className={cn("text-2xl font-bold leading-none my-1 font-sans", reading.statusColor)}>{reading.value}</p>
              <p className="text-[10px] text-[#526a97] font-semibold mt-1 tracking-wider">{reading.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Network + Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Network config */}
        <div className="bg-[#070d16] rounded-2xl border border-[#172134]/60 p-4">
          <p className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-widest flex items-center gap-1.5 border-b border-[#172134]/40 pb-2 mb-3 leading-none select-none">
            <Wifi size={13} className="text-[#3b82f6]" />
            <span>Network</span>
          </p>
          <div className="flex flex-col gap-3 font-sans">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#94a3b8]">Protocol</span>
              <span className="font-bold text-[#f1f5f9] bg-[#0c1322] px-2 py-0.5 border border-[#172134] rounded text-[11px] font-mono">
                {device.protocol || (device.type === 'water' ? 'LoRaWAN' : device.communication === 'gsm' ? '4G/LTE' : 'MQTT')}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#94a3b8]">Interval</span>
              <span className="font-bold text-[#f1f5f9] text-[13px]">{device.interval || 'Every 5 mins'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#94a3b8]">Gateway</span>
              <span className="font-bold font-mono text-xs text-[#f1f5f9] select-all bg-[#0c1322] px-2 py-0.5 border border-[#172134] rounded">
                {device.gatewayId || `GW-${device.id.replace('SN-', '')}`}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#94a3b8]">Last ping</span>
              <span className={cn("font-bold text-[13px]", device.status === 'ok' ? "text-nexus-teal" : device.status === 'warn' ? "text-nexus-amber" : "text-nexus-red")}>
                {device.lastSeen === 'Disconnected' ? 'Offline' : '2 mins ago'}
              </span>
            </div>
          </div>
        </div>

        {/* Device Stats */}
        <div className="bg-[#070d16] rounded-2xl border border-[#172134]/60 p-4">
          <p className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-widest flex items-center gap-1.5 border-b border-[#172134]/40 pb-2 mb-3 leading-none select-none">
            <Activity size={13} className="text-[#3b82f6]" />
            <span>Device stats</span>
          </p>
          <div className="flex flex-col gap-3 font-sans">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#94a3b8]">Uptime</span>
              <span className={cn("font-bold text-[13px]", device.status === 'ok' ? "text-nexus-teal" : device.status === 'warn' ? "text-nexus-amber" : "text-nexus-red")}>
                {device.status === 'ok' ? '99.2%' : device.status === 'warn' ? '91.6%' : '0%'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#94a3b8]">Total transmissions</span>
              <span className="font-bold text-[#f1f5f9] text-[13px] font-mono">14,832</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#94a3b8]">Missed packets</span>
              <span className={cn("font-bold text-[13px] font-mono", device.status === 'crit' ? "text-nexus-red" : "text-[#f59e0b]")}>116</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#94a3b8]">Days active</span>
              <span className="font-bold text-[#f1f5f9] text-[13px]">131 days</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TrackingModal({ location, onClose }: { location: { lat: number, lng: number, title: string }, onClose: () => void }) {
  const hasKey = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.length > 10;
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [mapProvider, setMapProvider] = useState<'osm' | 'google'>('osm');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <GoogleMapsHelpModal isOpen={showSetupGuide} onClose={() => setShowSetupGuide(false)} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-bg-1 border border-border-main rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-border-main flex items-center justify-between bg-bg-1/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-nexus-blue/10 flex items-center justify-center text-nexus-blue border border-nexus-blue/20">
              <Navigation size={20} />
            </div>
            <div>
              <h3 className="font-bold text-text-main">GPS Signal Lock</h3>
              <p className="text-[11px] font-mono text-text-muted italic">{location.title} • {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Quick provider switcher inside Modal */}
            <div className="bg-bg-2 border border-border-main p-0.5 rounded-lg flex gap-1 text-[9px] font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setMapProvider('osm')}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all",
                  mapProvider === 'osm' ? "bg-nexus-blue text-white shadow-xs" : "text-text-muted hover:text-text-main"
                )}
              >
                OSM
              </button>
              <button
                type="button"
                onClick={() => setMapProvider('google')}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all",
                  mapProvider === 'google' ? "bg-nexus-blue text-white shadow-xs" : "text-text-muted hover:text-text-main"
                )}
              >
                Google
              </button>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-bg-3 rounded-xl text-text-muted hover:text-text-main transition-all"
            >
              <CircleX size={20} />
            </button>
          </div>
        </div>

        <div className="h-[400px] bg-bg-2 relative font-sans">
           {mapProvider === 'osm' ? (
             <PigeonMap
               center={[location.lat, location.lng]}
               zoom={15}
               provider={cartoDarkProvider}
             >
               <PigeonOverlay
                 anchor={[location.lat, location.lng]}
                 offset={[16, 16]}
               >
                 <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                   <div className="absolute inset-0 rounded-full bg-nexus-blue animate-ping opacity-20 w-8 h-8 -mt-4 -ml-4" style={{ animationDuration: '3s' }} />
                   <div className="w-8 h-8 rounded-full bg-nexus-blue flex items-center justify-center text-white border-2 border-bg-1 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 transition-transform">
                     <Zap size={14} />
                   </div>
                   <div className="mt-1 bg-black/75 backdrop-blur-xs border border-white/10 px-2 py-0.5 rounded text-[9px] font-black text-white whitespace-nowrap tracking-tighter uppercase italic shadow-lg pointer-events-none z-10">
                     {location.title}
                   </div>
                 </div>
               </PigeonOverlay>
             </PigeonMap>
           ) : hasKey ? (
             <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
               <Map
                 defaultCenter={{ lat: location.lat, lng: location.lng }}
                 defaultZoom={15}
                 disableDefaultUI={true}
                 className="w-full h-full"
                 renderingType="RASTER"
                 internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
               >
                 <Marker 
                    position={{ lat: location.lat, lng: location.lng }}
                    title={location.title}
                 />
               </Map>
             </APIProvider>
           ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-bg-1">
                <div className="w-16 h-16 bg-nexus-amber/10 rounded-full flex items-center justify-center text-nexus-amber mb-4">
                   <CircleAlert size={32} />
                </div>
                <h4 className="text-lg font-bold mb-2 text-text-main">Maps API Key Required</h4>
                <p className="text-sm text-text-dim max-w-xs mb-6"> To visualize the exact GPS coordinates on a geographic map via Google, please add your Google Maps Platform API key in Settings. Alternatively, use the OSM toggle at the top of this modal.</p>
                <div className="flex gap-2">
                   <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-bg-3 text-text-main font-bold rounded-xl text-xs uppercase tracking-widest border border-border-main hover:bg-bg-2 transition-all"
                   >
                     Close
                   </button>
                   <button 
                    type="button"
                    onClick={() => setShowSetupGuide(true)}
                    className="px-6 py-2 bg-nexus-blue hover:bg-nexus-blue/90 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
                   >
                     Setup Guide
                   </button>
                </div>
             </div>
           )}
        </div>

        <div className="p-6 bg-bg-1 border-t border-border-main flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black tracking-tighter text-text-muted">Precision</span>
                  <span className="text-sm font-bold text-nexus-teal">+/- 2.4 meters</span>
               </div>
               <div className="w-[1px] h-8 bg-border-main" />
               <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black tracking-tighter text-text-muted">Altitude</span>
                  <span className="text-sm font-bold text-text-main">134m MSL</span>
               </div>
            </div>
            
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-bg-2 border border-border-main rounded-xl text-xs font-bold text-text-main hover:bg-bg-3 hover:border-nexus-blue transition-all group"
            >
              Open in Google Maps
              <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
        </div>
      </motion.div>
    </div>
  );
}

function SettingsModal({ device, onClose, onSave, globalSchemas }: { device: SensorDevice, onClose: () => void, onSave: (d: SensorDevice) => void, globalSchemas: any }) {
  const [formData, setFormData] = useState({
    name: device.name,
    location: device.location,
    pollInterval: 5000,
    reportingUrl: `http://${device.ip}/api/v1/data`,
    dataSchema: device.dataSchema || [],
    lat: device.lat || 0,
    lng: device.lng || 0,
    communication: device.communication || 'wifi'
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'air': return <Wind className="text-nexus-blue" size={16} />;
      case 'energy': return <Zap className="text-nexus-purple" size={16} />;
      case 'water': return <Droplets className="text-nexus-teal" size={16} />;
      default: return <Activity className="text-text-muted" size={16} />;
    }
  };

  const handleSave = () => {
    onSave({
      ...device,
      name: formData.name,
      location: formData.location,
      dataSchema: formData.dataSchema,
      lat: formData.lat,
      lng: formData.lng,
      communication: formData.communication
    });
  };

  const toggleSchemaField = (field: string) => {
    if (formData.dataSchema.includes(field)) {
      setFormData({ ...formData, dataSchema: formData.dataSchema.filter(f => f !== field) });
    } else {
      setFormData({ ...formData, dataSchema: [...formData.dataSchema, field] });
    }
  };

  const addCustomField = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim();
      if (val && !formData.dataSchema.includes(val)) {
        setFormData({ ...formData, dataSchema: [...formData.dataSchema, val] });
        e.currentTarget.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-bg-1 border border-border-main rounded-2xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-border-main flex items-center justify-between sticky top-0 bg-bg-1 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-bg-2 flex items-center justify-center border border-border-main text-nexus-blue">
              {getTypeIcon(device.type)}
            </div>
            <div>
              <h3 className="font-bold text-text-main">Device Settings</h3>
              <p className="text-[11px] font-mono text-text-muted">{device.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-bg-3 rounded-lg text-text-muted"
          >
            <CircleX size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Device Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-bg-2 border border-border-main rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-nexus-blue"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Poll Interval (ms)</label>
              <input 
                type="number" 
                value={formData.pollInterval}
                onChange={(e) => setFormData({ ...formData, pollInterval: parseInt(e.target.value) })}
                className="w-full bg-bg-2 border border-border-main rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-nexus-blue"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Location</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-bg-2 border border-border-main rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-[#3b82f6]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#526a97] uppercase tracking-wider">Communication Network</label>
              <select 
                value={formData.communication}
                onChange={(e) => setFormData({ ...formData, communication: e.target.value as any })}
                className="w-full bg-bg-2 border border-border-main rounded-lg px-3 py-2.5 text-sm mt-1 outline-none focus:border-[#3b82f6] cursor-pointer"
              >
                <option value="wifi">WiFi Wireless</option>
                <option value="gsm">GSM Cellular Sim</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Latitude</label>
              <input 
                type="number" 
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                className="w-full bg-bg-2 border border-border-main rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-nexus-blue font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Longitude</label>
              <input 
                type="number" 
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                className="w-full bg-bg-2 border border-border-main rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-nexus-blue font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Payload Data Schema</label>
            <div className="bg-bg-0 border border-border-main rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.dataSchema.map(field => (
                  <div key={field} className="flex items-center gap-2 px-2 py-1 bg-nexus-blue/10 text-nexus-blue border border-nexus-blue/20 rounded-md text-[11px] font-medium">
                    {field}
                    <button onClick={() => toggleSchemaField(field)} className="hover:text-nexus-red">
                      <CircleX size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Type field name and press Enter..." 
                  onKeyDown={addCustomField}
                  className="w-full bg-bg-1 border border-border-main rounded-lg px-3 py-2 text-xs outline-none focus:border-nexus-blue transition-all"
                />
              </div>
              <p className="text-[10px] text-text-muted italic">Configure the fields this device will report to the database.</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Reporting Endpoints</label>
            <div className="mt-1 space-y-2">
              <div className="flex items-center gap-2 p-2 bg-bg-0 border border-border-main rounded-lg">
                <div className="w-8 h-8 rounded bg-nexus-blue/10 flex items-center justify-center text-nexus-blue shrink-0">
                  <Database size={14} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-bold uppercase text-text-muted tracking-tight">Main DB Route</p>
                  <p className="text-[11px] font-mono text-text-main truncate">{formData.reportingUrl}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-bg-2 rounded-xl border border-border-main">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-dim">Auto-Calibration</span>
              <div className="w-8 h-4 bg-nexus-blue rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-dim">Alert on Drift {">"} 5%</span>
              <div className="w-8 h-4 bg-bg-3 rounded-full relative cursor-pointer">
                <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-bg-2 hover:bg-bg-3 text-text-main font-bold rounded-xl border border-border-main transition-all"
             >
               Cancel
             </button>
             <button 
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-nexus-blue text-white font-bold rounded-xl shadow-lg shadow-nexus-blue/20 transition-all hover:bg-nexus-blue/90"
             >
               Save Changes
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const AVAILABLE_MODELS = {
  AeroSafe: ['AQ-001', 'AQ-002', 'AQ-003', 'AQ-004', 'AQ-005', 'AQ-006', 'AQ-007', 'AQ-008', 'AQ-009', 'AQ-010'],
  EnergyWatch: ['EW-001', 'EW-002', 'EW-003', 'EW-004', 'EW-005', 'EW-006', 'EW-007', 'EW-008', 'EW-009', 'EW-010'],
  AquaGuard: ['AG-001', 'AG-002', 'AG-003', 'AG-004', 'AG-005', 'AG-006', 'AG-007', 'AG-008', 'AG-009', 'AG-010'],
  Custom: ['STD-001', 'STD-002', 'STD-003', 'STD-004', 'STD-005', 'STD-006', 'STD-007', 'STD-008', 'STD-009', 'STD-010']
};

const AVAILABLE_SERIALS = [
  'SN-2026-0101', 'SN-2026-0102', 'SN-2026-0103', 'SN-2026-0104',
  'SN-2026-0105', 'SN-2026-0106', 'SN-2026-0107', 'SN-2026-0108',
  'SN-2026-0109', 'SN-2026-0110', 'SN-2026-0111', 'SN-2026-0112'
];

const AVAILABLE_FIRMWARES = ['v2.1.4', 'v2.1.5', 'v2.2.0'];

const METRIC_DETAILS: Record<string, { label: string, format: string }> = {
  pm1: { label: 'Particulate Matter 1.0', format: 'Numeric (µg/m³)' },
  'pm2.5': { label: 'Particulate Matter 2.5', format: 'Numeric (µg/m³)' },
  pm10: { label: 'Particulate Matter 10.0', format: 'Numeric (µg/m³)' },
  temp: { label: 'Ambient Temperature', format: 'Numeric (°C)' },
  humidity: { label: 'Relative Humidity', format: 'Percentage (%)' },
  noise: { label: 'Acoustic Noise Level', format: 'Decibels (dBA)' },
  voltage: { label: 'AC RMS Voltage', format: 'Numeric (V)' },
  current: { label: 'AC RMS Current', format: 'Numeric (A)' },
  power: { label: 'Active Power Density', format: 'Numeric (kW)' },
  energy: { label: 'Cumulative Consumption', format: 'Numeric (kWh)' },
  flowRate: { label: 'Water Volumetric Flow', format: 'Numeric (L/min)' },
  pressure: { label: 'Water Line Pressure', format: 'Numeric (bar)' },
  totalVolume: { label: 'Total Water Inline Volume', format: 'Numeric (m³)' },
  data: { label: 'Raw Telemetry Payload', format: 'String / JSON' },
};

function AddDeviceModal({ onClose, onAdd, globalSchemas, existingDevices }: { onClose: () => void, onAdd: (device: any) => void, globalSchemas: any, existingDevices: SensorDevice[] }) {
  // Find first unused model & serial to set defaults
  const firstUnusedModel = AVAILABLE_MODELS['AeroSafe'].find(m => !existingDevices.some(d => d.model === m)) || AVAILABLE_MODELS['AeroSafe'][0];
  const firstUnusedSerial = AVAILABLE_SERIALS.find(sn => !existingDevices.some(d => d.id === sn)) || AVAILABLE_SERIALS[0];

  const [formData, setFormData] = useState({
    brand: 'AeroSafe' as string,
    model: firstUnusedModel,
    type: 'air' as 'air' | 'energy' | 'water' | 'motion',
    serialNo: firstUnusedSerial,
    firmware: 'v2.1.4',
    installationDate: new Date().toISOString().split('T')[0],
    location: '',
    buildingSite: '',
    protocol: 'MQTT' as 'MQTT' | 'LoRa' | 'HTTP' | 'WiFi' | '4G/LTE',
    interval: 'Every 5 mins',
    battery: 100,
    lat: -1.9441 + (Math.random() - 0.5) * 0.01,
    lng: 30.2012 + (Math.random() - 0.5) * 0.01,
    communication: 'wifi' as 'gsm' | 'wifi'
  });

  const handleBrandChange = (brand: string) => {
    let type: typeof formData.type = 'air';

    switch (brand) {
      case 'AeroSafe':
        type = 'air';
        break;
      case 'EnergyWatch':
        type = 'energy';
        break;
      case 'AquaGuard':
        type = 'water';
        break;
      default:
        type = 'motion';
    }

    const availableList = AVAILABLE_MODELS[brand as keyof typeof AVAILABLE_MODELS] || AVAILABLE_MODELS.Custom;
    const unusedModelForBrand = availableList.find(m => !existingDevices.some(d => d.model === m)) || availableList[0];

    setFormData({
      ...formData,
      brand,
      type,
      model: unusedModelForBrand
    });
  };

  const prefix = formData.brand === 'AeroSafe' ? 'AS' : formData.brand === 'EnergyWatch' ? 'EW' : formData.brand === 'AquaGuard' ? 'AG' : 'CST';
  const cleanSerial = formData.serialNo.replace('SN-', '').replace('-', '');
  const computedGatewayId = `GW-${prefix}-${cleanSerial || 'XXXX'}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.model || !formData.location) return;
    
    onAdd({
      ...formData,
      // friendly name is removed, auto generate friendly name based on Brand + Model
      name: `${formData.brand} (${formData.model})`,
      id: formData.serialNo, // Every device will have its own identical id representing serial number
      gatewayId: computedGatewayId,
    });
  };

  const currentSchema = globalSchemas[formData.brand] || globalSchemas.Custom;

  // Render type label & styling
  const getTypeDisplay = () => {
    switch (formData.type) {
      case 'air': return 'Air Quality';
      case 'energy': return 'Energy Meter';
      case 'water': return 'Water Flow';
      default: return 'Motion Sensor';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-xl bg-[#080d16] border border-[#172134] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          {/* Header section */}
          <div className="p-5 border-b border-[#172134] flex items-center justify-between bg-[#080d16] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] shrink-0">
                <Plus size={20} className="stroke-[2.5]" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-base tracking-tight leading-none">Add new device</h3>
                <p className="text-xs text-[#526a97] mt-1 font-medium font-sans">Register and provision a new sensor node</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full border border-[#172134]/80 flex items-center justify-center text-[#526a97] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          
          {/* Scrollable Form Body */}
          <div className="p-6 overflow-y-auto space-y-4 max-h-[60vh] custom-scroll scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent pr-4">
            
            {/* SECTION 1: Device Identity */}
            <div className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-[#172134]/50 mb-3 ml-1">
              <Cpu size={13} className="text-[#3b82f6]" />
              <span>Device identity</span>
            </div>

            {/* Brand & Locked Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-[#94a3b8] block mb-1.5 ml-1">Device brand</label>
                <div className="relative">
                  <select 
                    id="add-device-brand"
                    value={formData.brand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-[#172136] rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all appearance-none cursor-pointer"
                  >
                    {Object.keys(globalSchemas).map((br) => (
                      <option key={br} value={br}>
                        {br === 'Custom' ? 'Custom Device' : br}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#526a97]">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#94a3b8] flex items-center mb-1.5 ml-1">
                  Type 
                  <span className="ml-1.5 bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide leading-none">
                    locked
                  </span>
                </label>
                <div className="w-full bg-[#10172a]/60 border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-[#4c5d80] font-bold flex items-center gap-2 select-none h-[46px]">
                  {formData.type === 'air' && <Wind size={15} className="text-[#3b82f6]" />}
                  {formData.type === 'energy' && <Zap size={15} className="text-[#a855f7]" />}
                  {formData.type === 'water' && <Droplets size={15} className="text-[#14b8a6]" />}
                  {formData.type === 'motion' && <Activity size={15} className="text-[#94a3b8]" />}
                  <span>{getTypeDisplay()}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#172134]/40 my-1" />

            {/* Model ID Selector & Serial number Selector */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-[#94a3b8] block mb-1.5 ml-1">Model ID</label>
                <div className="relative">
                  <select 
                    id="add-device-model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-[#172136] rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all appearance-none cursor-pointer font-mono"
                  >
                    {(AVAILABLE_MODELS[formData.brand as keyof typeof AVAILABLE_MODELS] || AVAILABLE_MODELS.Custom).map((m) => {
                      const isUsed = existingDevices.some((d) => d.model === m);
                      return (
                        <option key={m} value={m} disabled={isUsed}>
                          {m} {isUsed ? '(Used)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#526a97]">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#94a3b8] flex items-center mb-1.5 ml-1">
                  Serial number 
                  <span className="text-[#ef4444] ml-0.5 font-bold">*</span>
                </label>
                <div className="relative">
                  <select 
                    id="add-device-serial"
                    value={formData.serialNo}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-[#172136] rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all appearance-none cursor-pointer font-mono"
                  >
                    {AVAILABLE_SERIALS.map((sn) => {
                      const isUsed = existingDevices.some((d) => d.id === sn);
                      return (
                        <option key={sn} value={sn} disabled={isUsed}>
                          {sn} {isUsed ? '(Used)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#526a97]">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#172134]/40 my-1" />

            {/* Firmware version selection & Installation date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-[#94a3b8] flex items-center mb-1.5 ml-1">
                  Firmware version
                </label>
                <div className="relative">
                  <select 
                    id="add-device-firmware"
                    value={formData.firmware}
                    onChange={(e) => setFormData({ ...formData, firmware: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-[#172136] rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all appearance-none cursor-pointer font-mono"
                  >
                    {AVAILABLE_FIRMWARES.map((fw) => (
                      <option key={fw} value={fw}>{fw}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#526a97]">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#94a3b8] flex items-center mb-1.5 ml-1">
                  Installation date
                </label>
                <div className="relative font-sans">
                  <input 
                    id="add-device-date"
                    type="date" 
                    value={formData.installationDate}
                    onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-[#172136] rounded-xl px-4 py-[11px] text-sm font-bold text-white outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all cursor-pointer select-none"
                  />
                  <Calendar size={14} className="absolute right-4 top-3.5 text-[#526a97] pointer-events-none" />
                </div>
              </div>
            </div>


            {/* SECTION 2: Location */}
            <div className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-[#172134]/50 pt-3 mb-3 ml-1">
              <MapPin size={13} className="text-[#3b82f6]" />
              <span>Location</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-[#94a3b8] block mb-1.5 ml-1">Location</label>
                <input 
                  id="add-device-location"
                  type="text" 
                  required
                  placeholder="Floor 2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-[#172136] rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all placeholder-[#374668]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#94a3b8] flex items-center mb-1.5 ml-1">
                  Building / site
                </label>
                <input 
                  id="add-device-site"
                  type="text" 
                  placeholder="HQ Kigali"
                  value={formData.buildingSite}
                  onChange={(e) => setFormData({ ...formData, buildingSite: e.target.value })}
                  className="w-full bg-[#0a0f1d] border border-[#172136] rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all placeholder-[#374668]"
                />
              </div>
            </div>


            {/* SECTION 3: Network & Connectivity */}
            <div className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-[#172134]/50 pt-3 mb-3 ml-1">
              <Wifi size={13} className="text-[#3b82f6]" />
              <span>Network & connectivity</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-[#94a3b8] block mb-1.5 ml-1">Protocol</label>
                <div className="relative">
                  <select 
                    id="add-device-proto"
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value as any })}
                    className="w-full bg-[#0a0f1d] border border-[#172136] rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="MQTT">MQTT</option>
                    <option value="LoRa">LoRa</option>
                    <option value="HTTP">HTTP</option>
                    <option value="WiFi">WiFi</option>
                    <option value="4G/LTE">4G/LTE</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#526a97]">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#94a3b8] block mb-1.5 ml-1">Transmission interval</label>
                <div className="relative">
                  <select 
                    id="add-device-interval"
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                    className="w-full bg-[#0a0f1d] border border-[#172136] rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Every 1 min">Every 1 min</option>
                    <option value="Every 5 mins">Every 5 mins</option>
                    <option value="Every 10 mins">Every 10 mins</option>
                    <option value="Every 30 mins">Every 30 mins</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#526a97]">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#172134]/40 my-1" />

            {/* Communication select & Auto Gateway ID row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-[#94a3b8] block mb-1.5 ml-1">Communication Network</label>
                <div className="relative">
                  <select 
                    id="add-device-communication"
                    value={formData.communication}
                    onChange={(e) => setFormData({ ...formData, communication: e.target.value as any })}
                    className="w-full bg-[#0a0f1d] border border-[#172136] rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="wifi">WiFi Wireless</option>
                    <option value="gsm">GSM Cellular Sim</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#526a97]">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#94a3b8] block mb-1.5 ml-1">Gateway ID / Device token</label>
                <div className="relative">
                  <input 
                    id="add-device-token"
                    type="text" 
                    readOnly
                    disabled
                    value={computedGatewayId}
                    className="w-full bg-[#10172a]/60 border border-[#1e293b] rounded-xl px-4 py-3 text-sm font-semibold text-[#829bb0] outline-none select-all font-mono"
                  />
                  <div className="absolute right-3.5 top-3 bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide select-none leading-none">
                    auto
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Payload format structure */}
            <div className="text-[10px] font-extrabold text-[#526a97] uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-[#172134]/50 pt-3 mb-3 ml-1">
              <Code size={13} className="text-[#3b82f6]" />
              <span>Payload format structure</span>
            </div>

            {/* Structured Table Layout */}
            <div className="bg-[#03060c] border border-[#172136]/80 rounded-xl overflow-hidden shadow-inner">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#172136] bg-[#090f1a] text-[#526a97] uppercase tracking-wider text-[10px] font-extrabold">
                    <th className="p-3 pl-4">Sensor Channel</th>
                    <th className="p-3">Telemetry Metric</th>
                    <th className="p-3 pr-4 text-right">Data Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172136]/50">
                  {currentSchema.map((field: string) => {
                    const info = METRIC_DETAILS[field] || { label: 'Generic Telemetry', format: 'Numeric' };
                    return (
                      <tr key={field} className="hover:bg-white/5 transition-all">
                        <td className="p-3 pl-4 font-mono font-bold text-white text-xs">{field}</td>
                        <td className="p-3 text-[#94a3b8]">{info.label}</td>
                        <td className="p-3 pr-4 text-right text-[#3b82f6] font-semibold font-mono text-[11px]">{info.format}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-black/20 text-[#526a97] italic">
                    <td className="p-3 pl-4 font-mono font-bold text-xs">lat / lng</td>
                    <td className="p-3 text-[#526a97]">Device Coordinates (Latitude / Longitude)</td>
                    <td className="p-3 pr-4 text-right font-mono text-[11px] text-[#22c55e]">Auto-captured Decimals</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* Action buttons (sticky footer matching HTML structure precisely) */}
          <div className="p-5 border-t border-[#172134] flex gap-3 bg-[#080d16] shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#0a0f1d] hover:bg-white/5 text-[#94a3b8] hover:text-white border border-[#1e2f4a] font-bold rounded-xl text-sm transition-all active:scale-[0.98] outline-none"
            >
              Discard
            </button>
            <button 
              type="submit"
              className="flex-[1.6] py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-[#e0f2fe] border border-[#2563eb]/30 font-bold rounded-xl text-sm shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] outline-none"
            >
              <Save size={15} />
              <span>Provision sensor</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function SchemaDefinitionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEdit = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { brand: string; oldBrand?: string; protocol: string; fields: string[] }) => void;
  initialData?: { brand: string; protocol: string; fields: string[] };
  isEdit?: boolean;
}) {
  const [brandName, setBrandName] = useState(initialData?.brand || '');
  const [protocol, setProtocol] = useState(initialData?.protocol || '');
  const [fields, setFields] = useState<string[]>(initialData?.fields || []);
  const [newFieldInput, setNewFieldInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setBrandName(initialData.brand);
      setProtocol(initialData.protocol);
      setFields(initialData.fields);
    } else {
      setBrandName('');
      setProtocol('');
      setFields(['data']);
    }
  }, [initialData, isOpen]);

  const handleAddField = () => {
    const val = newFieldInput.trim();
    if (val && !fields.includes(val)) {
      setFields([...fields, val]);
      setNewFieldInput('');
    }
  };

  const handleRemoveField = (fieldToRemove: string) => {
    setFields(fields.filter(f => f !== fieldToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-bg-1 border border-border-main rounded-2xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 border-b border-[#172134] flex items-center justify-between sticky top-0 bg-[#0b0f19] z-10 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6]">
              <Database size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight leading-none">
                {isEdit ? 'Edit Schema Contract' : 'Define New Schema Contract'}
              </h3>
              <p className="text-xs text-[#526a97] mt-1 font-medium font-sans">
                {isEdit ? 'Modify standard specifications' : 'Create new standardized equipment specification'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-[#172134]/80 flex items-center justify-center text-[#526a97] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-left">
            <label className="text-[11px] text-[#94a3b8] block mb-1.5 ml-1 font-semibold uppercase tracking-wider">Hardware Brand / Engine Name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              disabled={isEdit && initialData?.brand === 'Custom'} // Keep Custom locked so we don't accidentally rename fallback
              className="w-full bg-[#0a0f1d] border border-[#172136] rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g. AeroSafe, EnergyWatch"
            />
          </div>

          <div className="text-left">
            <label className="text-[11px] text-[#94a3b8] block mb-1.5 ml-1 font-semibold uppercase tracking-wider">Transmission Protocol / Description</label>
            <input
              type="text"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#172136] rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-all"
              placeholder="e.g. MQTT / JSON Stream, MODBUS / C-RTU"
            />
          </div>

          <div className="text-left">
            <label className="text-[11px] text-[#94a3b8] block mb-1.5 ml-1 font-semibold uppercase tracking-wider">Standardized Parameter Mappings</label>
            <div className="flex flex-wrap gap-1.5 p-3 bg-[#070d16] border border-[#172134] rounded-xl min-h-[64px] mb-2 content-start">
              {fields.length === 0 ? (
                <span className="text-xs text-[#526a97] italic block my-auto">No mapping tags registered. Add one below.</span>
              ) : (
                fields.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0a0f1d] border border-[#172136] rounded-lg text-xs font-mono font-bold text-white">
                    {f}
                    <button
                      type="button"
                      onClick={() => handleRemoveField(f)}
                      className="p-0.5 text-[#526a97] hover:text-nexus-red rounded"
                    >
                      <CircleX size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFieldInput}
                onChange={(e) => setNewFieldInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddField();
                  }
                }}
                placeholder="Add mapping tag (e.g. temperature)..."
                className="flex-1 bg-[#0a0f1d] border border-[#172136] rounded-xl px-4 py-2 text-xs font-mono font-bold text-white outline-none focus:border-[#3b82f6] transition-all"
              />
              <button
                type="button"
                onClick={handleAddField}
                className="px-4 bg-[#3b82f6]/10 text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white border border-[#3b82f6]/25 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border-main bg-bg-2/30 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-bg-2 border border-border-main rounded-xl text-xs font-bold text-text-light hover:bg-[#1e293b]/50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => {
              if (!brandName.trim()) return;
              onSave({
                brand: brandName.trim(),
                oldBrand: isEdit ? initialData?.brand : undefined,
                protocol: protocol.trim() || 'Custom Mapping',
                fields
              });
            }}
            disabled={!brandName.trim()}
            className="px-5 py-2.5 bg-[#3b82f6] border border-[#3b82f6]/50 rounded-xl text-xs font-bold text-white hover:bg-[#2563eb] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Save Changes' : 'Create Definition'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
