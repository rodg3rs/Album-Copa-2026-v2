import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [{ title: "Cadastro — Álbum Copa 2026" }, { name: "description", content: "Crie sua conta para começar a controlar o álbum." }] }),
  component: CadastroPage,
});

function CadastroPage() {
  const { cadastro } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  return (
    <AppShell>
      <section className="mx-4 mt-6">
        <h2 className="text-2xl font-black text-foreground">Criar conta</h2>
        <p className="mt-1 text-sm text-muted-foreground">É rápido e gratuito.</p>

        {ok ? (
          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <h3 className="mt-2 text-lg font-bold">Cadastro realizado!</h3>
            <p className="mt-1 text-sm text-muted-foreground">Faça login para continuar.</p>
            <button onClick={() => navigate({ to: "/login" })} className="mt-4 h-11 w-full rounded-xl bg-primary font-bold text-primary-foreground">
              Ir para o login
            </button>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setErr(null); setLoading(true);
              const r = await cadastro(nome.trim(), email.trim(), senha);
              setLoading(false);
              if (r.success) setOk(true);
              else setErr(r.error || "Erro ao cadastrar");
            }}
            className="mt-6 space-y-3"
          >
            <Field label="Nome de usuário" value={nome} onChange={setNome} />
            <Field label="E-mail" value={email} onChange={setEmail} type="email" autoComplete="email" />
            <Field label="Senha" value={senha} onChange={setSenha} type="password" autoComplete="new-password" />
            {err && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground active:scale-[0.98] disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Cadastrar
            </button>
            <p className="pt-2 text-center text-sm text-muted-foreground">
              Já tem conta? <Link to="/login" className="font-semibold text-primary">Entrar</Link>
            </p>
          </form>
        )}
      </section>
    </AppShell>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="h-12 w-full rounded-xl border border-input bg-card px-4 text-base outline-none ring-primary/30 focus:ring-2"
        required
      />
    </label>
  );
}
