import React, { useState, useEffect } from 'react';
import { JajanItem, Wallet } from '../types';
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

interface JajanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<JajanItem, 'id' | 'createdAt'>,
    existingId?: string
  ) => void;
  wallets: Wallet[];
  editItem?: JajanItem | null;
  defaultMonth: string;
}

const QUICK_JAJAN_NAMES = [
  'Kopi Kenangan',
  'Gorengan Sore',
  'Ayam Geprek',
  'Richeese Factory',
  'Billiard',
  'Nongkrong Cafe',
  'Sushi Box',
  'Top Up Games',
];

export const JajanModal: React.FC<JajanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  wallets,
  editItem,
  defaultMonth,
}) => {
  const [date, setDate] = useState<string>(getTodayString());
  const [title, setTitle] = useState<string>('');
  const [rawAmount, setRawAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    if (editItem) {
      setDate(editItem.date);
      setTitle(editItem.title);
      setRawAmount(editItem.amount.toString());
      setNote(editItem.note || '');
      setWalletId(editItem.walletId || wallets[0]?.id || '');
    } else {
      setDate(getTodayString());
      setTitle('');
      setRawAmount('');
      setNote('');
      setWalletId(wallets[0]?.id || '');
    }
    setError('');
  }, [isOpen, editItem, wallets]);

  const amountNum = parseNumberInput(rawAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Nama jajanan atau tempat nongkrong wajib diisi');
      return;
    }
    if (amountNum <= 0) {
      setError('Nominal uang yang dihabiskan harus lebih dari Rp 0');
      return;
    }
    if (!walletId) {
      setError('Pilih dompet sumber dana');
      return;
    }

    const monthStr = date.substring(0, 7) || defaultMonth;

    onSave(
      {
        month: monthStr,
        date,
        title: title.trim(),
        amount: amountNum,
        note: note.trim() || undefined,
        walletId,
      },
      editItem?.id
    );

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-5 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Icon name="coffee" className="w-4 h-4" />
            </div>
            <DialogTitle>
              {editItem ? 'Ubah Jajan & Nongkrong' : 'Catat Jajan & Nongkrong'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          {/* Tanggal & Dompet */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="jj-date" className="block text-xs font-bold text-foreground mb-1.5">
                Tanggal
              </label>
              <DatePicker
                id="jj-date"
                value={date}
                onChange={setDate}
              />
            </div>
            <div>
              <label htmlFor="jj-wallet" className="block text-xs font-bold text-foreground mb-1.5">
                Dompet / Sumber
              </label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger id="jj-wallet">
                  <SelectValue placeholder="Pilih dompet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} ({formatRupiah(w.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jajanan / Tempat Nongkrong */}
          <div>
            <label htmlFor="jj-title" className="block text-xs font-bold text-foreground mb-1.5">
              Jajanan / Tempat Nongkrong
            </label>
            <Input
              id="jj-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Sushi Tei, Kopi Kenangan, Richeese"
              autoFocus
            />

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_JAJAN_NAMES.slice(0, 4).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setTitle(name)}
                  className="px-2 py-1 text-[11px] font-medium rounded-md border bg-muted/30 hover:bg-accent text-foreground transition-all"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Nominal Uang yang Dihabiskan */}
          <div>
            <label htmlFor="jj-amount" className="block text-xs font-bold text-foreground mb-1.5">
              Uang yang Dihabiskan
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                Rp
              </span>
              <Input
                id="jj-amount"
                type="text"
                inputMode="numeric"
                value={amountNum > 0 ? formatRupiah(amountNum, false) : ''}
                onChange={(e) => {
                  const num = parseNumberInput(e.target.value);
                  setRawAmount(num === 0 ? '' : num.toString());
                }}
                placeholder="0"
                className="pl-11 font-semibold tabular-nums text-base"
              />
            </div>

            {/* Quick amount chips */}
            <div className="flex gap-1.5 mt-2">
              {[15000, 30000, 50000, 100000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRawAmount(val.toString())}
                  className="flex-1 py-1 text-xs font-medium rounded-md border bg-background hover:bg-accent text-foreground transition-all"
                >
                  {val >= 1000000 ? `${val / 1000000} Jt` : `${val / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Keterangan / Catatan Tambahan */}
          <div>
            <label htmlFor="jj-note" className="block text-xs font-bold text-foreground mb-1.5">
              Keterangan / Catatan (Opsional)
            </label>
            <Input
              id="jj-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Nongkrong bareng teman, promo buy 1 get 1"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-[2] bg-primary text-primary-foreground font-bold"
            >
              {editItem ? 'Simpan' : 'Catat Jajan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
