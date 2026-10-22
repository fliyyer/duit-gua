import React, { useState, useEffect } from 'react';
import { Wallet } from '../types';
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

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (data: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    date: string;
    note: string;
  }) => void;
  wallets: Wallet[];
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onTransfer,
  wallets,
}) => {
  const [fromWalletId, setFromWalletId] = useState<string>('');
  const [toWalletId, setToWalletId] = useState<string>('');
  const [rawAmount, setRawAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayString());
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    if (wallets.length >= 2) {
      setFromWalletId(wallets[0].id);
      setToWalletId(wallets[1].id);
    } else if (wallets.length === 1) {
      setFromWalletId(wallets[0].id);
      setToWalletId('');
    }
    setRawAmount('');
    setDate(getTodayString());
    setNote('');
    setError('');
  }, [isOpen, wallets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumberInput(rawAmount);

    if (amount <= 0) {
      setError('Nominal transfer harus lebih dari Rp 0');
      return;
    }

    if (!fromWalletId || !toWalletId) {
      setError('Silakan pilih dompet sumber dan dompet tujuan');
      return;
    }

    if (fromWalletId === toWalletId) {
      setError('Dompet sumber dan dompet tujuan tidak boleh sama');
      return;
    }

    const sourceWallet = wallets.find((w) => w.id === fromWalletId);
    if (sourceWallet && sourceWallet.balance < amount) {
      setError(`Saldo ${sourceWallet.name} tidak cukup (${formatRupiah(sourceWallet.balance)})`);
      return;
    }

    onTransfer({
      fromWalletId,
      toWalletId,
      amount,
      date,
      note: note.trim() || 'Transfer antar dompet',
    });

    onClose();
  };

  const numericAmount = parseNumberInput(rawAmount);
  const sourceWallet = wallets.find((w) => w.id === fromWalletId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-5 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Icon name="arrow-left-right" className="w-4 h-4" />
            </div>
            <DialogTitle>Pindah Saldo / Transfer</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {/* Nominal Transfer */}
          <div className="bg-muted/40 p-4 rounded-xl border flex flex-col items-center">
            <label htmlFor="transfer-amount" className="text-xs font-medium text-muted-foreground mb-1">
              Nominal yang Ditransfer
            </label>
            <input
              id="transfer-amount"
              type="text"
              inputMode="numeric"
              value={numericAmount > 0 ? formatRupiah(numericAmount, false) : ''}
              onChange={(e) => {
                const num = parseNumberInput(e.target.value);
                setRawAmount(num === 0 ? '' : num.toString());
                setError('');
              }}
              placeholder="0"
              autoFocus
              className="w-full text-center text-2xl sm:text-3xl font-extrabold text-foreground bg-transparent border-none outline-none tabular-nums placeholder:text-muted-foreground/40"
            />
            <span className="text-xs text-muted-foreground mt-1">Rupiah (IDR)</span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive flex items-center gap-2">
              <Icon name="x" className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dompet Asal */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="source-wallet" className="text-xs font-bold text-foreground">
                Dari Dompet (Sumber)
              </label>
              {sourceWallet && (
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  Saldo: {formatRupiah(sourceWallet.balance)}
                </span>
              )}
            </div>
            <Select value={fromWalletId} onValueChange={setFromWalletId}>
              <SelectTrigger id="source-wallet">
                <SelectValue placeholder="Pilih dompet asal" />
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

          {/* Dompet Tujuan */}
          <div>
            <label htmlFor="dest-wallet" className="block text-xs font-bold text-foreground mb-1.5">
              Ke Dompet (Tujuan)
            </label>
            <Select value={toWalletId} onValueChange={setToWalletId}>
              <SelectTrigger id="dest-wallet">
                <SelectValue placeholder="Pilih dompet tujuan" />
              </SelectTrigger>
              <SelectContent>
                {wallets
                  .filter((w) => w.id !== fromWalletId)
                  .map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} ({formatRupiah(w.balance)})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tanggal */}
          <div>
            <label htmlFor="transfer-date" className="block text-xs font-bold text-foreground mb-1.5">
              Tanggal
            </label>
            <DatePicker
              id="transfer-date"
              value={date}
              onChange={setDate}
            />
          </div>

          {/* Catatan */}
          <div>
            <label htmlFor="transfer-note" className="block text-xs font-bold text-foreground mb-1.5">
              Keterangan
            </label>
            <Input
              id="transfer-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Tarik tunai ATM, Top up e-wallet"
            />
          </div>

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
              Kirim Saldo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
