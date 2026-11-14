import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { MobileAppDownloadModal } from './MobileAppDownloadModal';
import { languageService } from '../services/languageService';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'button' | 'badge' | 'menuItem';
  onOpenModal?: () => void;
  language?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'button',
  onOpenModal,
  language
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGeneralModal, setShowGeneralModal] = useState(false);
  const activeLang = language || languageService.getCurrentLanguage();
  const isEn = activeLang === 'en';

  const handleTrigger = () => {
    if (onOpenModal) {
      onOpenModal();
    } else if (isInstallable) {
      install();
    } else {
      setShowGeneralModal(true);
    }
  };

  // If already installed as standalone PWA app, return small badge
  if (isInstalled) {
    if (variant === 'badge') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          <span>{isEn ? 'PWA Installed' : 'Đã Cài App PWA'}</span>
        </span>
      );
    }
    return null;
  }

  // Chromium / Android / Windows / macOS Desktop install flow
  if (isInstallable) {
    if (variant === 'menuItem') {
      return (
        <button
          onClick={install}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition ${className}`}
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>{isEn ? 'Install Hồn Đất Việt App' : 'Cài ứng dụng Hồn Đất Việt'}</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] border border-[var(--gold)] text-[#FFFDF8] font-bold text-xs rounded-xl shadow-sm transition active:scale-95 ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isEn ? 'Install App' : 'Cài Ứng Dụng'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'menuItem' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-300 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition ${className}`}
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>{isEn ? 'Install App on iPhone/iPad' : 'Cài app trên iPhone/iPad'}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--bg)] border border-[var(--gold)] hover:bg-[#F3E5CD] text-[var(--primary)] text-xs font-semibold rounded-xl transition ${className}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isEn ? 'Install on iOS' : 'Cài trên iOS'}</span>
          </button>
        )}

        {showIOSGuide && (
          <MobileAppDownloadModal
            isOpen={showIOSGuide}
            onClose={() => setShowIOSGuide(false)}
          />
        )}
      </>
    );
  }

  // Default fallback for any desktop/browser (shows general mobile download modal)
  return (
    <>
      {variant === 'menuItem' ? (
        <button
          onClick={handleTrigger}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition ${className}`}
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>{isEn ? 'Mobile App' : 'Tải App Mobile'}</span>
        </button>
      ) : (
        <button
          onClick={handleTrigger}
          className={`flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] border border-[var(--gold)] text-[#FFFDF8] font-bold text-xs rounded-xl shadow-sm transition active:scale-95 ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isEn ? 'Mobile App' : 'Tải App Mobile'}</span>
        </button>
      )}

      {showGeneralModal && (
        <MobileAppDownloadModal
          isOpen={showGeneralModal}
          onClose={() => setShowGeneralModal(false)}
        />
      )}
    </>
  );
};

