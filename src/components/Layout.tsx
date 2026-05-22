import { ReactNode } from 'react';
import { 
  BarChart3, 
  Settings as SettingsIcon, 
  Bell, 
  LayoutDashboard, 
  Activity, 
  Database, 
  Map as MapIcon, 
  Link as LinkIcon, 
  Shield, 
  User, 
  Search,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { TabType } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../lib/i18n';
import { Logo } from './Logo';

interface LayoutProps {
  children: ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  timeStr: string;
  user: any;
  onLogout: () => void;
}

const Sidebar = ({ activeTab, setTab, user, onLogout }: { activeTab: TabType, setTab: (t: TabType) => void, user: any, onLogout: () => void }) => {
  const { language } = useSettings();
  const t = useTranslation(language);

  const sections = [
    { title: t('main'), items: [
      { id: 'overview', icon: LayoutDashboard, label: t('overview') },
      { id: 'monitor', icon: Activity, label: t('monitor') },
    ]},
    { title: t('sensors'), items: [
      { 
        id: 'registry', 
        icon: Database, 
        label: 'Device Registry',
        children: [
          { id: 'registry-inventory', label: 'Devices' },
          { id: 'registry-definition', label: 'Data Definition' },
        ]
      },
      { 
        id: 'floormap', 
        icon: MapIcon, 
        label: t('floormap'),
        children: [
          { id: 'floormap-devices', label: 'Devices' },
          { id: 'floormap-layout', label: 'Layout' },
        ]
      },
      { id: 'configuration', icon: SettingsIcon, label: t('configuration') },
    ]},
    { title: t('analytics'), items: [
      { id: 'explorer', icon: BarChart3, label: t('data') },
    ]},
    { title: t('operations'), items: [
      { id: 'alerts', icon: Bell, label: t('alerts'), badge: 3 },
    ]},
    { title: t('system'), items: [
      { id: 'integrations', icon: LinkIcon, label: t('integrations') },
      { id: 'security', icon: Shield, label: t('security') },
      { id: 'admin', icon: User, label: t('admin') },
      { id: 'settings', icon: SettingsIcon, label: t('settings') },
    ]}
  ];

  return (
    <aside className="w-56 bg-bg-1 border-r border-border-main flex flex-col shrink-0 z-10 transition-colors duration-200">
      <div className="p-[15px_20px] border-b border-border-main flex items-center gap-3">
        <Logo size={32} />
        <div className="text-sm font-black tracking-widest uppercase">
          <span className="text-white">ISHMA</span>
          <span className="text-nexus-blue">TEK</span>
        </div>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-2">
            <div className="px-4 pt-1 pb-1.5 text-[10px] font-semibold text-text-muted tracking-widest uppercase">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isParentActive = activeTab === item.id || (item.children?.some(c => c.id === activeTab));
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (item.children) {
                        setTab(item.children[0].id as TabType);
                      } else {
                        setTab(item.id as TabType);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-5 py-2.5 text-left text-[13px] font-normal transition-all relative group",
                      isParentActive 
                        ? "bg-nexus-blue/10 text-nexus-blue font-medium" 
                        : "text-text-dim hover:bg-bg-3 hover:text-text-main"
                    )}
                  >
                    {isParentActive && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute left-0 top-0 bottom-0 w-[3px] bg-nexus-blue rounded-r"
                      />
                    )}
                    <item.icon size={15} className="min-w-[18px]" />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        "ml-auto text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                        item.badgeColor || "bg-nexus-red"
                      )}>
                        {item.badge}
                      </span>
                    )}
                    {item.children && (
                      <div className={cn(
                        "ml-auto transition-transform duration-200",
                        isParentActive ? "rotate-180" : ""
                      )}>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                  
                  {item.children && isParentActive && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden bg-bg-0/50"
                    >
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => setTab(child.id as TabType)}
                          className={cn(
                            "w-full flex items-center gap-2.5 pl-12 pr-4 py-2 text-left text-[12px] transition-all",
                            activeTab === child.id 
                              ? "text-nexus-blue font-bold" 
                              : "text-text-muted hover:text-text-main hover:bg-bg-3"
                          )}
                        >
                          {child.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-[14px_20px] border-t border-border-main">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-nexus-blue to-nexus-blue/80 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'OP'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate">{user?.name || 'A. Kamau'}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">{user?.role || 'Senior Operator'}</div>
          </div>
          <button 
            onClick={onLogout}
            className="p-1.5 text-text-muted hover:text-nexus-red transition-colors"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default function Layout({ children, activeTab, setActiveTab, timeStr, user, onLogout }: LayoutProps) {
  const { language } = useSettings();
  const t = useTranslation(language);

  return (
    <div className="flex h-screen bg-bg-0 text-text-main overflow-hidden selection:bg-nexus-blue/30 transition-colors duration-200">
      <Sidebar activeTab={activeTab} setTab={setActiveTab} user={user} onLogout={onLogout} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-bg-1 border-b border-border-main px-6 flex items-center gap-4 shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-3 text-[13px] text-text-dim">
            <Logo size={18} />
            <span className="font-black tracking-widest text-[10px]">ISHMATEK</span>
            <span className="text-text-muted">/</span>
            <span className="text-text-main font-medium capitalize">
              {t(activeTab)}
            </span>
            <span className="text-text-muted">/</span>
            <span>HQ Complex A</span>
          </div>
          
          <div className="ml-auto flex items-center gap-3">
            <div className="bg-bg-2 border border-border-main rounded-lg px-3 py-1.5 flex items-center gap-2 text-text-muted w-48 focus-within:w-64 focus-within:border-nexus-blue transition-all duration-300">
              <Search size={14} />
              <input 
                type="text" 
                placeholder={t('search')} 
                className="bg-transparent border-none outline-none text-xs text-text-dim w-full placeholder:text-text-muted"
              />
            </div>
            
            <button className="w-[34px] h-[34px] rounded-lg bg-bg-2 border border-border-main flex items-center justify-center text-text-dim hover:bg-bg-3 hover:text-text-main transition-colors relative group">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-nexus-red border-[1.5px] border-bg-1" />
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className="w-[34px] h-[34px] rounded-lg bg-bg-2 border border-border-main flex items-center justify-center text-text-dim hover:bg-bg-3 hover:text-text-main transition-colors"
            >
              <SettingsIcon size={16} />
            </button>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-nexus-teal/10 text-nexus-teal border border-nexus-teal/20 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-nexus-teal animate-pulse" />
              {t('systemNormal')}
            </div>
            
            <div className="font-mono text-xs text-text-dim">
              {timeStr}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 relative bg-bg-0 transition-colors duration-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
