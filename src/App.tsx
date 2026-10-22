import React, { useState, useEffect, useCallback } from 'react';
import {
  AppState,
  Budget,
  DailyExpenseItem,
  FinancialPlanItem,
  JajanItem,
  PlanGroupType,
  TabType,
  Transaction,
  Wallet,
} from './types';
import { getInitialState, saveState } from './utils/storage';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DesktopSidebar } from './components/DesktopSidebar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { TransactionModal } from './components/TransactionModal';
import { TransferModal } from './components/TransferModal';
import { WalletModal } from './components/WalletModal';
import { BudgetModal } from './components/BudgetModal';
import { PlanItemModal } from './components/PlanItemModal';
import { DailyExpenseModal } from './components/DailyExpenseModal';
import { JajanModal } from './components/JajanModal';
import { SettingsModal } from './views/SettingsModal';
import { DashboardView } from './views/DashboardView';
import { PlannerView } from './views/PlannerView';
import { DailyTrackersView } from './views/DailyTrackersView';
import { TransactionsView } from './views/TransactionsView';
import { BudgetsView } from './views/BudgetsView';
import { WalletsView } from './views/WalletsView';
import { getCurrentMonthString } from './utils/currency';

export const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => getInitialState());
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FinancialPlanItem | null>(null);
  const [defaultPlanGroup, setDefaultPlanGroup] = useState<PlanGroupType>('fixed_cost');

  const [isDailyExpenseModalOpen, setIsDailyExpenseModalOpen] = useState(false);
  const [editingDailyExpense, setEditingDailyExpense] = useState<DailyExpenseItem | null>(null);

  const [isJajanModalOpen, setIsJajanModalOpen] = useState(false);
  const [editingJajan, setEditingJajan] = useState<JajanItem | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Sync theme to HTML class
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  // Month navigation
  const handleSelectMonth = (month: string) => {
    setState((prev) => ({
      ...prev,
      selectedMonth: month,
    }));
  };

  // Keyboard shortcut: '+' to add transaction when outside inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }
      if (e.key === '+' || e.key === 'n') {
        e.preventDefault();
        setEditingTx(null);
        setIsTxModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save Transaction (Add or Edit)
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    setState((prev) => {
      let updatedWallets = [...prev.wallets];
      let updatedTransactions = [...prev.transactions];

      if (existingId) {
        // Revert efek transaksi lama pada saldo dompet
        const oldTx = prev.transactions.find((t) => t.id === existingId);
        if (oldTx) {
          if (oldTx.type === 'expense') {
            updatedWallets = updatedWallets.map((w) =>
              w.id === oldTx.walletId ? { ...w, balance: w.balance + oldTx.amount } : w
            );
          } else if (oldTx.type === 'income') {
            updatedWallets = updatedWallets.map((w) =>
              w.id === oldTx.walletId ? { ...w, balance: w.balance - oldTx.amount } : w
            );
          }
        }

        // Terapkan efek transaksi baru pada saldo dompet
        if (txData.type === 'expense') {
          updatedWallets = updatedWallets.map((w) =>
            w.id === txData.walletId ? { ...w, balance: w.balance - txData.amount } : w
          );
        } else if (txData.type === 'income') {
          updatedWallets = updatedWallets.map((w) =>
            w.id === txData.walletId ? { ...w, balance: w.balance + txData.amount } : w
          );
        }

        updatedTransactions = updatedTransactions.map((t) =>
          t.id === existingId ? { ...t, ...txData } : t
        );
        showToast('Catatan transaksi berhasil diperbarui.', 'success');
      } else {
        // Transaksi Baru
        const newTx: Transaction = {
          ...txData,
          id: 'tx-' + Date.now(),
          createdAt: Date.now(),
        };

        if (txData.type === 'expense') {
          updatedWallets = updatedWallets.map((w) =>
            w.id === txData.walletId ? { ...w, balance: w.balance - txData.amount } : w
          );
        } else if (txData.type === 'income') {
          updatedWallets = updatedWallets.map((w) =>
            w.id === txData.walletId ? { ...w, balance: w.balance + txData.amount } : w
          );
        }

        updatedTransactions = [newTx, ...updatedTransactions];
        showToast('Transaksi baru berhasil dicatat.', 'success');
      }

      return {
        ...prev,
        wallets: updatedWallets,
        transactions: updatedTransactions,
      };
    });
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const tx = state.transactions.find((t) => t.id === id);
    if (!tx) return;

    if (window.confirm('Yakin ingin menghapus catatan transaksi ini? Saldo dompet akan disesuaikan.')) {
      setState((prev) => {
        let updatedWallets = [...prev.wallets];

        if (tx.type === 'expense') {
          updatedWallets = updatedWallets.map((w) =>
            w.id === tx.walletId ? { ...w, balance: w.balance + tx.amount } : w
          );
        } else if (tx.type === 'income') {
          updatedWallets = updatedWallets.map((w) =>
            w.id === tx.walletId ? { ...w, balance: w.balance - tx.amount } : w
          );
        } else if (tx.type === 'transfer' && tx.toWalletId) {
          // Revert transfer
          updatedWallets = updatedWallets.map((w) => {
            if (w.id === tx.walletId) return { ...w, balance: w.balance + tx.amount };
            if (w.id === tx.toWalletId) return { ...w, balance: w.balance - tx.amount };
            return w;
          });
        }

        return {
          ...prev,
          wallets: updatedWallets,
          transactions: prev.transactions.filter((t) => t.id !== id),
          dailyExpenses: prev.dailyExpenses.filter((d) => d.transactionId !== id),
          jajanItems: prev.jajanItems.filter((j) => j.transactionId !== id),
        };
      });
      showToast('Transaksi berhasil dihapus.', 'info');
    }
  };

  // Transfer between wallets
  const handleTransfer = (data: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    date: string;
    note: string;
  }) => {
    setState((prev) => {
      const fromW = prev.wallets.find((w) => w.id === data.fromWalletId);
      const toW = prev.wallets.find((w) => w.id === data.toWalletId);
      if (!fromW || !toW) return prev;

      const updatedWallets = prev.wallets.map((w) => {
        if (w.id === data.fromWalletId) return { ...w, balance: w.balance - data.amount };
        if (w.id === data.toWalletId) return { ...w, balance: w.balance + data.amount };
        return w;
      });

      const newTx: Transaction = {
        id: 'tx-' + Date.now(),
        type: 'transfer',
        amount: data.amount,
        walletId: data.fromWalletId,
        toWalletId: data.toWalletId,
        date: data.date,
        note: data.note,
        createdAt: Date.now(),
      };

      return {
        ...prev,
        wallets: updatedWallets,
        transactions: [newTx, ...prev.transactions],
      };
    });

    showToast('Transfer saldo antar dompet berhasil.', 'success');
  };

  // Wallet CRUD
  const handleSaveWallet = (walletData: Omit<Wallet, 'id'>, existingId?: string) => {
    setState((prev) => {
      if (existingId) {
        return {
          ...prev,
          wallets: prev.wallets.map((w) =>
            w.id === existingId ? { ...w, ...walletData } : w
          ),
        };
      } else {
        const newWallet: Wallet = {
          ...walletData,
          id: 'w-' + Date.now(),
        };
        return {
          ...prev,
          wallets: [...prev.wallets, newWallet],
        };
      }
    });

    showToast(existingId ? 'Dompet berhasil diperbarui.' : 'Dompet baru berhasil ditambahkan.', 'success');
  };

  const handleDeleteWallet = (id: string) => {
    if (state.wallets.length <= 1) {
      showToast('Minimal harus ada 1 dompet aktif.', 'error');
      return;
    }

    if (window.confirm('Hapus dompet ini? Transaksi lama yang terkait akan tetap tersimpan di riwayat.')) {
      setState((prev) => ({
        ...prev,
        wallets: prev.wallets.filter((w) => w.id !== id),
      }));
      showToast('Dompet berhasil dihapus.', 'info');
    }
  };

  // Budget CRUD
  const handleSaveBudget = (budgetData: Omit<Budget, 'id'>, existingId?: string) => {
    setState((prev) => {
      if (existingId) {
        return {
          ...prev,
          budgets: prev.budgets.map((b) =>
            b.id === existingId ? { ...b, ...budgetData } : b
          ),
        };
      } else {
        const exists = prev.budgets.find(
          (b) => b.categoryId === budgetData.categoryId && b.month === budgetData.month
        );
        if (exists) {
          return {
            ...prev,
            budgets: prev.budgets.map((b) =>
              b.id === exists.id ? { ...b, monthlyLimit: budgetData.monthlyLimit } : b
            ),
          };
        }

        const newBudget: Budget = {
          ...budgetData,
          id: 'b-' + Date.now(),
        };
        return {
          ...prev,
          budgets: [...prev.budgets, newBudget],
        };
      }
    });

    showToast('Batas anggaran pos berhasil disimpan.', 'success');
  };

  const handleDeleteBudget = (id: string) => {
    if (window.confirm('Hapus target anggaran pos ini?')) {
      setState((prev) => ({
        ...prev,
        budgets: prev.budgets.filter((b) => b.id !== id),
      }));
      showToast('Anggaran pos berhasil dihapus.', 'info');
    }
  };

  // Financial Plans (4 Pilar) CRUD
  const handleSavePlan = (planData: Omit<FinancialPlanItem, 'id'>, existingId?: string) => {
    setState((prev) => {
      if (existingId) {
        return {
          ...prev,
          plans: prev.plans.map((p) => (p.id === existingId ? { ...p, ...planData } : p)),
        };
      } else {
        const newPlan: FinancialPlanItem = {
          ...planData,
          id: 'plan-' + Date.now(),
        };
        return {
          ...prev,
          plans: [...prev.plans, newPlan],
        };
      }
    });
    showToast('Pos anggaran berhasil disimpan.', 'success');
  };

  const handleDeletePlan = (id: string) => {
    if (window.confirm('Hapus pos anggaran ini?')) {
      setState((prev) => ({
        ...prev,
        plans: prev.plans.filter((p) => p.id !== id),
      }));
      showToast('Pos anggaran berhasil dihapus.', 'info');
    }
  };

  // Daily Expense CRUD with automatic wallet deduction & transaction sync
  const handleSaveDailyExpense = (
    data: Omit<DailyExpenseItem, 'id' | 'createdAt' | 'total'>,
    existingId?: string
  ) => {
    const totalAmount = data.quantity * data.price;
    setState((prev) => {
      let updatedDaily = [...prev.dailyExpenses];
      let updatedWallets = [...prev.wallets];
      let updatedTxs = [...prev.transactions];

      if (existingId) {
        const oldItem = prev.dailyExpenses.find((d) => d.id === existingId);
        if (oldItem) {
          // Revert old transaction effect
          updatedWallets = updatedWallets.map((w) =>
            w.id === oldItem.walletId ? { ...w, balance: w.balance + oldItem.total } : w
          );
          // Apply new effect
          updatedWallets = updatedWallets.map((w) =>
            w.id === data.walletId ? { ...w, balance: w.balance - totalAmount } : w
          );
          // Update linked transaction
          if (oldItem.transactionId) {
            updatedTxs = updatedTxs.map((t) =>
              t.id === oldItem.transactionId
                ? {
                    ...t,
                    amount: totalAmount,
                    walletId: data.walletId,
                    date: data.date,
                    note: `${data.title} (${data.quantity}x @ Rp ${data.price})`,
                  }
                : t
            );
          }
        }

        updatedDaily = updatedDaily.map((d) =>
          d.id === existingId
            ? { ...d, ...data, total: totalAmount }
            : d
        );
        showToast('Pengeluaran sehari-hari berhasil diperbarui.', 'success');
      } else {
        const txId = 'tx-de-' + Date.now();
        const newTx: Transaction = {
          id: txId,
          type: 'expense',
          amount: totalAmount,
          walletId: data.walletId,
          date: data.date,
          note: `${data.title} (${data.quantity}x @ Rp ${data.price})`,
          createdAt: Date.now(),
          sourceTracker: 'daily_expense',
        };

        const newItem: DailyExpenseItem = {
          ...data,
          id: 'de-' + Date.now(),
          total: totalAmount,
          transactionId: txId,
          createdAt: Date.now(),
        };

        updatedWallets = updatedWallets.map((w) =>
          w.id === data.walletId ? { ...w, balance: w.balance - totalAmount } : w
        );

        updatedDaily = [newItem, ...updatedDaily];
        updatedTxs = [newTx, ...updatedTxs];
        showToast('Pengeluaran sehari-hari dicatat & saldo dipotong.', 'success');
      }

      return {
        ...prev,
        dailyExpenses: updatedDaily,
        wallets: updatedWallets,
        transactions: updatedTxs,
      };
    });
  };

  const handleDeleteDailyExpense = (id: string) => {
    const item = state.dailyExpenses.find((d) => d.id === id);
    if (!item) return;

    if (window.confirm(`Hapus catatan "${item.title}"? Saldo dompet akan dikembalikan.`)) {
      setState((prev) => {
        const updatedWallets = prev.wallets.map((w) =>
          w.id === item.walletId ? { ...w, balance: w.balance + item.total } : w
        );

        return {
          ...prev,
          wallets: updatedWallets,
          dailyExpenses: prev.dailyExpenses.filter((d) => d.id !== id),
          transactions: prev.transactions.filter((t) => t.id !== item.transactionId),
        };
      });
      showToast('Catatan berhasil dihapus & saldo dipulihkan.', 'info');
    }
  };

  // Jajan & Nongkrong CRUD with automatic wallet deduction & transaction sync
  const handleSaveJajan = (
    data: Omit<JajanItem, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    setState((prev) => {
      let updatedJajan = [...prev.jajanItems];
      let updatedWallets = [...prev.wallets];
      let updatedTxs = [...prev.transactions];

      if (existingId) {
        const oldItem = prev.jajanItems.find((j) => j.id === existingId);
        if (oldItem) {
          // Revert old effect
          updatedWallets = updatedWallets.map((w) =>
            w.id === oldItem.walletId ? { ...w, balance: w.balance + oldItem.amount } : w
          );
          // Apply new effect
          updatedWallets = updatedWallets.map((w) =>
            w.id === data.walletId ? { ...w, balance: w.balance - data.amount } : w
          );
          // Update linked transaction
          if (oldItem.transactionId) {
            updatedTxs = updatedTxs.map((t) =>
              t.id === oldItem.transactionId
                ? {
                    ...t,
                    amount: data.amount,
                    walletId: data.walletId,
                    date: data.date,
                    note: `Jajan: ${data.title}${data.note ? ` (${data.note})` : ''}`,
                  }
                : t
            );
          }
        }

        updatedJajan = updatedJajan.map((j) =>
          j.id === existingId ? { ...j, ...data } : j
        );
        showToast('Catatan jajan berhasil diperbarui.', 'success');
      } else {
        const txId = 'tx-jj-' + Date.now();
        const newTx: Transaction = {
          id: txId,
          type: 'expense',
          amount: data.amount,
          walletId: data.walletId,
          date: data.date,
          note: `Jajan: ${data.title}${data.note ? ` (${data.note})` : ''}`,
          createdAt: Date.now(),
          sourceTracker: 'jajan',
        };

        const newItem: JajanItem = {
          ...data,
          id: 'jj-' + Date.now(),
          transactionId: txId,
          createdAt: Date.now(),
        };

        updatedWallets = updatedWallets.map((w) =>
          w.id === data.walletId ? { ...w, balance: w.balance - data.amount } : w
        );

        updatedJajan = [newItem, ...updatedJajan];
        updatedTxs = [newTx, ...updatedTxs];
        showToast('Catatan jajan disimpan & saldo dipotong.', 'success');
      }

      return {
        ...prev,
        jajanItems: updatedJajan,
        wallets: updatedWallets,
        transactions: updatedTxs,
      };
    });
  };

  const handleDeleteJajan = (id: string) => {
    const item = state.jajanItems.find((j) => j.id === id);
    if (!item) return;

    if (window.confirm(`Hapus catatan jajan "${item.title}"? Saldo dompet akan dikembalikan.`)) {
      setState((prev) => {
        const updatedWallets = prev.wallets.map((w) =>
          w.id === item.walletId ? { ...w, balance: w.balance + item.amount } : w
        );

        return {
          ...prev,
          wallets: updatedWallets,
          jajanItems: prev.jajanItems.filter((j) => j.id !== id),
          transactions: prev.transactions.filter((t) => t.id !== item.transactionId),
        };
      });
      showToast('Catatan jajan dihapus & saldo dipulihkan.', 'info');
    }
  };

  const totalBalance = state.wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row w-full transition-colors">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Desktop Sidebar (Only visible on lg: screens) */}
      <DesktopSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        totalBalance={totalBalance}
        selectedMonth={state.selectedMonth}
        theme={state.theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAddTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onOpenAddDailyExpense={() => {
          setEditingDailyExpense(null);
          setIsDailyExpenseModalOpen(true);
        }}
        onOpenAddJajan={() => {
          setEditingJajan(null);
          setIsJajanModalOpen(true);
        }}
      />

      {/* Main Content Area (Expands responsive on Desktop, native mobile feel on phone) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Sticky Mobile Topbar (Hidden on lg: desktop) */}
        <Navbar
          totalBalance={totalBalance}
          selectedMonth={state.selectedMonth}
          theme={state.theme}
          onToggleTheme={handleToggleTheme}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Content Container (Full width responsive) */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              state={state}
              onSelectTab={setCurrentTab}
              onOpenAddTransaction={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onOpenTransfer={() => setIsTransferModalOpen(true)}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentTab === 'planner' && (
            <PlannerView
              state={state}
              onSelectMonth={handleSelectMonth}
              onOpenAddPlan={(group) => {
                setEditingPlan(null);
                setDefaultPlanGroup(group || 'fixed_cost');
                setIsPlanModalOpen(true);
              }}
              onEditPlan={(plan) => {
                setEditingPlan(plan);
                setIsPlanModalOpen(true);
              }}
              onDeletePlan={handleDeletePlan}
              onNavigateToTrackers={() => setCurrentTab('trackers')}
            />
          )}

          {currentTab === 'trackers' && (
            <DailyTrackersView
              state={state}
              onSelectMonth={handleSelectMonth}
              onOpenAddDailyExpense={() => {
                setEditingDailyExpense(null);
                setIsDailyExpenseModalOpen(true);
              }}
              onEditDailyExpense={(item) => {
                setEditingDailyExpense(item);
                setIsDailyExpenseModalOpen(true);
              }}
              onDeleteDailyExpense={handleDeleteDailyExpense}
              onOpenAddJajan={() => {
                setEditingJajan(null);
                setIsJajanModalOpen(true);
              }}
              onEditJajan={(item) => {
                setEditingJajan(item);
                setIsJajanModalOpen(true);
              }}
              onDeleteJajan={handleDeleteJajan}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              state={state}
              onOpenAddTransaction={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentTab === 'budgets' && (
            <BudgetsView
              state={state}
              onOpenAddBudget={() => {
                setEditingBudget(null);
                setIsBudgetModalOpen(true);
              }}
              onEditBudget={(budget) => {
                setEditingBudget(budget);
                setIsBudgetModalOpen(true);
              }}
              onDeleteBudget={handleDeleteBudget}
            />
          )}

          {currentTab === 'wallets' && (
            <WalletsView
              state={state}
              onOpenAddWallet={() => {
                setEditingWallet(null);
                setIsWalletModalOpen(true);
              }}
              onOpenTransfer={() => setIsTransferModalOpen(true)}
              onEditWallet={(wallet) => {
                setEditingWallet(wallet);
                setIsWalletModalOpen(true);
              }}
              onDeleteWallet={handleDeleteWallet}
            />
          )}
        </main>

        {/* Bottom Navigation (Only visible on mobile / tablet < lg) */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenAddTransaction={() => {
            setEditingTx(null);
            setIsTxModalOpen(true);
          }}
          onOpenAddDailyExpense={() => {
            setEditingDailyExpense(null);
            setIsDailyExpenseModalOpen(true);
          }}
          onOpenAddJajan={() => {
            setEditingJajan(null);
            setIsJajanModalOpen(true);
          }}
        />
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        categories={state.categories}
        wallets={state.wallets}
        editTransaction={editingTx}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransfer={handleTransfer}
        wallets={state.wallets}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => {
          setIsWalletModalOpen(false);
          setEditingWallet(null);
        }}
        onSave={handleSaveWallet}
        editWallet={editingWallet}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        categories={state.categories}
        existingBudget={editingBudget}
        currentMonth={state.selectedMonth || getCurrentMonthString()}
      />

      <PlanItemModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
          setEditingPlan(null);
        }}
        onSave={handleSavePlan}
        editItem={editingPlan}
        defaultGroup={defaultPlanGroup}
        month={state.selectedMonth || getCurrentMonthString()}
      />

      <DailyExpenseModal
        isOpen={isDailyExpenseModalOpen}
        onClose={() => {
          setIsDailyExpenseModalOpen(false);
          setEditingDailyExpense(null);
        }}
        onSave={handleSaveDailyExpense}
        wallets={state.wallets}
        editItem={editingDailyExpense}
        defaultMonth={state.selectedMonth || getCurrentMonthString()}
      />

      <JajanModal
        isOpen={isJajanModalOpen}
        onClose={() => {
          setIsJajanModalOpen(false);
          setEditingJajan(null);
        }}
        onSave={handleSaveJajan}
        wallets={state.wallets}
        editItem={editingJajan}
        defaultMonth={state.selectedMonth || getCurrentMonthString()}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onUpdateState={setState}
        onToggleTheme={handleToggleTheme}
        onShowToast={showToast}
      />
    </div>
  );
};
