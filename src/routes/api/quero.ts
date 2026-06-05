import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { getTurso, sessionConfig, type SessionData } from "@/lib/turso.server";

export const Route = createFileRoute("/api/quero")({
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
          let sql = `
            SELECT dManos.Nome, r.Stamp
            FROM dControle r
            JOIN dManos ON r.ID = dManos.ID
            WHERE r.Tipo = 'R'
              AND r.ID <> ?
              AND NOT EXISTS (
                SELECT 1 FROM dControle a
                WHERE a.ID = ?
                  AND a.Tipo = 'A'
                  AND a.Stamp = r.Stamp
              )
          `;
          const args: any[] = [userId, userId];
          if (filtroUser) { sql += " AND dManos.Nome = ?"; args.push(filtroUser); }
          const repRes = await turso.execute({ sql, args });

          const result: { user: string; team: string; stamps: string[] }[] = [];
          const users = new Set<string>();
          repRes.rows.forEach((r: any) => {
            const team = String(r.Stamp).replace(/[0-9]+$/, "");
            let row = result.find((x) => x.user === r.Nome && x.team === team);
            if (!row) { row = { user: r.Nome, team, stamps: [] }; result.push(row); }
            row.stamps.push(r.Stamp);
            users.add(r.Nome);
          });
          return Response.json({ success: true, users: [...users], result });
        } catch (err: any) {
          console.error("Erro /api/quero:", err);
          return Response.json({ success: false, error: err.message }, { status: 500 });
        }
      },
    },
  },
});
