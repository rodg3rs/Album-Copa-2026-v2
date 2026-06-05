import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Álbum Copa 2026" }, { name: "description", content: "Acesse sua conta para controlar seu álbum." }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <AppShell>
      <section className="mx-4 mt-6">
        <h2 className="text-2xl font-black text-foreground">Entrar</h2>
        <p className="mt-1 text-sm text-muted-foreground">Use seu usuário e senha do álbum.</p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null); setLoading(true);
            const r = await login(nome.trim(), senha);
            setLoading(false);
            if (r.success) navigate({ to: "/" });
            else setErr(r.error || "Falha no login");
          }}
          className="mt-6 space-y-3"
        >
          <Field label="Usuário" value={nome} onChange={setNome} placeholder="seu nome" autoComplete="username" />
          <Field label="Senha" value={senha} onChange={setSenha} type="password" autoComplete="current-password" />
          {err && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.98] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </button>
          <p className="pt-2 text-center text-sm text-muted-foreground">
            Ainda não tem conta? <Link to="/cadastro" className="font-semibold text-primary">Cadastre-se</Link>
          </p>
        </form>
      </section>
    </AppShell>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-12 w-full rounded-xl border border-input bg-card px-4 text-base outline-none ring-primary/30 focus:ring-2"
        required
      />
    </label>
  );
}
