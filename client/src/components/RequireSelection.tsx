import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAccountStore } from '@/stores/account-store';


export function RequireSelection({ children }: { children: React.ReactElement }) {
    const { accounts, fetchAccounts, isLoading } = useAccountStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const check = async () => {
            await fetchAccounts();
            setIsChecking(false);
        };
        check();
    }, [fetchAccounts]);

    if (isLoading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Check if there are any active accounts or just any account?
    // The requirement is to ask for credentials.
    // If no accounts exist, redirect to onboarding.
    if (accounts.length === 0) {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
}
