import React, { useRef, useState } from 'react';
import { AppState } from '../types';
import { Icon } from '../components/Icon';
import { exportDataAsJSON, importDataFromJSON, clearAllData } from '../utils/storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { ConfirmDialog } from '../components/ConfirmDialog';

import { useAuth } from '../context/AuthContext';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  onToggleTheme: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
  onManualSync?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
  onToggleTheme,
  onShowToast,
  syncStatus = 'idle',
  onManualSync,
}) => {
  const { user, logout } = useAuth();
  const { isInstalled, installApp } = usePwaInstall();
  const [showIosTip, setShowIosTip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInstallApp = async () => {
    const res = await installApp();
    if (res === 'ios') {
      setShowIosTip((prev) => !prev);
    } else if (res === 'accepted') {
      onShowToast('Aplikasi berhasil dipasang di layar utama!', 'success');
    }
  };
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'default' | 'warning';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const handleExport = () => {
    try {
      exportDataAsJSON(state);
      onShowToast('File cadangan data Duit Gua berhasil diunduh.', 'success');
    } catch {
      onShowToast('Gagal mengunduh file cadangan.', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const imported = importDataFromJSON(content);
      if (imported) {
        onUpdateState(imported);
        onShowToast('Data berhasil dipulihkan dari file backup.', 'success');
        onClose();
      } else {
        onShowToast('Format file JSON tidak sesuai atau rusak.', 'error');
      }
    };
    reader.onerror = () => {
      onShowToast('Gagal membaca file backup.', 'error');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Kosongkan Semua Data',
      description: 'Yakin ingin mengosongkan semua transaksi dan data dompet? Tindakan ini permanen dan tidak dapat dibatalkan.',
      confirmText: 'Ya, Kosongkan',
      cancelText: 'Batal',
      variant: 'destructive',
      onConfirm: () => {
        const cleared = clearAllData();
        onUpdateState({ ...cleared, theme: state.theme });
        onShowToast('Semua data berhasil dibersihkan.', 'info');
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-4 sm:p-5 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 text-primary border-2 border-border shadow-brutal-xs flex items-center justify-center">
              <Icon name="settings" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <DialogTitle>Pengaturan & Cadangan Data</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 sm:gap-5 pt-1">
          {/* Akun Pengguna */}
          {user && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-foreground">
                Akun Terhubung
              </span>
              <div className="p-3.5 rounded-xl bg-card border-2 border-border shadow-brutal-xs space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-border flex items-center justify-center text-xs font-extrabold uppercase shrink-0">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-foreground truncate">
                        {user.displayName || 'Pengguna'}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {user.isGuest ? 'Mode Tamu (Lokal)' : user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      logout();
                      onShowToast('Berhasil keluar dari akun.', 'info');
                    }}
                    className="text-xs font-bold text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    Keluar
                  </Button>
                </div>

                {!user.isGuest && onManualSync && (
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className={`w-2 h-2 rounded-full ${
                        syncStatus === 'syncing' ? 'bg-amber-500 animate-ping' : syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-muted-foreground'
                      }`} />
                      <span>{syncStatus === 'syncing' ? 'Menyimpan...' : syncStatus === 'synced' ? 'Cloud Terkoneksi' : 'Firebase Ready'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={onManualSync}
                      disabled={syncStatus === 'syncing'}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg border-2 border-border bg-card hover:bg-accent flex items-center gap-1.5 shadow-brutal-xs disabled:opacity-50"
                    >
                      <Icon name="refresh" className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      <span>Cadangkan Sekarang</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Aplikasi Layar Utama (PWA) */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-foreground">
              Aplikasi Layar Utama (PWA)
            </span>
            <div className="p-3.5 rounded-xl bg-card border-2 border-border shadow-brutal-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src="/pwa-192x192.png"
                  alt="Duit Gua"
                  className="w-8 h-8 rounded-lg border-2 border-border shrink-0 object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-foreground truncate">
                    {isInstalled ? 'Aplikasi Terpasang' : 'Pasang di Layar HP'}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {isInstalled ? 'Berjalan sebagai aplikasi mandiri' : 'Akses cepat tanpa browser'}
                  </p>
                </div>
              </div>
              {!isInstalled ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleInstallApp}
                  className="text-xs font-extrabold shadow-brutal-xs shrink-0"
                >
                  <Icon name="download" className="w-3.5 h-3.5 mr-1" />
                  <span>Pasang</span>
                </Button>
              ) : (
                <span className="px-2.5 py-1 text-[11px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500/30 rounded-lg shrink-0">
                  Terpasang ✓
                </span>
              )}
            </div>
            {showIosTip && (
              <div className="p-3 bg-muted border-2 border-border rounded-xl text-xs space-y-1.5 text-foreground animate-in fade-in">
                <p className="font-extrabold text-xs">Cara instal di iPhone (Safari):</p>
                <p className="text-[11px] text-muted-foreground">1. Ketuk tombol <strong>Bagikan / Share</strong> (ikon kotak dengan panah atas di bilah bawah Safari).</p>
                <p className="text-[11px] text-muted-foreground">2. Pilih <strong>Tambahkan ke Layar Utama</strong> (<em>Add to Home Screen</em>).</p>
              </div>
            )}
          </div>

          {/* Tampilan Tema */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-foreground">
              Tampilan Aplikasi
            </span>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border-2 border-border shadow-brutal-xs">
              <div className="flex items-center gap-2.5">
                <Icon name={state.theme === 'dark' ? 'moon' : 'sun'} className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Mode {state.theme === 'dark' ? 'Gelap' : 'Terang'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Beralih antara nuansa terang dan gelap
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleTheme}
                className="text-xs font-bold shadow-brutal-xs"
              >
                Ganti Tema
              </Button>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-foreground">
              Cadangan & Pulihkan (Offline-First)
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Seluruh catatan Anda disimpan langsung di browser perangkat Anda. Gunakan tombol di bawah untuk mengekspor atau memulihkan data keuangan Anda sewaktu-waktu.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleExport}
                className="p-3.5 rounded-xl bg-card border-2 border-border shadow-brutal-xs hover:border-primary text-left flex flex-col gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px]"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary border-2 border-border shadow-brutal-xs flex items-center justify-center">
                  <Icon name="download" className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-foreground">
                  Unduh Backup JSON
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Simpan file ke HP / Laptop
                </span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-xl bg-card border-2 border-border shadow-brutal-xs hover:border-primary text-left flex flex-col gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px]"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border-2 border-border shadow-brutal-xs flex items-center justify-center">
                  <Icon name="upload" className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-foreground">
                  Pulihkan File JSON
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Muat dari file cadangan
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Reset & Manajemen Data */}
          <div className="flex flex-col gap-2 pt-2 border-t-2 border-border">
            <span className="text-xs font-bold text-foreground">
              Pengelolaan Data
            </span>
            <div className="flex flex-col gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
                className="w-full gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 border-2 border-destructive/30 shadow-brutal-xs font-bold"
              >
                <Icon name="trash" className="w-4 h-4" />
                <span>Kosongkan Semua Transaksi</span>
              </Button>
            </div>
          </div>

          {/* Info App */}
          <div className="pt-1 text-center text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Duit Gua • v1.0.0</p>
            <p>Aplikasi Pengelola Keuangan Pribadi Mobile First</p>
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
      />
    </Dialog>
  );
};
