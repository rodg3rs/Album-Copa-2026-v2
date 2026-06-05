import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

type User = { id: number; nome: string } | null;

type AuthCtx = {
  user: User;
  loading: boolean;
  login: (nome: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  cadastro: (nome: string, email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      // Tenta uma rota que requer sessão; se retornar 403, não está logado.
      const data = await api<{ success: boolean }>("/controle?tipo=A");
      if (data?.success) {
        const stored = localStorage.getItem("album_user");
        if (stored) setUser(JSON.parse(stored));
      } else {
        setUser(null);
        localStorage.removeItem("album_user");
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login: AuthCtx["login"] = async (nome, senha) => {
    const data = await api<{ success: boolean; nome?: string; id?: number; error?: string }>(
      "/login",
      { method: "POST", body: JSON.stringify({ nome, senha }) },
    );
    if (data.success && data.id && data.nome) {
      const u = { id: data.id, nome: data.nome };
      setUser(u);
      localStorage.setItem("album_user", JSON.stringify(u));
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const cadastro: AuthCtx["cadastro"] = async (nome, email, senha) => {
    const data = await api<{ success: boolean; error?: string }>("/cadastro", {
      method: "POST",
      body: JSON.stringify({ nome, email, senha }),
    });
    return { success: data.success, error: data.error };
  };

  const logout = async () => {
    try { await api("/logout"); } catch {}
    setUser(null);
    localStorage.removeItem("album_user");
  };

  return <Ctx.Provider value={{ user, loading, login, cadastro, logout, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}
