import React, { useState, useEffect } from 'react';
import { Category, Transaction, Wallet } from '../types';
import { Icon } from './Icon';
import { formatRupiah, getTodayString, parseNumberInput } from '../utils/currency';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  categories: Category[];
  wallets: Wallet[];
  editTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  wallets,
  editTransaction,
}) => {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [rawAmount, setRawAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayString());
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    if (editTransaction) {
      setType(editTransaction.type === 'income' ? 'income' : 'expense');
      setRawAmount(editTransaction.amount.toString());
      setCategoryId(editTransaction.categoryId || '');
      setWalletId(editTransaction.walletId);
      setDate(editTransaction.date);
      setNote(editTransaction.note || '');
    } else {
      setType('expense');
      setRawAmount('');
      const defaultCat = categories.find((c) => c.type === 'expense');
      setCategoryId(defaultCat ? defaultCat.id : '');
      setWalletId(wallets[0]?.id || '');
      setDate(getTodayString());
      setNote('');
    }
    setError('');
  }, [isOpen, editTransaction, categories, wallets]);

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    const firstMatchingCat = categories.find((c) => c.type === newType);
    setCategoryId(firstMatchingCat ? firstMatchingCat.id : '');
  };

  const handleQuickAdd = (addValue: number) => {
    const current = parseNumberInput(rawAmount);
    setRawAmount((current + addValue).toString());
    setError('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseNumberInput(e.target.value);
    setRawAmount(num === 0 ? '' : num.toString());
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumberInput(rawAmount);

    if (amount <= 0) {
      setError('Nominal harus lebih dari Rp 0');
      return;
    }

    if (!walletId) {
      setError('Silakan pilih dompet / rekening pembayaran');
      return;
    }

    if (!categoryId) {
      setError('Silakan pilih salah satu kategori');
      return;
    }

    onSave(
      {
        type,
        amount,
        categoryId,
        walletId,
        date,
        note: note.trim(),
      },
      editTransaction?.id
    );

    onClose();
  };

  const filteredCategories = categories.filter((c) => c.type === type);
  const numericAmount = parseNumberInput(rawAmount);
  const selectedWallet = wallets.find((w) => w.id === walletId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editTransaction ? 'Ubah Catatan Transaksi' : 'Catat Transaksi Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {/* Type Toggle: Pengeluaran vs Pemasukan */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="trending-down" className="w-4 h-4" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="trending-up" className="w-4 h-4" />
              <span>Pemasukan</span>
            </button>
          </div>

          {/* Amount Display and Input */}
          <div className="bg-muted/40 p-4 rounded-xl border flex flex-col items-center">
            <label htmlFor="amount-input" className="text-xs font-medium text-muted-foreground mb-1">
              Nominal {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
            </label>
            <div className="w-full flex items-center justify-center">
              <input
                id="amount-input"
                type="text"
                inputMode="numeric"
                value={numericAmount > 0 ? formatRupiah(numericAmount, false) : ''}
                onChange={handleAmountChange}
                placeholder="0"
                autoFocus
                className={`w-full text-center text-2xl sm:text-3xl font-extrabold bg-transparent border-none outline-none tabular-nums placeholder:text-muted-foreground/40 ${
                  type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              />
            </div>
            <span className="text-xs text-muted-foreground mt-1 font-medium">Rupiah (IDR)</span>

            {/* Quick buttons */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-3 pt-3 border-t w-full">
              {[10000, 25000, 50000, 100000, 500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-background border hover:bg-accent text-foreground transition-all active:scale-95"
                >
                  +{val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive flex items-center gap-2">
              <Icon name="x" className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Kategori Selector */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Pilih Kategori
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-2.5 rounded-lg border text-left flex flex-col items-center justify-center gap-1.5 transition-all text-xs ${
                      isSelected
                        ? 'bg-foreground text-background border-foreground font-bold shadow-sm'
                        : 'bg-card border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${cat.color}20`,
                        color: isSelected ? 'inherit' : cat.color,
                      }}
                    >
                      <Icon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="truncate w-full text-center text-[11px]">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dompet / Rekening Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="wallet-select" className="text-xs font-bold text-foreground">
                Dompet / Rekening
              </label>
              {selectedWallet && (
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  Saldo: {formatRupiah(selectedWallet.balance)}
                </span>
              )}
            </div>
            <select
              id="wallet-select"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full p-2.5 rounded-lg border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (Sisa: {formatRupiah(w.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal & Shortcut */}
          <div>
            <label htmlFor="tx-date" className="block text-xs font-bold text-foreground mb-1.5">
              Tanggal Transaksi
            </label>
            <div className="flex gap-2">
              <Input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant={date === getTodayString() ? "default" : "outline"}
                size="sm"
                onClick={() => setDate(getTodayString())}
                className="rounded-lg px-3"
              >
                Hari Ini
              </Button>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label htmlFor="tx-note" className="block text-xs font-bold text-foreground mb-1.5">
              Catatan (Opsional)
            </label>
            <Input
              id="tx-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Makan siang bareng tim, Bensin, Gaji"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-lg"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-[2] rounded-lg bg-primary text-primary-foreground font-semibold"
            >
              {editTransaction ? 'Simpan Perubahan' : 'Catat Transaksi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
