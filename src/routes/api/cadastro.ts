import { createFileRoute } from "@tanstack/react-router";
import { getTurso } from "@/lib/turso.server";

export const Route = createFileRoute("/api/cadastro")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { nome, email, senha } = (await request.json()) as {
            nome?: string; email?: string; senha?: string;
          };
          if (!nome || !email || !senha) {
            return Response.json({ success: false, error: "Dados incompletos." });
          }
          const turso = getTurso();
          await turso.execute({
            sql: "INSERT INTO dManos (nome, eMail, senha) VALUES (?, ?, ?)",
            args: [nome, email, senha],
          });
          return Response.json({ success: true, message: "Cadastro realizado com sucesso!" });
        } catch (err: any) {
          if (String(err?.message || "").includes("UNIQUE constraint failed")) {
            return Response.json({ success: false, error: "Este e-mail já está cadastrado." });
          }
          console.error("Erro /api/cadastro:", err);
          return Response.json({ success: false, error: "Erro ao cadastrar usuário." });
        }
      },
    },
  },
});
