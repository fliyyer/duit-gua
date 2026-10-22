export type TransactionType = 'income' | 'expense' | 'transfer';

export type WalletType = 'cash' | 'bank' | 'ewallet' | 'investment';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  color: string;
  accountNumber?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId?: string;
  walletId: string;
  toWalletId?: string; // Digunakan jika tipe transaksi adalah transfer antar dompet
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: number;
  sourceTracker?: 'daily_expense' | 'jajan';
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  month: string; // YYYY-MM
}

// Fitur Manajemen Keuangan Bulanan & Tracker (Template @OTWSATUMILYAR)
export type PlanGroupType = 'income' | 'saving' | 'fixed_cost' | 'variable_cost' | 'subscription_debt';
export type PlanPriority = 'High' | 'Medium' | 'Low';
export type IncomeCategoryType = 'Utama' | 'Sampingan' | 'Hutang' | 'Lainnya';

export interface FinancialPlanItem {
  id: string;
  month: string; // YYYY-MM
  group: PlanGroupType;
  title: string; // Keterangan / Sumber
  incomeType?: IncomeCategoryType; // Khusus group 'income'
  priority: PlanPriority;
  plannedAmount: number; // Rencana (Rp)
  actualAmount: number; // Realisasi / Aktual (Rp)
  isAutoCalculated?: boolean; // True jika dihitung otomatis dari tracker harian
}

export interface DailyExpenseItem {
  id: string;
  month: string; // YYYY-MM
  date: string; // YYYY-MM-DD
  title: string; // Keterangan (Makan Bu Dede, Bensin, Galon, Ojol, dll.)
  quantity: number; // Jumlah (Qty)
  price: number; // Harga satuan (Rp)
  total: number; // quantity * price
  walletId: string;
  transactionId?: string;
  createdAt: number;
}

export interface JajanItem {
  id: string;
  month: string; // YYYY-MM
  date: string; // YYYY-MM-DD
  title: string; // Jajanan / Nongkrong (Sushi, Kopken, Richeese, Billiard, dll.)
  amount: number; // Uang yang dihabiskan
  note?: string; // Keterangan (Beli Gorengan, Nongkrong santai)
  walletId: string;
  transactionId?: string;
  createdAt: number;
}

export type TabType = 'dashboard' | 'planner' | 'trackers' | 'transactions' | 'wallets' | 'budgets';

export interface AppState {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  plans: FinancialPlanItem[];
  dailyExpenses: DailyExpenseItem[];
  jajanItems: JajanItem[];
  selectedMonth: string; // YYYY-MM
  theme: 'light' | 'dark';
}
