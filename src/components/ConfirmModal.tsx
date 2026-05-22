import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info' | 'warning';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-sm bg-bg-1 border border-border-main rounded-2xl shadow-2xl overflow-hidden overflow-y-auto max-h-screen"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-main">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-bg-3 rounded-lg text-text-muted transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-text-dim mb-8">
                {message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-bg-2 hover:bg-bg-3 text-text-main font-bold rounded-xl transition-all border border-border-main"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "flex-1 py-2.5 px-4 text-white font-bold rounded-xl transition-all shadow-lg",
                    variant === 'danger' ? "bg-nexus-red hover:bg-nexus-red/90 shadow-nexus-red/20" : 
                    variant === 'warning' ? "bg-nexus-amber hover:bg-nexus-amber/90 shadow-nexus-amber/20" :
                    "bg-nexus-blue hover:bg-nexus-blue/90 shadow-nexus-blue/20"
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


