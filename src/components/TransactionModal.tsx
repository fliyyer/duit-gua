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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { DatePicker } from './ui/date-picker';

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
      <DialogContent className="p-4 sm:p-5 sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-base font-bold">
            {editTransaction ? 'Ubah Catatan Transaksi' : 'Catat Transaksi Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-0.5">
          {/* Type Toggle: Pengeluaran vs Pemasukan */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="trending-down" className="w-3.5 h-3.5" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="trending-up" className="w-3.5 h-3.5" />
              <span>Pemasukan</span>
            </button>
          </div>

          {/* Compact Amount Input Box */}
          <div className="bg-muted/40 p-3 rounded-xl border flex flex-col items-center gap-1.5">
            <div className="w-full flex items-center justify-center gap-1.5">
              <span className="text-sm font-bold text-muted-foreground">Rp</span>
              <input
                id="amount-input"
                type="text"
                inputMode="numeric"
                value={numericAmount > 0 ? formatRupiah(numericAmount, false) : ''}
                onChange={handleAmountChange}
                placeholder="0"
                autoFocus
                className={`w-full max-w-[240px] text-center text-2xl sm:text-3xl font-extrabold bg-transparent border-none outline-none tabular-nums placeholder:text-muted-foreground/40 ${
                  type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              />
            </div>

            {/* Quick addition chips */}
            <div className="flex flex-wrap justify-center gap-1 pt-1.5 border-t border-border/50 w-full">
              {[10000, 25000, 50000, 100000, 500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-background border hover:bg-accent text-foreground transition-all active:scale-95"
                >
                  +{val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive flex items-center gap-2">
              <Icon name="x" className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Kategori Selector as Compact Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-foreground">
                Kategori
              </label>
              {categoryId && (
                <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[160px]">
                  {filteredCategories.find((c) => c.id === categoryId)?.name}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-0.5">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 text-xs transition-all ${
                      isSelected
                        ? 'bg-foreground text-background border-foreground font-bold shadow-sm'
                        : 'bg-card border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                      style={{
                        color: isSelected ? 'inherit' : cat.color,
                      }}
                    >
                      <Icon name={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] whitespace-nowrap">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dompet & Tanggal (Side-by-Side 2 Columns) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Dompet Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="wallet-select" className="text-xs font-bold text-foreground">
                  Dompet
                </label>
                {selectedWallet && (
                  <span className="text-[10px] text-muted-foreground tabular-nums truncate">
                    {formatRupiah(selectedWallet.balance)}
                  </span>
                )}
              </div>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger id="wallet-select" className="h-9 text-xs px-2.5">
                  <SelectValue placeholder="Pilih dompet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id} className="text-xs">
                      {w.name} ({formatRupiah(w.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tanggal Transaksi */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="tx-date" className="text-xs font-bold text-foreground">
                  Tanggal
                </label>
                {date !== getTodayString() && (
                  <button
                    type="button"
                    onClick={() => setDate(getTodayString())}
                    className="text-[10px] text-primary hover:underline font-semibold"
                  >
                    Hari Ini
                  </button>
                )}
              </div>
              <DatePicker
                id="tx-date"
                value={date}
                onChange={setDate}
                className="h-9 text-xs px-2.5"
              />
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label htmlFor="tx-note" className="block text-xs font-bold text-foreground mb-1">
              Catatan (Opsional)
            </label>
            <Input
              id="tx-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Makan siang, Bensin, Gaji"
              className="h-9 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-1 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-9 rounded-lg text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-[2] h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm"
            >
              {editTransaction ? 'Simpan Perubahan' : 'Catat Transaksi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
