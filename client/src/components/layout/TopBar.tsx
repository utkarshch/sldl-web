import { useAuthStore } from "@/stores/auth-store";
import { Circle } from "lucide-react";

export function TopBar() {
  const { isConfigured, username } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-sm px-6">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Circle
            className={`h-2.5 w-2.5 fill-current ${
              isConfigured ? "text-accent" : "text-text-faint"
            }`}
          />
          <span className="text-text-muted">
            {isConfigured ? username || "Connected" : "Not connected"}
          </span>
        </div>
      </div>
    </header>
  );
}
