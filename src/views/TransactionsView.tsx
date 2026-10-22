import React, { useState, useMemo } from 'react';
import { AppState, Transaction } from '../types';
import { formatDateIndo, formatRupiah, getCurrentMonthString } from '../utils/currency';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface TransactionsViewProps {
  state: AppState;
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  state,
  onOpenAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());

  const filteredTransactions = useMemo(() => {
    return state.transactions.filter((tx) => {
      if (selectedMonth !== 'all' && !tx.date.startsWith(selectedMonth)) {
        return false;
      }

      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }

      if (selectedWalletId !== 'all') {
        const matchSource = tx.walletId === selectedWalletId;
        const matchDest = tx.toWalletId === selectedWalletId;
        if (!matchSource && !matchDest) return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const noteMatch = tx.note?.toLowerCase().includes(query);
        const category = state.categories.find((c) => c.id === tx.categoryId);
        const catMatch = category?.name.toLowerCase().includes(query);
        const wallet = state.wallets.find((w) => w.id === tx.walletId);
        const walletMatch = wallet?.name.toLowerCase().includes(query);
        if (!noteMatch && !catMatch && !walletMatch) return false;
      }

      return true;
    });
  }, [state.transactions, state.categories, state.wallets, selectedMonth, selectedType, selectedWalletId, searchTerm]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });
  }, [filteredTransactions]);

  const summaryIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const summaryExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    sortedTransactions.forEach((tx) => {
      const currentList = map.get(tx.date) || [];
      currentList.push(tx);
      map.set(tx.date, currentList);
    });
    return Array.from(map.entries());
  }, [sortedTransactions]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedWalletId('all');
    setSelectedMonth('all');
  };

  return (
    <div className="flex flex-col gap-4 pb-28">
      {/* Search Bar & Add Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari transaksi atau catatan..."
            className="pl-10 pr-9 h-10 rounded-lg text-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          onClick={onOpenAddTransaction}
          className="h-10 px-3.5 rounded-lg text-xs font-semibold gap-1.5 flex-shrink-0"
        >
          <Icon name="plus" className="w-4 h-4" />
          <span>Catat</span>
        </Button>
      </div>

      {/* Filter Chips Card */}
      <Card className="p-3 flex flex-col gap-2">
        {/* Tipe Transaksi */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Semua Tipe' },
            { id: 'expense', label: 'Pengeluaran' },
            { id: 'income', label: 'Pemasukan' },
            { id: 'transfer', label: 'Transfer' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
                selectedType === type.id
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Dompet & Bulan Selector */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
            <SelectTrigger className="h-9 text-xs bg-muted/60 border-input/40">
              <SelectValue placeholder="Semua Dompet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Semua Dompet</SelectItem>
              {state.wallets.map((w) => (
                <SelectItem key={w.id} value={w.id} className="text-xs">
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="h-9 text-xs bg-muted/60 border-input/40">
              <SelectValue placeholder="Semua Waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Semua Waktu</SelectItem>
              <SelectItem value={getCurrentMonthString()} className="text-xs">Bulan Ini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Ringkasan Hasil Filter */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-muted-foreground font-medium">
          Ditemukan <strong className="text-foreground">{filteredTransactions.length}</strong> transaksi
        </span>
        <div className="flex items-center gap-3 font-semibold tabular-nums">
          {summaryIncome > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400">
              +{formatRupiah(summaryIncome)}
            </span>
          )}
          {summaryExpense > 0 && (
            <span className="text-rose-600 dark:text-rose-400">
              -{formatRupiah(summaryExpense)}
            </span>
          )}
        </div>
      </div>

      {/* Daftar Transaksi (Grouped By Date) */}
      {groupedByDate.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-lg bg-muted text-muted-foreground flex items-center justify-center mb-2">
            <Icon name="search" className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-foreground">
            Tidak Ada Transaksi Sesuai
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
            Coba ganti filter atau kata kunci pencarian Anda.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="mt-4 rounded-lg text-xs font-semibold"
          >
            Reset Semua Filter
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {groupedByDate.map(([date, txList]) => {
            const dayExpense = txList
              .filter((t) => t.type === 'expense')
              .reduce((s, t) => s + t.amount, 0);

            return (
              <Card key={date} className="p-4">
                {/* Date Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b text-xs">
                  <span className="font-bold text-foreground">
                    {formatDateIndo(date)}
                  </span>
                  {dayExpense > 0 && (
                    <span className="text-muted-foreground tabular-nums">
                      Keluar: {formatRupiah(dayExpense)}
                    </span>
                  )}
                </div>

                {/* List Items */}
                <div className="divide-y">
                  {txList.map((tx) => {
                    const category = state.categories.find((c) => c.id === tx.categoryId);
                    const wallet = state.wallets.find((w) => w.id === tx.walletId);
                    const isIncome = tx.type === 'income';
                    const isTransfer = tx.type === 'transfer';
                    const toWallet = tx.toWalletId
                      ? state.wallets.find((w) => w.id === tx.toWalletId)
                      : null;

                    return (
                      <div
                        key={tx.id}
                        className="py-2.5 flex items-center justify-between group hover:bg-muted/40 rounded-lg px-2 transition-colors gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: isTransfer
                                ? 'rgba(14, 165, 233, 0.15)'
                                : category
                                ? `${category.color}20`
                                : 'rgba(148, 163, 184, 0.2)',
                              color: isTransfer ? '#0284c7' : category ? category.color : 'inherit',
                            }}
                          >
                            <Icon
                              name={
                                isTransfer
                                  ? 'arrow-left-right'
                                  : category
                                  ? category.icon
                                  : isIncome
                                  ? 'trending-up'
                                  : 'trending-down'
                              }
                              className="w-4 h-4"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate">
                              {isTransfer
                                ? `Transfer: ${wallet?.name} -> ${toWallet?.name}`
                                : category?.name || 'Transaksi'}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {tx.note || wallet?.name || 'Tanpa catatan'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <p
                              className={`text-xs font-bold tabular-nums ${
                                isIncome
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : isTransfer
                                  ? 'text-sky-600 dark:text-sky-400'
                                  : 'text-foreground'
                              }`}
                            >
                              {isIncome ? '+' : isTransfer ? '' : '-'}
                              {formatRupiah(tx.amount)}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[90px] sm:max-w-none">
                              {wallet?.name || 'Dompet'}
                            </p>
                          </div>

                          <div className="flex items-center gap-0.5 opacity-90 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditTransaction(tx)}
                              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                              title="Ubah transaksi"
                            >
                              <Icon name="edit" className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteTransaction(tx.id)}
                              className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Hapus transaksi"
                            >
                              <Icon name="trash" className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
