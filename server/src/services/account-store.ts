import { supabase } from '../auth/supabase.js';
import { SoulseekAccount } from '@shared/types/index.js';

export class AccountStore {
    async getAccounts(userId: string): Promise<SoulseekAccount[]> {
        const { data, error } = await supabase
            .from('soulseek_accounts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async createAccount(userId: string, account: Partial<SoulseekAccount>): Promise<SoulseekAccount> {
        // If this is the first account, make it active
        const { count } = await supabase
            .from('soulseek_accounts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        const isFirst = count === 0;

        const { data, error } = await supabase
            .from('soulseek_accounts')
            .insert({
                user_id: userId,
                username: account.username,
                password: account.password,
                is_active: isFirst, // Auto-activate if first
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteAccount(userId: string, accountId: string): Promise<void> {
        const { error } = await supabase
            .from('soulseek_accounts')
            .delete()
            .eq('id', accountId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    async setActiveAccount(userId: string, accountId: string): Promise<void> {
        // Transaction-like update: deactivate all, then activate one
        // Supabase RLS policies might make this tricky in one go if doing bulk update
        // But since we are server-side with service role, we can do it.

        // 1. Deactivate all for user
        await supabase
            .from('soulseek_accounts')
            .update({ is_active: false })
            .eq('user_id', userId);

        // 2. Activate target
        const { error } = await supabase
            .from('soulseek_accounts')
            .update({ is_active: true })
            .eq('id', accountId)
            .eq('user_id', userId);

        if (error) throw error;
    }
}
