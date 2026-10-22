import React, { useState, useEffect } from 'react';
import { DailyExpenseItem, Wallet } from '../types';
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

interface DailyExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<DailyExpenseItem, 'id' | 'createdAt' | 'total'>,
    existingId?: string
  ) => void;
  wallets: Wallet[];
  editItem?: DailyExpenseItem | null;
  defaultMonth: string;
}

export const DailyExpenseModal: React.FC<DailyExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  wallets,
  editItem,
  defaultMonth,
}) => {
  const [date, setDate] = useState<string>(getTodayString());
  const [title, setTitle] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [rawPrice, setRawPrice] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    if (editItem) {
      setDate(editItem.date);
      setTitle(editItem.title);
      setQuantity(editItem.quantity || 1);
      setRawPrice(editItem.price.toString());
      setWalletId(editItem.walletId || wallets[0]?.id || '');
    } else {
      setDate(getTodayString());
      setTitle('');
      setQuantity(1);
      setRawPrice('');
      setWalletId(wallets[0]?.id || '');
    }
    setError('');
  }, [isOpen, editItem, wallets]);

  const priceNum = parseNumberInput(rawPrice);
  const totalAmount = quantity * priceNum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Keterangan pengeluaran sehari-hari wajib diisi');
      return;
    }
    if (priceNum <= 0) {
      setError('Harga satuan harus lebih dari Rp 0');
      return;
    }
    if (quantity <= 0) {
      setError('Jumlah (Qty) minimal 1');
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
        quantity,
        price: priceNum,
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
              <Icon name="shopping-bag" className="w-4 h-4" />
            </div>
            <DialogTitle>
              {editItem ? 'Ubah Pengeluaran Sehari-Hari' : 'Catat Pengeluaran Sehari-Hari'}
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
              <label htmlFor="de-date" className="block text-xs font-bold text-foreground mb-1.5">
                Tanggal
              </label>
              <Input
                id="de-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="de-wallet" className="block text-xs font-bold text-foreground mb-1.5">
                Dompet / Sumber
              </label>
              <select
                id="de-wallet"
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border bg-background text-foreground text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label htmlFor="de-title" className="block text-xs font-bold text-foreground mb-1.5">
              Keterangan Pengeluaran
            </label>
            <Input
              id="de-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Makan Bu Dede, Bensin Pertalite, Galon"
              autoFocus
            />
          </div>

          {/* Jumlah (Qty) & Harga Satuan */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="de-qty" className="block text-xs font-bold text-foreground mb-1.5">
                Jumlah (Qty)
              </label>
              <Input
                id="de-qty"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="text-center font-bold"
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="de-price" className="block text-xs font-bold text-foreground mb-1.5">
                Harga Satuan
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="de-price"
                  type="text"
                  inputMode="numeric"
                  value={priceNum > 0 ? formatRupiah(priceNum, false) : ''}
                  onChange={(e) => {
                    const num = parseNumberInput(e.target.value);
                    setRawPrice(num === 0 ? '' : num.toString());
                  }}
                  placeholder="0"
                  className="pl-9 font-semibold tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Total Kalkulasi Box */}
          <div className="p-3.5 rounded-xl bg-muted/40 border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">
                Total Biaya ({quantity} x {formatRupiah(priceNum)})
              </p>
              <p className="text-base font-extrabold text-foreground tabular-nums">
                {formatRupiah(totalAmount)}
              </p>
            </div>
            <div className="text-[10px] text-muted-foreground bg-background px-2.5 py-1 rounded-md border font-medium">
              Otomatis kurangi saldo
            </div>
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
              {editItem ? 'Simpan' : 'Catat Pengeluaran'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
