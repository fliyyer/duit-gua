import React, { useState, useEffect } from 'react';
import { Wallet, WalletType } from '../types';
import { Icon } from './Icon';
import { formatRupiah, parseNumberInput } from '../utils/currency';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wallet: Omit<Wallet, 'id'>, existingId?: string) => void;
  editWallet?: Wallet | null;
}

const WALLET_COLORS = [
  '#059669', // Emerald
  '#1d4ed8', // Blue
  '#0284c7', // Sky
  '#7c3aed', // Purple
  '#d97706', // Amber
  '#dc2626', // Red
  '#475569', // Slate
];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editWallet,
}) => {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<WalletType>('bank');
  const [rawBalance, setRawBalance] = useState<string>('');
  const [color, setColor] = useState<string>(WALLET_COLORS[0]);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    if (editWallet) {
      setName(editWallet.name);
      setType(editWallet.type);
      setRawBalance(editWallet.balance.toString());
      setColor(editWallet.color || WALLET_COLORS[0]);
      setAccountNumber(editWallet.accountNumber || '');
    } else {
      setName('');
      setType('bank');
      setRawBalance('');
      setColor(WALLET_COLORS[0]);
      setAccountNumber('');
    }
    setError('');
  }, [isOpen, editWallet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama dompet / rekening wajib diisi');
      return;
    }

    const balance = parseNumberInput(rawBalance);

    onSave(
      {
        name: name.trim(),
        type,
        balance,
        color,
        accountNumber: accountNumber.trim() || undefined,
      },
      editWallet?.id
    );

    onClose();
  };

  const numericBalance = parseNumberInput(rawBalance);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-5 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Icon name="wallet" className="w-4 h-4" />
            </div>
            <DialogTitle>
              {editWallet ? 'Ubah Informasi Dompet' : 'Tambah Dompet / Akun Baru'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          {/* Nama Dompet */}
          <div>
            <label htmlFor="wallet-name" className="block text-xs font-bold text-foreground mb-1.5">
              Nama Dompet / Rekening
            </label>
            <Input
              id="wallet-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA Tabungan, GoPay, Tunai Dompet"
              autoFocus
            />
          </div>

          {/* Tipe Dompet */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Jenis Akun
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'bank', label: 'Rekening Bank' },
                { id: 'ewallet', label: 'E-Wallet' },
                { id: 'cash', label: 'Uang Tunai' },
                { id: 'investment', label: 'Investasi' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id as WalletType)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    type === item.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-foreground hover:bg-accent'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Saldo Saat Ini / Saldo Awal */}
          <div>
            <label htmlFor="wallet-balance" className="block text-xs font-bold text-foreground mb-1.5">
              {editWallet ? 'Saldo Saat Ini' : 'Saldo Awal'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                Rp
              </span>
              <Input
                id="wallet-balance"
                type="text"
                inputMode="numeric"
                value={numericBalance > 0 ? formatRupiah(numericBalance, false) : ''}
                onChange={(e) => {
                  const num = parseNumberInput(e.target.value);
                  setRawBalance(num === 0 ? '' : num.toString());
                }}
                placeholder="0"
                className="pl-11 font-semibold tabular-nums"
              />
            </div>
          </div>

          {/* Nomor Rekening / Akun (Opsional) */}
          <div>
            <label htmlFor="acc-number" className="block text-xs font-bold text-foreground mb-1.5">
              Nomor Rekening / Akun (Opsional)
            </label>
            <Input
              id="acc-number"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Contoh: 123-456-7890"
            />
          </div>

          {/* Pilihan Warna */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Warna Aksen Kartu
            </label>
            <div className="flex gap-2">
              {WALLET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-md transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-offset-2 ring-primary' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Pilih warna ${c}`}
                />
              ))}
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
              {editWallet ? 'Simpan' : 'Buat Dompet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
