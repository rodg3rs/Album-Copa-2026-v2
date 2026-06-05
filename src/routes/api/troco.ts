import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { getTurso, sessionConfig, type SessionData } from "@/lib/turso.server";

export const Route = createFileRoute("/api/troco")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await useSession<SessionData>(sessionConfig);
        if (!session.data.user) {
          return Response.json({ success: false, error: "Não logado" }, { status: 403 });
        }
        const url = new URL(request.url);
        const filtroUser = url.searchParams.get("user");
        const userId = session.data.user.ID;
        try {
          const turso = getTurso();
          const repRes = await turso.execute({
            sql: "SELECT Stamp FROM dControle WHERE ID = ? AND Tipo = 'R'",
            args: [userId],
          });
          const minhasRepetidas = new Set(repRes.rows.map((r: any) => r.Stamp));
          if (minhasRepetidas.size === 0) {
            return Response.json({ success: true, users: [], result: [] });
          }
          let sql = `
            SELECT dManos.Nome, s.Stamp
            FROM (SELECT Stamp FROM dControle WHERE ID = ? AND Tipo = 'R') s
            CROSS JOIN dManos
            WHERE dManos.ID <> ?
              AND NOT EXISTS (
                SELECT 1 FROM dControle
                WHERE dControle.ID = dManos.ID
                  AND dControle.Tipo = 'A'
                  AND dControle.Stamp = s.Stamp
              )
          `;
          const args: any[] = [userId, userId];
          if (filtroUser) { sql += " AND dManos.Nome = ?"; args.push(filtroUser); }
          const faltRes = await turso.execute({ sql, args });

          const result: { user: string; team: string; stamps: string[] }[] = [];
          const users = new Set<string>();
          faltRes.rows.forEach((r: any) => {
            if (minhasRepetidas.has(r.Stamp)) {
              const team = String(r.Stamp).replace(/[0-9]+$/, "");
              let row = result.find((x) => x.user === r.Nome && x.team === team);
              if (!row) { row = { user: r.Nome, team, stamps: [] }; result.push(row); }
              row.stamps.push(r.Stamp);
              users.add(r.Nome);
            }
          });
          return Response.json({ success: true, users: [...users], result });
        } catch (err: any) {
          console.error("Erro /api/troco:", err);
          return Response.json({ success: false, error: err.message }, { status: 500 });
        }
      },
    },
  },
});
