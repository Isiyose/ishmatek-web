import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Map, 
  User, 
  Settings, 
  Layers, 
  Key, 
  CreditCard, 
  ExternalLink, 
  FileText, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { useState } from 'react';

interface GoogleMapsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleMapsHelpModal({ isOpen, onClose }: GoogleMapsHelpModalProps) {
  const [copiedKey, setCopiedKey] = useState(false);

  const steps = [
    {
      icon: <User className="text-nexus-blue" size={18} />,
      title: "1. Switch Google Account",
      desc: "Open the Google Cloud Console and ensure you select your Firebase-associated account:",
      highlight: "ishimwejeanluc10@gmail.com",
      subDesc: "Click your avatar in the top-right corner of Google Cloud to match this active profile."
    },
    {
      icon: <Layers className="text-nexus-purple" size={18} />,
      title: "2. Select Firebase Project",
      desc: "Select your project in the top bar dropdown menu:",
      highlight: "ishmatek-4d874",
      subDesc: "All Firebase databases share their parent project context inside the Google Cloud Console."
    },
    {
      icon: <Map className="text-nexus-teal" size={18} />,
      title: "3. Enable Maps JavaScript API",
      desc: "Go to API Library or search for \"Maps JavaScript API\" and click ENABLE.",
      highlight: "Maps JavaScript API",
      subDesc: "Note: The web client map requires this exact API to render pins, zoom details, and layouts."
    },
    {
      icon: <CreditCard className="text-nexus-amber" size={18} />,
      title: "4. Verify Active Billing on project",
      desc: "Go to Billing in the navigation drawer and link a billing account to your project.",
      highlight: "Billing Account Required",
      subDesc: "Google Maps charges $0.00 up to 10k standard loads per month (with a $200 free credit), but GCP enforces that a payment method is verified to resolve the map loads."
    },
    {
      icon: <Key className="text-nexus-teal" size={18} />,
      title: "5. Generate Credentials Key",
      desc: "Go to APIs & Services -> Credentials, click \"+ Create Credentials\" and choose API key.",
      highlight: "Create API Key",
      subDesc: "Copy this key (starts with AIza...) to paste into AI Studio Secrets."
    },
    {
      icon: <Settings className="text-nexus-blue" size={18} />,
      title: "6. Inject Key into AI Studio Secrets",
      desc: "Click the ⚙️ Gear Icon (top-right corner of AI Studio) -> Secrets.",
      highlight: "Secret Name: GOOGLE_MAPS_PLATFORM_KEY",
      subDesc: "Provide GOOGLE_MAPS_PLATFORM_KEY as Key and paste your AIza... token. Press Enter to save."
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-2xl bg-bg-1 border border-border-main rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border-main flex items-center justify-between bg-bg-1/50 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-nexus-blue/10 flex items-center justify-center text-nexus-blue border border-nexus-blue/20">
                  <Map size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-text-main text-lg">Google Maps Key Setup Guide</h3>
                  <p className="text-xs text-text-muted">Resolving offline map loads for ishmwejeanluc10@gmail.com</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-bg-3 rounded-xl text-text-muted hover:text-text-main transition-all active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            {/* Instruction Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-nexus-blue/5 border border-nexus-blue/20 p-4 rounded-2xl flex gap-3 text-xs leading-relaxed text-text-dim">
                <AlertTriangle size={18} className="text-nexus-blue shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-main">Automatic Integration Ready:</span> We have loaded the map components inside the code. Once you define the <code className="bg-bg-3 px-1 py-0.5 rounded font-mono text-nexus-blue">GOOGLE_MAPS_PLATFORM_KEY</code> secret, AI Studio will automatically rebuild and run the physical geographic tracking!
                </div>
              </div>

              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="flex gap-4 p-4 rounded-xl bg-bg-2 border border-border-main/40 hover:border-border-main transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-bg-1 flex items-center justify-center border border-border-main/50 shadow-xs shrink-0 font-bold text-xs font-mono text-text-muted">
                      {step.icon}
                    </div>
                    <div className="flex-1 text-xs">
                      <h4 className="font-bold text-text-main text-sm mb-1">{step.title}</h4>
                      <p className="text-text-muted leading-relaxed mb-1">{step.desc}</p>
                      {step.highlight && (
                        <div className="font-mono text-[11px] bg-bg-0 border border-border-main px-2 py-1 rounded w-fit text-nexus-teal font-bold mb-2">
                          {step.highlight}
                        </div>
                      )}
                      <p className="text-text-dim text-[11px] leading-relaxed italic border-l-2 border-border-main pl-3">
                        {step.subDesc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer console shortcut */}
            <div className="p-6 bg-bg-1/50 border-t border-border-main sticky bottom-0 z-10 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3 text-xs items-center text-text-dim">
                <FileText className="text-text-muted" size={16} />
                <span>Account Project ID is <code className="bg-bg-2 px-1.5 py-0.5 rounded font-mono font-bold text-text-main">ishmatek-4d874</code></span>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-main bg-bg-2 border border-border-main rounded-xl transition-all"
                >
                  Dismiss Guide
                </button>
                <a 
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-nexus-blue hover:bg-nexus-blue/90 text-white rounded-xl text-xs font-bold shadow-lg shadow-nexus-blue/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Open Google Cloud Console
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
