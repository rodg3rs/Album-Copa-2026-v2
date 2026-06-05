import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { Home, BookOpen, Copy, Star, Handshake, MessageCircle, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const navItems = [
  { to: "/album", label: "Álbum", icon: BookOpen },
  { to: "/repetidas", label: "Repetidas", icon: Copy },
  { to: "/quero", label: "Quero", icon: Star },
  { to: "/troco", label: "Troco", icon: Handshake },
  { to: "/chat", label: "Chat", icon: MessageCircle },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header
        className="safe-top sticky top-0 z-30 px-4 pb-3 pt-2 text-primary-foreground shadow-[var(--shadow-card)]"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--gold)] text-[color:var(--gold-foreground)] font-black">⚽</span>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight">Álbum Copa 2026</h1>
              <p className="text-[10px] opacity-80">by Rodg3rs</p>
            </div>
          </Link>
          {user ? (
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
              {user.nome}
            </span>
          ) : (
            <Link to="/login" className="flex items-center gap-1 rounded-full bg-[color:var(--gold)] px-3 py-1.5 text-xs font-bold text-[color:var(--gold-foreground)] active:scale-95">
              <LogIn className="h-3.5 w-3.5" /> Entrar
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden pb-24">{children}</main>

      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 text-primary-foreground shadow-[var(--shadow-card)]"
        style={{ background: "var(--gradient-hero)" }}
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-between px-1 py-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
                    active ? "bg-white/20 text-[color:var(--gold)]" : "text-primary-foreground/80",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "fill-primary/10")} />
                  {label}
                </Link>
              </li>
            );
          })}
          {user && (
            <li className="flex-1">
              <button
                onClick={async () => {
                  await logout();
                  router.navigate({ to: "/" });
                }}
                className="flex w-full flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-primary-foreground/80 transition-colors active:scale-95"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}
