import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../lib/i18n';
import { Language, Theme } from '../types';
import { Globe, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Settings() {
  const { language, setLanguage, theme, setTheme } = useSettings();
  const t = useTranslation(language);

  const languages: { id: Language, label: string, native: string }[] = [
    { id: 'en', label: 'English', native: 'English' },
    { id: 'fr', label: 'French', native: 'Français' },
    { id: 'sw', label: 'Kiswahili', native: 'Kiswahili' },
    { id: 'rw', label: 'Kinyarwanda', native: 'Kinyarwanda' },
  ];

  return (
    <div className="p-6 flex flex-col gap-6 animate-in fade-in duration-500 overflow-y-auto h-full">
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold mb-1">{t('settings')}</h1>
        <p className="text-sm text-text-dim mb-6">Customize your dashboard experience.</p>

        <div className="space-y-6">
          {/* Language Selection */}
          <div className="bg-bg-1 border border-border-main rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border-main flex items-center gap-2">
              <Globe size={18} className="text-nexus-blue" />
              <h2 className="text-sm font-semibold">{t('language')}</h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={cn(
                    "flex flex-col p-3 rounded-lg border text-left transition-all",
                    language === lang.id 
                      ? "bg-nexus-blue/10 border-nexus-blue ring-1 ring-nexus-blue/30" 
                      : "bg-bg-2 border-border-main hover:border-nexus-blue/30"
                  )}
                >
                  <span className="text-xs font-bold">{lang.native}</span>
                  <span className="text-[10px] text-text-dim">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Appearance Selection */}
          <div className="bg-bg-1 border border-border-main rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border-main flex items-center gap-2">
              <Moon size={18} className="text-nexus-purple" />
              <h2 className="text-sm font-semibold">{t('theme')}</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border transition-all",
                  theme === 'dark' 
                    ? "bg-nexus-blue/10 border-nexus-blue ring-1 ring-nexus-blue/30" 
                    : "bg-bg-2 border-border-main hover:border-nexus-blue/30"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-bg-1 border border-border-main flex items-center justify-center text-text-main">
                  <Moon size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{t('darkMode')}</span>
                </div>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border transition-all",
                  theme === 'light' 
                    ? "bg-nexus-blue/10 border-nexus-blue ring-1 ring-nexus-blue/30" 
                    : "bg-bg-2 border-border-main hover:border-nexus-blue/30"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-white border border-border-main flex items-center justify-center text-slate-900">
                  <Sun size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{t('lightMode')}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
