import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Layers,
  Settings,
  Plus,
  Navigation,
  Globe,
  Info,
  User,
  Zap,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../lib/i18n';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { Map as PigeonMap, Overlay as PigeonOverlay } from 'pigeon-maps';
import GoogleMapsHelpModal from './GoogleMapsHelpModal';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(GOOGLE_MAPS_API_KEY) && GOOGLE_MAPS_API_KEY.startsWith('AIza') && GOOGLE_MAPS_API_KEY.length > 20;

// Dark map provider for OpenStreetMap tiles (CartoDB Dark Matter style matching our UI)
const cartoDarkProvider = (x: number, y: number, z: number) => {
  return `https://basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`;
};

// Data mirrored from Registry for synchronization
const DEVICES = [
  { id: 'SN-AS-001', name: 'Ambient Sync Alpha', type: 'air', lat: -1.9441, lng: 30.2012, status: 'ok' },
  { id: 'SN-EW-202', name: 'EnergyWatch Pro', type: 'energy', lat: -1.9445, lng: 30.2018, status: 'ok' },
  { id: 'SN-AG-043', name: 'AquaGauge Gen 2', type: 'water', lat: -1.9448, lng: 30.2020, status: 'warn' },
  { id: 'SN-AS-009', name: 'Lab Beacon', type: 'air', lat: -1.9440, lng: 30.2025, status: 'ok' },
  { id: 'SN-EW-210', name: 'HVAC Monitor', type: 'energy', lat: -1.9450, lng: 30.2030, status: 'crit' },
];

const USERS = [
  { id: 'U-001', name: 'Jean Luc', role: 'Super Admin', lat: -1.9441, lng: 30.0619, status: 'online' },
  { id: 'U-002', name: 'Alice Smith', role: 'Operator', lat: 51.5074, lng: -0.1278, status: 'online' },
  { id: 'U-003', name: 'Bob Johnson', role: 'Technician', lat: -1.2921, lng: 36.8219, status: 'offline' },
];

export default function FloorMap({ user, initialView = 'devices' }: { user?: any, initialView?: 'devices' | 'users' | 'layout' }) {
  const { language } = useSettings();
  const t = useTranslation(language);
  const [currentView, setCurrentView] = useState<'devices' | 'users'>(initialView === 'users' ? 'users' : 'devices');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [mapMode, setMapMode] = useState<'indoor' | 'outdoor'>(initialView === 'layout' ? 'indoor' : 'outdoor');
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [mapProvider, setMapProvider] = useState<'osm' | 'google'>('osm');

  const isMapAvailable = true;

  const [devices, setDevices] = useState(() => {
    const saved = localStorage.getItem('nexus_sensors');
    return saved ? JSON.parse(saved) : DEVICES;
  });

  const [users, setUsers] = useState(() => {
    const baseUsers = [...USERS];
    if (user && user.lat && user.lng) {
      return [{
        id: 'U-CURRENT',
        name: user.name + ' (You)',
        role: user.role,
        lat: user.lat,
        lng: user.lng,
        status: 'online'
      }, ...baseUsers.filter(u => u.id !== 'U-CURRENT')];
    }
    return baseUsers;
  });

  useEffect(() => {
    if (initialView === 'layout') {
      setMapMode('indoor');
      setCurrentView('devices');
    } else {
      setMapMode('outdoor');
      setCurrentView(initialView as 'devices' | 'users');
    }
  }, [initialView]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [resDev, resUsr] = await Promise.all([
          fetch('/api/devices'),
          fetch('/api/users')
        ]);
        if (resDev.ok) {
          const devList = await resDev.json();
          setDevices(devList);
        }
        if (resUsr.ok) {
          const usrList = await resUsr.json();
          if (user && user.lat && user.lng) {
            setUsers([
              {
                id: 'U-CURRENT',
                name: user.name + ' (You)',
                role: user.role,
                lat: user.lat,
                lng: user.lng,
                status: 'online'
              },
              ...usrList.filter((u: any) => u.id !== 'U-CURRENT')
            ]);
          } else {
            setUsers(usrList);
          }
        }
      } catch (err) {
        console.warn('API Offline. Gracefully falling back to baseline simulation states.', err);
      }
    };

    fetchLocations();
    const mapPollTimer = setInterval(fetchLocations, 2500);
    return () => clearInterval(mapPollTimer);
  }, [user]);

  // Center map on selected entity if exists
  const mapCenter = selectedEntity 
    ? { lat: selectedEntity.lat, lng: selectedEntity.lng }
    : currentView === 'devices' 
      ? { lat: -1.9445, lng: 30.2025 } // Default center for devices
      : { lat: -1.9441, lng: 30.0619 }; // Default center for users

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ok':
      case 'online': return 'bg-nexus-teal';
      case 'warn': return 'bg-nexus-amber';
      case 'crit': return 'bg-nexus-red';
      default: return 'bg-text-muted';
    }
  };

  if (mapMode === 'outdoor' && !isMapAvailable) {
    return (
      <div className="p-6 h-full flex flex-col gap-6 animate-in fade-in duration-500">
        <GoogleMapsHelpModal isOpen={showSetupGuide} onClose={() => setShowSetupGuide(false)} />
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold mb-1">{t('floormapTitle')}</h1>
              <p className="text-sm text-text-dim">Spatial tracking for assets and personnel</p>
            </div>

          {user && user.lat && user.lng && (
            <div className="flex items-center gap-3 pl-6 ml-6 border-l border-border-main/50">
              <div className="w-10 h-10 rounded-full bg-nexus-blue/10 flex items-center justify-center text-nexus-blue border border-nexus-blue/20 shadow-inner">
                <User size={20} />
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] leading-tight mb-0.5">Operator Origin</div>
                <div className="text-xs font-bold text-text-main flex items-center gap-2">
                  {user.name}
                  <span className="w-1.5 h-1.5 rounded-full bg-nexus-teal animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-text-dim font-mono tracking-tighter">
                  <Navigation size={8} className="text-nexus-teal" /> 
                  <span className="opacity-80">{user.lat.toFixed(4)}°N</span>
                  <span className="opacity-40">/</span>
                  <span className="opacity-80">{user.lng.toFixed(4)}°E</span>
                </div>
              </div>
            </div>
          )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
              <span>Spatial</span>
              <span className="text-nexus-blue">/</span>
              <span className="text-text-main">Demo Trace Mode</span>
            </div>
            <button
              onClick={() => setShowSetupGuide(true)}
              className="px-3 py-1.5 bg-nexus-blue hover:bg-nexus-blue/90 border border-nexus-blue/30 text-white rounded-xl text-xs font-bold shadow-lg shadow-nexus-blue/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Globe size={12} className="animate-pulse" />
              Configure Live Google Map
            </button>
          </div>
        </div>

        <div className="flex-1 rounded-3xl bg-bg-1 border border-border-main overflow-hidden relative shadow-inner group">
          <div className="absolute inset-0 bg-[#0b0e14] overflow-hidden">
            {/* Grid Pattern Background to look like a map */}
            <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0b0e14_70%)]" />
            
            {/* Mock Markers */}
            {(currentView === 'users' ? users : devices).map((item: any) => (
              <div 
                key={item.id}
                className="absolute transition-all duration-1000"
                style={{ 
                  left: `${((item.lng - 30.061) * 123456) % 80 + 10}%`, 
                  top: `${((item.lat + 1.944) * 123456) % 80 + 10}%` 
                }}
              >
                <div className="relative flex flex-col items-center">
                  {/* Pulse Effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-full animate-ping opacity-20",
                    getStatusColor(item.status)
                  )} style={{ animationDuration: '3s' }} />
                  
                  <button 
                    onClick={() => setSelectedEntity(item)}
                    className="group/marker relative flex items-center justify-center z-10"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white border-2 border-bg-1 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all hover:scale-110 active:scale-95",
                      getStatusColor(item.status),
                      item.id === 'U-CURRENT' && "ring-4 ring-nexus-blue/30"
                    )}>
                      {currentView === 'users' ? <User size={18} /> : <Zap size={18} />}
                    </div>
                  </button>

                  <div className="mt-2 bg-black/60 backdrop-blur-xs border border-white/10 px-2 py-0.5 rounded text-[9px] font-black text-white/90 whitespace-nowrap tracking-tighter uppercase italic shadow-sm pointer-events-none">
                    {item.name}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute top-6 left-6 flex flex-col gap-3">
            <div className="px-4 py-2 bg-nexus-teal/10 border border-nexus-teal/30 rounded-full text-[10px] font-bold text-nexus-teal flex items-center gap-2 backdrop-blur-md shadow-lg">
              <Globe size={12} className="animate-spin-slow" /> ENFORCED PROXIMITY GRID: NOMINAL
            </div>
          </div>
          
          {/* Entity Detail Popup (Floating) copy for fallback */}
          {selectedEntity && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 right-6 w-72 bg-bg-1/95 backdrop-blur-md border border-border-main rounded-2xl p-4 shadow-2xl z-10"
            >
               <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2">
                   <div className={cn("w-2 h-2 rounded-full", getStatusColor(selectedEntity.status))} />
                   <span className="text-xs font-bold text-text-main">{selectedEntity.name}</span>
                 </div>
                 <button onClick={() => setSelectedEntity(null)} className="text-text-muted hover:text-text-main">
                   <Plus className="rotate-45" size={14} />
                 </button>
               </div>
               <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-4">
                 <div className="bg-bg-2 p-2 rounded-lg border border-border-main/50">
                   <div className="text-text-dim mb-1 uppercase">LAT</div>
                   <div className="text-text-main">{selectedEntity.lat.toFixed(6)}</div>
                 </div>
                 <div className="bg-bg-2 p-2 rounded-lg border border-border-main/50">
                   <div className="text-text-dim mb-1 uppercase">LNG</div>
                   <div className="text-text-main">{selectedEntity.lng.toFixed(6)}</div>
                 </div>
               </div>
               <button className="w-full py-2 bg-nexus-blue/10 text-nexus-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-nexus-blue/20 transition-all border border-nexus-blue/20">
                 Open Diagnostics
               </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 h-full animate-in fade-in duration-500 overflow-hidden transition-colors duration-200">
      <GoogleMapsHelpModal isOpen={showSetupGuide} onClose={() => setShowSetupGuide(false)} />
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold mb-1">{t('floormapTitle')}</h1>
            <p className="text-sm text-text-dim">Spatial tracking for assets and personnel</p>
          </div>

          {user && user.lat && user.lng && (
            <div className="flex items-center gap-3 pl-6 ml-6 border-l border-border-main/50">
              <div className="w-10 h-10 rounded-full bg-nexus-blue/10 flex items-center justify-center text-nexus-blue border border-nexus-blue/20 shadow-inner">
                <User size={20} />
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] leading-tight mb-0.5">Operator Origin</div>
                <div className="text-xs font-bold text-text-main flex items-center gap-2">
                  {user.name}
                  <span className="w-1.5 h-1.5 rounded-full bg-nexus-teal animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-text-dim font-mono tracking-tighter">
                  <Navigation size={8} className="text-nexus-teal" /> 
                  <span className="opacity-80">{user.lat.toFixed(4)}°N</span>
                  <span className="opacity-40">/</span>
                  <span className="opacity-80">{user.lng.toFixed(4)}°E</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
          <span>Spatial</span>
          <span className="text-nexus-blue">/</span>
          <span className="text-text-main">{mapMode === 'indoor' ? 'Indoor Layout' : currentView === 'users' ? 'User Tracking' : 'Device Sites'}</span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 rounded-3xl bg-bg-1 border border-border-main overflow-hidden relative shadow-inner">
           {mapMode === 'outdoor' ? (
             <div className="w-full h-full relative">
               {/* Map Controls */}
               <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                 <button 
                   onClick={() => setMapProvider(prev => prev === 'osm' ? 'google' : 'osm')}
                   className="px-3 py-1.5 bg-bg-1/90 hover:bg-bg-2 border border-border-main text-[10px] font-bold uppercase tracking-wider text-text-main rounded-xl shadow-lg flex items-center gap-1.5 transition-all active:scale-[0.98]"
                 >
                   <Globe size={11} className="text-nexus-teal animate-pulse" />
                   Active: {mapProvider === 'osm' ? 'OpenStreetMap (Instant)' : 'Google Maps'}
                 </button>
                 <button 
                   onClick={() => setShowSetupGuide(true)}
                   className="px-3 py-1.5 bg-bg-1/90 hover:bg-bg-2 border border-border-main text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-nexus-blue rounded-xl shadow-lg flex items-center gap-1.5 transition-all active:scale-[0.98]"
                 >
                   <Settings size={11} className="text-nexus-blue" />
                   Setup Google Key
                 </button>
               </div>

               {/* Map Provider Selection Bar (Top Right) */}
               <div className="absolute top-4 right-4 z-10 bg-bg-1/90 backdrop-blur border border-border-main p-1 rounded-xl shadow-lg flex gap-1">
                 <button
                   type="button"
                   onClick={() => setMapProvider('osm')}
                   className={cn(
                     "px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all",
                     mapProvider === 'osm'
                       ? "bg-nexus-blue text-white shadow-xs"
                       : "text-text-muted hover:text-text-main hover:bg-bg-2"
                   )}
                 >
                   Cyber Dark OSM
                 </button>
                 <button
                   type="button"
                   onClick={() => setMapProvider('google')}
                   className={cn(
                     "px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all",
                     mapProvider === 'google'
                       ? "bg-nexus-blue text-white shadow-xs"
                       : "text-text-muted hover:text-text-main hover:bg-bg-2"
                   )}
                 >
                   Google Maps
                 </button>
               </div>

               {mapProvider === 'osm' ? (
                 <PigeonMap
                   center={[mapCenter.lat, mapCenter.lng]}
                   zoom={currentView === 'devices' ? 16 : 3}
                   provider={cartoDarkProvider}
                 >
                   {(currentView === 'users' ? users : devices).map((item: any) => (
                     <PigeonOverlay
                       key={item.id}
                       anchor={[item.lat, item.lng]}
                       offset={[16, 16]}
                     >
                       <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                         <div className={cn(
                           "absolute inset-0 rounded-full animate-ping opacity-20 w-8 h-8 -mt-4 -ml-4",
                           getStatusColor(item.status)
                         )} style={{ animationDuration: '3s' }} />
                         
                         <button 
                           onClick={() => setSelectedEntity(item)}
                           className="group/marker relative flex items-center justify-center z-10 animate-in fade-in duration-300"
                         >
                           <div className={cn(
                             "w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-bg-1 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all hover:scale-110 active:scale-95",
                             getStatusColor(item.status),
                             item.id === 'U-CURRENT' && "ring-3 ring-nexus-blue/30"
                           )}>
                             {currentView === 'users' ? <User size={14} /> : <Zap size={14} />}
                           </div>
                         </button>

                         <div className="mt-1 bg-black/75 backdrop-blur-xs border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-black text-white/90 whitespace-nowrap tracking-tighter uppercase italic shadow-sm pointer-events-none">
                           {item.name}
                         </div>
                       </div>
                     </PigeonOverlay>
                   ))}
                 </PigeonMap>
               ) : (
                 <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
                    <Map
                      center={mapCenter}
                      defaultZoom={currentView === 'devices' ? 17 : 4}
                      disableDefaultUI={true}
                      className="w-full h-full"
                      renderingType="RASTER"
                      mapId="DEMO_MAP_ID"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    >
                      {currentView === 'devices' && devices.map((d: any) => (
                        <Marker 
                          key={d.id}
                          position={{ lat: d.lat, lng: d.lng }}
                          onClick={() => setSelectedEntity(d)}
                          title={d.name}
                        />
                      ))}
                      {currentView === 'users' && users.map((u: any) => (
                        <Marker 
                          key={u.id}
                          position={{ lat: u.lat, lng: u.lng }}
                          onClick={() => setSelectedEntity(u)}
                          title={u.name}
                        />
                      ))}
                    </Map>
                 </APIProvider>
               )}
             </div>
           ) : (
             <div className="w-full h-full border-2 border-dashed border-border-main bg-bg-2/30 flex flex-col items-center justify-center text-center p-12">
                <Globe className="text-text-muted/20 mb-4" size={48} />
                <h3 className="text-lg font-bold text-text-main uppercase italic mb-2 tracking-tight">Indoor Layout View</h3>
                <p className="text-sm text-text-dim max-w-sm mb-6">Switch to 'Sites' to visualize GPS locations, or define your indoor floor plan here.</p>
                <button className="flex items-center gap-2 px-6 py-2 bg-nexus-blue text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-nexus-blue/90 transition-all">
                  <Plus size={14} /> Add Floor Plan
                </button>
             </div>
           )}

           {/* Entity Detail Popup (Floating) */}
           {selectedEntity && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute top-6 right-6 w-72 bg-bg-1/95 backdrop-blur-md border border-border-main rounded-2xl p-4 shadow-2xl z-10"
             >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(selectedEntity.status))} />
                    <span className="text-xs font-bold text-text-main">{selectedEntity.name}</span>
                  </div>
                  <button onClick={() => setSelectedEntity(null)} className="text-text-muted hover:text-text-main">
                    <Plus className="rotate-45" size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-4">
                  <div className="bg-bg-2 p-2 rounded-lg border border-border-main/50">
                    <div className="text-text-dim mb-1 uppercase">LAT</div>
                    <div className="text-text-main">{selectedEntity.lat.toFixed(6)}</div>
                  </div>
                  <div className="bg-bg-2 p-2 rounded-lg border border-border-main/50">
                    <div className="text-text-dim mb-1 uppercase">LNG</div>
                    <div className="text-text-main">{selectedEntity.lng.toFixed(6)}</div>
                  </div>
                </div>
                <button className="w-full py-2 bg-nexus-blue/10 text-nexus-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-nexus-blue/20 transition-all border border-nexus-blue/20">
                  Open Diagnostics
                </button>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  );
}
