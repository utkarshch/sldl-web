import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccountStore } from '@/stores/account-store';
import { cn } from '@/lib/utils';
import { Loader2, Music, Download, LayoutDashboard } from 'lucide-react';

export function OnboardingPage() {
    const navigate = useNavigate();
    const { addAccount, fetchAccounts } = useAccountStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await addAccount(username, password);
            // After adding, we need to ensure it's picked up
            await fetchAccounts();

            // Navigate to dashboard
            navigate('/');
        } catch (err: any) {
            console.error('Onboarding failed:', err);
            setError(err.message || 'Failed to connect account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex flex-col">
            {/* Header */}
            <div className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <Download className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight">SLDL</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full p-6 gap-12 items-center justify-center">
                {/* Left: Value Prop */}
                <div className="flex-1 space-y-8 max-w-lg">
                    <div>
                        <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight mb-4">
                            Your Personal <br />
                            <span className="text-primary">Music Archive</span>
                        </h1>
                        <p className="text-lg text-text-muted leading-relaxed">
                            Connect your Soulseek account to start downloading high-quality music directly to your library.
                            We automate the search and download process so you can focus on listening.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <Feature
                            icon={Music}
                            title="Unlimited Access"
                            description="Access the massive Soulseek network library instantly."
                        />
                        <Feature
                            icon={LayoutDashboard}
                            title="Smart Dashboard"
                            description="Track downloads, manage queues, and organize your files."
                        />
                        <Feature
                            icon={Download}
                            title="Automated Downloads"
                            description="Paste a Spotify or YouTube link and let us handle the rest."
                        />
                    </div>
                </div>

                {/* Right: Form */}
                <div className="flex-1 w-full max-w-md">
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-border p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold font-display">Connect Soulseek</h2>
                            <p className="text-text-muted text-sm mt-1">
                                Enter your Soulseek credentials to continue.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-text-default mb-1.5">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    placeholder="Soulseek username"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-default mb-1.5">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-muted focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    placeholder="Soulseek password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !username || !password}
                                className={cn(
                                    "w-full flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-white transition-all",
                                    isLoading || !username || !password
                                        ? "bg-text-muted cursor-not-allowed"
                                        : "bg-primary hover:bg-primary-hover shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98]"
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Connect & Continue"
                                )}
                            </button>

                            <p className="text-xs text-center text-text-faint mt-4">
                                Your credentials are encrypted and stored securely.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Feature({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h3 className="font-semibold text-text-default">{title}</h3>
                <p className="text-sm text-text-muted mt-1 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
