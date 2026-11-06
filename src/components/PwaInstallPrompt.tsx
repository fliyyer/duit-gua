import React, { useState, useEffect } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { Icon } from './Icon';

const DISMISSED_KEY = 'duit_gua_pwa_dismissed_at';

export const PwaInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, installApp } = usePwaInstall();
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (isInstalled) {
      setShowBanner(false);
      return;
    }

    // Check if user dismissed prompt recently (last 3 days)
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 3) {
        return;
      }
    }

    // Wait 2 seconds after page load before showing
    const timer = setTimeout(() => {
      if (isInstallable || isIOS) {
        setShowBanner(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, isIOS]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setShowBanner(false);
  };

  const handleInstallClick = async () => {
    const outcome = await installApp();
    if (outcome === 'ios') {
      setShowIosGuide(true);
    } else if (outcome === 'accepted') {
      setShowBanner(false);
    }
  };

  if (!showBanner || isInstalled) return null;

  return (
    <>
      <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-card border-2 border-border rounded-2xl shadow-brutal-lg p-3.5 sm:p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3">
          <img
            src="/pwa-192x192.png"
            alt="Duit Gua Icon"
            className="w-11 h-11 rounded-xl border-2 border-border shadow-brutal-xs shrink-0 object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-extrabold text-xs sm:text-sm text-foreground truncate font-heading">
                Pasang Duit Gua
              </h4>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-5 h-5 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center"
                aria-label="Tutup"
              >
                <Icon name="x" className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
              Instal di layar utama HP untuk akses cepat tanpa buka browser, lebih mulus & hemat kuota.
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-extrabold text-xs border-2 border-border shadow-brutal-xs hover:bg-primary/90 active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5"
              >
                <Icon name="download" className="w-3.5 h-3.5" />
                <span>Instal Aplikasi</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Installation Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-card border-2 border-border rounded-2xl shadow-brutal-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <div className="flex items-center gap-2">
                <img src="/pwa-192x192.png" alt="Logo" className="w-6 h-6 rounded-md border border-border" />
                <h3 className="font-extrabold text-sm font-heading">Pasang di iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="w-7 h-7 rounded-lg border-2 border-border flex items-center justify-center hover:bg-muted text-muted-foreground"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-foreground">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary border border-border font-extrabold text-[11px] flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  Buka website ini di browser <strong>Safari</strong> iPhone Anda.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary border border-border font-extrabold text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  Ketuk tombol <strong>Bagikan / Share</strong> (ikon kotak dengan panah atas di bilah bawah).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary border border-border font-extrabold text-[11px] flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  Gulir ke bawah lalu pilih menu <strong>Tambahkan ke Layar Utama</strong> (<em>Add to Home Screen</em>).
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => {
                setShowIosGuide(false);
                setShowBanner(false);
              }}
              className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs border-2 border-border shadow-brutal-xs"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
