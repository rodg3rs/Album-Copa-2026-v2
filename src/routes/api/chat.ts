import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { getTurso, sessionConfig, type SessionData } from "@/lib/turso.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      GET: async () => {
        const session = await useSession<SessionData>(sessionConfig);
        if (!session.data.user) {
          return Response.json({ success: false, error: "Não logado" }, { status: 403 });
        }
        const cutoff = Math.floor(Date.now() / 1000) - 24 * 3600;
        try {
          const turso = getTurso();
          const result = await turso.execute({
            sql: "SELECT Nome, Mensagem, Timestamp FROM dChat WHERE Timestamp>=? ORDER BY Timestamp ASC",
            args: [cutoff],
          });
          const messages = result.rows.map((r: any) => ({
            user: r.Nome,
            text: r.Mensagem,
            timestamp: r.Timestamp,
          }));
          return Response.json({
            success: true,
            currentUser: session.data.user.Nome,
            messages,
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
        const { text } = (await request.json()) as { text?: string };
        if (!text || !text.trim()) {
          return Response.json({ success: false, error: "Mensagem vazia" });
        }
        const now = new Date();
        const timestamp = Math.floor(Date.now() / 1000);
        try {
          const turso = getTurso();
          await turso.execute({
            sql: "INSERT INTO dChat (Nome, Mensagem, Data, Hora, Timestamp) VALUES (?, ?, ?, ?, ?)",
            args: [
              String(session.data.user.Nome),
              String(text.trim()),
              String(now.toISOString().split("T")[0]),
              String(now.toTimeString().split(" ")[0]),
              Number(timestamp),
            ],
          });
          return Response.json({ success: true });
        } catch (err: any) {
          console.error("ERRO /api/chat INSERT:", err);
          return Response.json({ success: false, error: err.message }, { status: 500 });
        }
      },
    },
  },
});
