import { useAuthStore } from "@/stores/auth-store";
import { LogOut, User } from "lucide-react";

export function TopBar() {
  const { user, signOut } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-sm px-6">
      <div />
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-6 w-6 rounded-full" />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span>{user.email}</span>
          </div>
        )}
        <button
          onClick={() => signOut()}
          className="p-2 hover:bg-surface-hover rounded-md text-text-muted hover:text-text transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
