import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { sessionConfig, type SessionData } from "@/lib/turso.server";

export const Route = createFileRoute("/api/logout")({
  server: {
    handlers: {
      GET: async () => {
        const session = await useSession<SessionData>(sessionConfig);
        await session.clear();
        return Response.json({ success: true });
      },
    },
  },
});
