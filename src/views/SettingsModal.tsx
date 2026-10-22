import React, { useRef } from 'react';
import { AppState } from '../types';
import { Icon } from '../components/Icon';
import { exportDataAsJSON, importDataFromJSON, clearAllData } from '../utils/storage';
import {
  getDefaultTransactions,
  getDefaultBudgets,
  getDefaultPlans,
  getDefaultDailyExpenses,
  getDefaultJajanItems,
  DEFAULT_WALLETS,
  DEFAULT_CATEGORIES,
} from '../data/defaultData';
import { getCurrentMonthString } from '../utils/currency';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  onToggleTheme: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
  onToggleTheme,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleResetToDemo = () => {
    if (window.confirm('Muat kembali data sampel demo? Transaksi saat ini akan diganti.')) {
      const currentMonth = getCurrentMonthString();
      const demoState: AppState = {
        wallets: DEFAULT_WALLETS,
        categories: DEFAULT_CATEGORIES,
        transactions: getDefaultTransactions(),
        budgets: getDefaultBudgets(),
        plans: getDefaultPlans(currentMonth),
        dailyExpenses: getDefaultDailyExpenses(currentMonth),
        jajanItems: getDefaultJajanItems(currentMonth),
        selectedMonth: currentMonth,
        theme: state.theme,
      };
      onUpdateState(demoState);
      onShowToast('Data sampel demo berhasil dimuat.', 'info');
      onClose();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Yakin ingin mengosongkan semua transaksi dan data dompet? Tindakan ini tidak dapat dibatalkan.')) {
      const cleared = clearAllData();
      onUpdateState({ ...cleared, theme: state.theme });
      onShowToast('Semua data berhasil dibersihkan.', 'info');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-5 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Icon name="settings" className="w-4 h-4" />
            </div>
            <DialogTitle>Pengaturan & Cadangan Data</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-1">
          {/* Tampilan Tema */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-foreground">
              Tampilan Aplikasi
            </span>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border">
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
                className="text-xs font-semibold"
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
                className="p-3.5 rounded-xl bg-muted/40 border hover:border-primary text-left flex flex-col gap-1.5 transition-all active:scale-[0.98]"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
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
                className="p-3.5 rounded-xl bg-muted/40 border hover:border-primary text-left flex flex-col gap-1.5 transition-all active:scale-[0.98]"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
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
          <div className="flex flex-col gap-2 pt-2 border-t">
            <span className="text-xs font-bold text-foreground">
              Pengelolaan Data
            </span>
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResetToDemo}
                className="w-full gap-1.5"
              >
                <Icon name="refresh" className="w-4 h-4" />
                <span>Muat Ulang Data Sampel Demo</span>
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
                className="w-full gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
              >
                <Icon name="trash" className="w-4 h-4" />
                <span>Kosongkan Semua Transaksi</span>
              </Button>
            </div>
          </div>

          {/* Info App */}
          <div className="pt-1 text-center text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Duit Gua • v0.1.0 (shadcn/ui)</p>
            <p>Aplikasi Pengelola Keuangan Pribadi Mobile First</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
