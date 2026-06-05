import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { getTurso, sessionConfig, type SessionData } from "@/lib/turso.server";

export const Route = createFileRoute("/api/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { nome?: string; senha?: string };
          const { nome, senha } = body;
          if (!nome || !senha) {
            return Response.json({ success: false, error: "Nome e senha obrigatórios." });
          }
          const turso = getTurso();
          const result = await turso.execute({
            sql: "SELECT * FROM dManos WHERE nome = ? AND senha = ?",
            args: [nome, senha],
          });
          if (result.rows.length === 0) {
            return Response.json({ success: false, error: "Nome ou senha inválidos." });
          }
          const row: any = result.rows[0];
          const ID = Number(row.ID ?? row.id);
          const Nome = String(row.nome ?? row.Nome ?? nome);
          const session = await useSession<SessionData>(sessionConfig);
          await session.update({ user: { ID, Nome } });
          return Response.json({ success: true, message: "Login realizado com sucesso!", nome: Nome, id: ID });
        } catch (err: any) {
          console.error("Erro /api/login:", err);
          return Response.json({ success: false, error: "Erro ao realizar login." });
        }
      },
    },
  },
});
