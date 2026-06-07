import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { api, FLAG_MAP, TEAM_NAMES, TEAMS } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";

type Row = { user: string; team: string; stamps: string[] };

export function TradesPage({ mode }: { mode: "quero" | "troco" }) {
  return (
    <RequireAuth>
      <AppShell>
        <TradesContent mode={mode} />
      </AppShell>
    </RequireAuth>
  );
}

function TradesContent({ mode }: { mode: "quero" | "troco" }) {
  const router = useRouter();
  const goBack = () => (window.history.length > 1 ? router.history.back() : router.navigate({ to: "/" }));
  const endpoint = mode === "quero" ? "/quero" : "/troco";
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<string>("");

  const load = async (user?: string) => {
    setLoading(true);
    try {
      const qs = user ? `?user=${encodeURIComponent(user)}` : "";
      const data = await api<{ success: boolean; users: string[]; result: Row[] }>(`${endpoint}${qs}`);
      if (data.success) {
        setUsers(data.users || []);
        setRows(data.result || []);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [endpoint]);

  const title = mode === "quero" ? "Eu Quero" : "Eu Troco";
  const subtitle = mode === "quero"
    ? "Repetidas dos outros que faltam no seu álbum."
    : "Suas repetidas que outros ainda não têm.";

  // Agrupar por seleção, mapeando número -> usuários
  const byTeam: Record<string, { team: string; nums: Record<string, string[]> }> = {};
  rows.forEach((r) => {
    const entry = (byTeam[r.team] ||= { team: r.team, nums: {} });
    r.stamps.forEach((s) => {
      const num = s.replace(r.team, "");
      (entry.nums[num] ||= []).push(r.user);
    });
  });

  // Ordenar conforme álbum físico: FWC(0-8), seleções (ordem TEAMS), FWC(9-19), CC
  const orderedTeams: string[] = [];
  if (byTeam["FWC"]) orderedTeams.push("FWC_A");
  TEAMS.forEach((t) => { if (byTeam[t]) orderedTeams.push(t); });
  if (byTeam["FWC"]) orderedTeams.push("FWC_B");
  if (byTeam["CC"]) orderedTeams.push("CC");

  const groupCells = (groupKey: string): { team: string; cells: string[] } => {
    if (groupKey === "FWC_A") return { team: "FWC", cells: Array.from({ length: 9 }, (_, i) => String(i)) };
    if (groupKey === "FWC_B") return { team: "FWC", cells: Array.from({ length: 11 }, (_, i) => String(i + 9)) };
    if (groupKey === "CC") return { team: "CC", cells: Array.from({ length: 14 }, (_, i) => String(i + 1)) };
    return { team: groupKey, cells: Array.from({ length: 20 }, (_, i) => String(i + 1)) };
  };

  return (
    <>
      <section className="sticky top-[56px] z-20 border-b-2 border-border bg-background px-3 py-1.5 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-black leading-tight text-foreground">{title}</h2>
          <p className="min-w-0 flex-1 truncate text-[10px] leading-tight text-muted-foreground">{subtitle}</p>
          <button
            onClick={goBack}
            className="flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-foreground active:scale-95"
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar
          </button>
        </div>

        {users.length > 0 && (
          <div className="-mx-3 mt-1.5 flex gap-1.5 overflow-x-auto px-3 pb-0.5">
            <Chip active={!filter} onClick={() => { setFilter(""); load(); }}>Todos</Chip>
            {users.map((u) => (
              <Chip key={u} active={filter === u} onClick={() => { setFilter(u); load(u); }}>{u}</Chip>
            ))}
          </div>
        )}
      </section>

      {loading ? (
        <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : orderedTeams.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {mode === "quero"
              ? "Nenhuma figurinha encontrada — marque as suas em 'Álbum' para descobrir o que falta."
              : "Nenhuma combinação ainda — marque suas duplicadas em 'Repetidas'."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {orderedTeams.map((groupKey) => {
            const { team, cells } = groupCells(groupKey);
            const nums = byTeam[team].nums;
            const flag = FLAG_MAP[team];
            const label = TEAM_NAMES[team] ?? (team === "FWC" ? "FIFA World Cup" : team === "CC" ? "Coca-Cola" : team);
            return (
              <div key={groupKey} className="flex items-center gap-1 px-1 py-1">
                <div className="flex w-14 shrink-0 items-center gap-1">
                  {flag ? (
                    <img src={`/img/flags/${flag}.svg`} alt={label} title={label} className="h-5 w-7 rounded-sm object-cover shadow-sm" />
                  ) : (
                    <span className="grid h-5 w-7 place-items-center rounded-sm bg-[color:var(--gold)] text-[9px] font-black text-[color:var(--gold-foreground)]">
                      {team === "CC" ? "CC" : "FWC"}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-foreground">{team}</span>
                </div>
                <div className="grid min-w-0 flex-1 gap-0.5 grid-cols-[repeat(20,minmax(0,1fr))]">
                  {cells.map((num) => {
                    const owners = nums[num];
                    const on = !!owners;
                    return (
                      <button
                        type="button"
                        key={num}
                        title={on ? `${label} ${num} — ${owners!.join(", ")}` : `${label} ${num}`}
                        className={
                          "flex aspect-square min-w-0 items-center justify-center rounded text-[10px] font-bold leading-none transition-all " +
                          (on
                            ? mode === "quero"
                              ? "bg-[color:var(--gold)] text-[color:var(--gold-foreground)] shadow-inner"
                              : "bg-secondary text-secondary-foreground shadow-inner"
                            : "border border-dashed border-border bg-background text-muted-foreground/40")
                        }
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground")
      }
    >
      {children}
    </button>
  );
}
