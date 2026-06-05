import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { getTurso, sessionConfig, type SessionData } from "@/lib/turso.server";

const TEAMS = [
  "MEX","RSA","KOR","CZE","CAN","BIH","QAT","SUI","BRA","MAR","HAI","SCO","USA","PAR","AUS","TUR",
  "GER","CUW","CIV","ECU","NED","JPN","SWE","TUN","BEL","EGY","IRN","NZL","ESP","CPV","KSA","URU",
  "FRA","SEN","IRQ","NOR","ARG","ALG","AUT","JOR","POR","COD","UZB","COL","ENG","CRO","GHA","PAN",
];

function buildAllStamps() {
  const all: string[] = [];
  for (const t of TEAMS) for (let i = 1; i <= 20; i++) all.push(`${t}${i}`);
  for (let i = 0; i <= 19; i++) all.push(`FWC${i}`);
  for (let i = 1; i <= 14; i++) all.push(`CC${i}`);
  return all;
}

export const Route = createFileRoute("/api/controle")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await useSession<SessionData>(sessionConfig);
        if (!session.data.user) {
          return Response.json({ success: false, error: "Não logado" }, { status: 403 });
        }
        const url = new URL(request.url);
        const tipo = (url.searchParams.get("tipo") || "A").toUpperCase();
        try {
          const turso = getTurso();
          const result = await turso.execute({
            sql: "SELECT Stamp FROM dControle WHERE ID = ? AND Tipo = ?",
            args: [session.data.user.ID, tipo],
          });
          const stamps = result.rows.map((r: any) => r.Stamp);
          const total = buildAllStamps().length;
          return Response.json({
            success: true,
            stamps,
            total,
            marcadas: stamps.length,
            faltam: total - stamps.length,
          });
        } catch (err: any) {
          return Response.json({ success: false, error: err.message }, { status: 500 });
        }
      },
      POST: async ({ request }) => {
        const session = await useSession<SessionData>(sessionConfig);
        if (!session.data.user) {
          return Response.json({ success: false, error: "Não logado" }, { status: 403 });
        }
        const { tipo, stamps } = (await request.json()) as { tipo?: string; stamps?: string[] };
        const userId = session.data.user.ID;
        const t = (tipo || "A").toUpperCase();
        try {
          const turso = getTurso();
          const existingRes = await turso.execute({
            sql: "SELECT Stamp FROM dControle WHERE ID = ? AND Tipo = ?",
            args: [userId, t],
          });
          const existing = new Set(existingRes.rows.map((r: any) => r.Stamp));
          const incoming = new Set(Array.isArray(stamps) ? stamps : []);
          const toInsert = [...incoming].filter((s) => !existing.has(s));
          const toDelete = [...existing].filter((s) => !incoming.has(s));

          for (const s of toInsert) {
            await turso.execute({
              sql: "INSERT OR IGNORE INTO dControle (ID, Stamp, Tipo) VALUES (?, ?, ?)",
              args: [userId, s, t],
            });
          }
          if (toDelete.length > 0) {
            const placeholders = toDelete.map(() => "?").join(",");
            await turso.execute({
              sql: `DELETE FROM dControle WHERE ID = ? AND Tipo = ? AND Stamp IN (${placeholders})`,
              args: [userId, t, ...toDelete],
            });
          }
          return Response.json({
            success: true,
            message: "Controle atualizado",
            inserted: toInsert.length,
            deleted: toDelete.length,
          });
        } catch (err: any) {
          return Response.json({ success: false, error: err.message }, { status: 500 });
        }
      },
    },
  },
});
