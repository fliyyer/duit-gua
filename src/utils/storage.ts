import { AppState } from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_WALLETS,
} from '../data/defaultData';
import { getCurrentMonthString } from './currency';

const STORAGE_KEY = 'duit_gua_data_v3';

export function getInitialState(): AppState {
  const currentMonth = getCurrentMonthString();

  if (typeof window === 'undefined') {
    return {
      wallets: DEFAULT_WALLETS,
      categories: DEFAULT_CATEGORIES,
      transactions: [],
      budgets: [],
      plans: [],
      dailyExpenses: [],
      jajanItems: [],
      selectedMonth: currentMonth,
      theme: 'light',
    };
  }

  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem('duit_gua_data_v2') ||
      localStorage.getItem('duit_gua_data_v1');

    if (!raw) {
      const initial: AppState = {
        wallets: DEFAULT_WALLETS,
        categories: DEFAULT_CATEGORIES,
        transactions: [],
        budgets: [],
        plans: [],
        dailyExpenses: [],
        jajanItems: [],
        selectedMonth: currentMonth,
        theme: 'light',
      };
      saveState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);

    // Auto-clean any legacy sample/dummy data from previous versions
    const hasLegacySampleData =
      (Array.isArray(parsed.transactions) && parsed.transactions.some((t: any) => t.id === 'tx-1' || t.id === 'tx-2')) ||
      (Array.isArray(parsed.wallets) && parsed.wallets.some((w: any) => w.id === 'w-bca' && w.balance === 5200000)) ||
      (Array.isArray(parsed.plans) && parsed.plans.some((p: any) => p.id === 'plan-inc-1'));

    if (hasLegacySampleData) {
      return clearAllData();
    }

    return {
      wallets: Array.isArray(parsed.wallets) && parsed.wallets.length > 0 ? parsed.wallets : DEFAULT_WALLETS,
      categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : DEFAULT_CATEGORIES,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
      plans: Array.isArray(parsed.plans) ? parsed.plans : [],
      dailyExpenses: Array.isArray(parsed.dailyExpenses) ? parsed.dailyExpenses : [],
      jajanItems: Array.isArray(parsed.jajanItems) ? parsed.jajanItems : [],
      selectedMonth: parsed.selectedMonth || currentMonth,
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch (err) {
    console.error('Gagal membaca data dari LocalStorage:', err);
    return {
      wallets: DEFAULT_WALLETS,
      categories: DEFAULT_CATEGORIES,
      transactions: [],
      budgets: [],
      plans: [],
      dailyExpenses: [],
      jajanItems: [],
      selectedMonth: currentMonth,
      theme: 'light',
    };
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Gagal menyimpan data ke LocalStorage:', err);
  }
}

export function exportDataAsJSON(state: AppState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `duit-gua-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importDataFromJSON(jsonText: string): AppState | null {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') return null;

    if (!Array.isArray(parsed.wallets) || !Array.isArray(parsed.transactions)) {
      return null;
    }

    const currentMonth = getCurrentMonthString();
    const state: AppState = {
      wallets: parsed.wallets,
      categories: Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATEGORIES,
      transactions: parsed.transactions,
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
      plans: Array.isArray(parsed.plans) ? parsed.plans : [],
      dailyExpenses: Array.isArray(parsed.dailyExpenses) ? parsed.dailyExpenses : [],
      jajanItems: Array.isArray(parsed.jajanItems) ? parsed.jajanItems : [],
      selectedMonth: parsed.selectedMonth || currentMonth,
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };

    saveState(state);
    return state;
  } catch (err) {
    console.error('Gagal import data:', err);
    return null;
  }
}

export function clearAllData(): AppState {
  const currentMonth = getCurrentMonthString();
  const blankState: AppState = {
    wallets: DEFAULT_WALLETS,
    categories: DEFAULT_CATEGORIES,
    transactions: [],
    budgets: [],
    plans: [],
    dailyExpenses: [],
    jajanItems: [],
    selectedMonth: currentMonth,
    theme: 'light',
  };
  saveState(blankState);
  return blankState;
}
