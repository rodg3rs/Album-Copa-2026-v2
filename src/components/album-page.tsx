import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { api, FLAG_MAP, TEAM_NAMES, TEAMS } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Save } from "lucide-react";

type Group = { label: string; key: string; flag?: string; stamps: string[] };

function buildGroups(): Group[] {
  const groups: Group[] = [];
  groups.push({ label: "FIFA World Cup", key: "FWC", stamps: Array.from({ length: 9 }, (_, i) => `FWC${i}`) });
  for (const t of TEAMS) {
    groups.push({
      label: TEAM_NAMES[t] ?? t,
      key: t,
      flag: FLAG_MAP[t],
      stamps: Array.from({ length: 20 }, (_, i) => `${t}${i + 1}`),
    });
  }
  groups.push({ label: "FIFA World Cup", key: "FWC", stamps: Array.from({ length: 11 }, (_, i) => `FWC${i + 9}`) });
  groups.push({ label: "Coca-Cola", key: "CC", stamps: Array.from({ length: 14 }, (_, i) => `CC${i + 1}`) });
  return groups;
}

export function AlbumPage({ tipo }: { tipo: "A" | "R" }) {
  return (
    <RequireAuth>
      <AppShell>
        <AlbumContent tipo={tipo} />
      </AppShell>
    </RequireAuth>
  );
}

function AlbumContent({ tipo }: { tipo: "A" | "R" }) {
  const router = useRouter();
  const goBack = () => (window.history.length > 1 ? router.history.back() : router.navigate({ to: "/" }));
  const groups = useMemo(buildGroups, []);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<{ total: number; marcadas: number; faltam: number } | null>(null);
  
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api<{ success: boolean; stamps: string[]; total?: number; marcadas?: number; faltam?: number }>(
        `/controle?tipo=${tipo}`,
      );
      if (data.success) {
        setChecked(new Set(data.stamps));
        if (tipo === "A" && data.total != null) setStats({ total: data.total, marcadas: data.marcadas!, faltam: data.faltam! });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tipo]);

  const toggle = (s: string) => {
    setChecked((prev) => {
      const n = new Set(prev);
      n.has(s) ? n.delete(s) : n.add(s);
      return n;
    });
  };

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const data = await api<{ success: boolean; error?: string }>("/controle", {
        method: "POST",
        body: JSON.stringify({ tipo, stamps: Array.from(checked) }),
      });
      setMsg(data.success ? "Atualizado!" : data.error || "Erro");
      if (data.success) load();
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 2500);
    }
  };

  const percent = stats ? Math.round((stats.marcadas / stats.total) * 100) : 0;

  return (
    <>
      <section className="sticky top-[56px] z-20 border-b-2 border-border bg-background px-3 py-1.5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-black leading-tight text-foreground">
              {tipo === "A" ? "Meu Álbum" : "Minhas Repetidas"}
            </h2>
            {tipo === "A" && stats && (
              <p className="text-[10px] leading-tight text-muted-foreground">
                {stats.marcadas}/{stats.total} ({percent}%) · faltam {stats.faltam}
              </p>
            )}
          </div>
          {tipo === "A" && stats && (
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${percent}%`, background: "var(--gradient-gold)" }}
              />
            </div>
          )}
          <button
            onClick={save}
            disabled={saving || loading}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-[var(--shadow-card)] active:scale-95 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Salvar
          </button>
          <button
            onClick={goBack}
            className="flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-foreground active:scale-95"
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar
          </button>
        </div>
      </section>

      {msg && <p className="mx-4 mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">{msg}</p>}

      {loading ? (
        <div className="grid min-h-[40vh] place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="divide-y divide-border">
          {groups.map((g, idx) => (
            <div key={`${g.key}-${idx}`} className="flex items-center gap-1 px-1 py-1">
              <div className="flex w-14 shrink-0 items-center gap-1">
                {g.flag ? (
                  <img
                    src={`/img/flags/${g.flag}.svg`}
                    alt={g.label}
                    title={g.label}
                    className="h-5 w-7 rounded-sm object-cover shadow-sm"
                  />
                ) : (
                  <span className="grid h-5 w-7 place-items-center rounded-sm bg-[color:var(--gold)] text-[9px] font-black text-[color:var(--gold-foreground)]">
                    {g.key === "CC" ? "CC" : "FWC"}
                  </span>
                )}
                <span className="text-[10px] font-bold text-foreground">{g.key}</span>
              </div>
              <div className="grid min-w-0 flex-1 gap-0.5 grid-cols-[repeat(20,minmax(0,1fr))]">
                {g.stamps.map((s) => {
                  const on = checked.has(s);
                  const num = s.replace(g.key, "");
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggle(s)}
                      title={`${g.label} ${num}`}
                      className={cn(
                        "flex aspect-square min-w-0 items-center justify-center rounded text-[10px] font-bold leading-none transition-all active:scale-90",
                        tipo === "A"
                          ? on
                            ? "bg-secondary text-secondary-foreground shadow-inner"
                            : "border border-dashed border-border bg-background text-muted-foreground"
                          : on
                            ? "bg-[color:var(--gold)] text-[color:var(--gold-foreground)] shadow-inner"
                            : "border border-border bg-muted text-foreground/70",
                      )}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
