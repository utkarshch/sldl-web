import { create } from 'zustand';
import { api } from '../lib/api-client';
import { SoulseekAccount } from '@shared/types';

interface AccountState {
    accounts: SoulseekAccount[];
    isLoading: boolean;
    error: string | null;

    fetchAccounts: () => Promise<void>;
    addAccount: (username: string, password: string) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    setActiveAccount: (id: string) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
    accounts: [],
    isLoading: false,
    error: null,

    fetchAccounts: async () => {
        set({ isLoading: true, error: null });
        try {
            const accounts = await api.getAccounts();
            set({ accounts, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    addAccount: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
            await api.createAccount(username, password);
            await get().fetchAccounts();
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            throw err;
        }
    },

    deleteAccount: async (id) => {
        try {
            await api.deleteAccount(id);
            set(state => ({
                accounts: state.accounts.filter(a => a.id !== id)
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    setActiveAccount: async (id) => {
        try {
            await api.setActiveAccount(id);
            await get().fetchAccounts(); // Refresh to show correct active state
        } catch (err: any) {
            set({ error: err.message });
        }
    }
}));
