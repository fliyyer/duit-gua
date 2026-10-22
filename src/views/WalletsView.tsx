import React from 'react';
import { AppState, Wallet } from '../types';
import { formatRupiah } from '../utils/currency';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface WalletsViewProps {
  state: AppState;
  onOpenAddWallet: () => void;
  onOpenTransfer: () => void;
  onEditWallet: (wallet: Wallet) => void;
  onDeleteWallet: (id: string) => void;
}

export const WalletsView: React.FC<WalletsViewProps> = ({
  state,
  onOpenAddWallet,
  onOpenTransfer,
  onEditWallet,
  onDeleteWallet,
}) => {
  const totalBalance = state.wallets.reduce((sum, w) => sum + w.balance, 0);

  const getWalletTypeLabel = (type: string) => {
    switch (type) {
      case 'cash':
        return 'Uang Tunai';
      case 'bank':
        return 'Rekening Bank';
      case 'ewallet':
        return 'E-Wallet';
      case 'investment':
        return 'Investasi';
      default:
        return 'Akun Keuangan';
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-28">
      {/* Total Saldo Card */}
      <Card className="p-5 sm:p-6 rounded-xl border bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Total Kekayaan Bersih (Net Worth)
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-muted font-medium text-foreground">
            {state.wallets.length} Dompet
          </span>
        </div>

        <p className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight mb-4 text-foreground break-words">
          {formatRupiah(totalBalance)}
        </p>

        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t">
          <Button
            variant="outline"
            onClick={onOpenTransfer}
            className="h-9 rounded-lg text-xs font-semibold gap-1.5 hover:bg-accent"
          >
            <Icon name="arrow-left-right" className="w-4 h-4 text-primary" />
            <span>Pindah Saldo</span>
          </Button>
          <Button
            onClick={onOpenAddWallet}
            className="h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Icon name="plus" className="w-4 h-4" />
            <span>Tambah Dompet</span>
          </Button>
        </div>
      </Card>

      {/* List of Wallets */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs px-1 text-muted-foreground font-medium">
          <span>Daftar Dompet & Rekening ({state.wallets.length} akun)</span>
          <span>Saldo Tersedia</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.wallets.map((wallet) => {
            const walletTxs = state.transactions.filter(
              (t) => t.walletId === wallet.id || t.toWalletId === wallet.id
            );

            return (
            <Card key={wallet.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
                    style={{ backgroundColor: wallet.color || '#059669' }}
                  >
                    <Icon name="wallet" className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-foreground truncate">
                      {wallet.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {getWalletTypeLabel(wallet.type)}
                      {wallet.accountNumber ? ` • ${wallet.accountNumber}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    {formatRupiah(wallet.balance)}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {walletTxs.length} Transaksi
                  </p>
                </div>
              </div>

              {/* Wallet Row Footer Actions */}
              <div className="pt-2 border-t flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground">
                  Aksen: <span className="font-mono text-[10px]">{wallet.color}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditWallet(wallet)}
                    className="h-8 px-2.5 rounded-lg text-xs gap-1 font-medium"
                  >
                    <Icon name="edit" className="w-3.5 h-3.5" />
                    <span>Ubah</span>
                  </Button>
                  {state.wallets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteWallet(wallet.id)}
                      className="h-8 px-2.5 rounded-lg text-xs gap-1 font-medium text-destructive hover:bg-destructive/10"
                    >
                      <Icon name="trash" className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        </div>
      </div>
    </div>
  );
};
