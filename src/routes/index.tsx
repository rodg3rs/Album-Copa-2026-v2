import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Álbum Copa 2026 — Início" },
      { name: "description", content: "Controle seu álbum da FIFA World Cup 2026 e organize trocas direto do celular." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user } = useAuth();
  return (
    <AppShell>
      <section
        className="relative h-[calc(100dvh-9rem)] w-full overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/img/home.webp)" }}
      >
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-90">FIFA World Cup 2026</p>
          <h2 className="mt-1 text-2xl font-black leading-tight drop-shadow">
            {user ? `Bem-vindo, ${user.nome}!` : "Bem-vindo ao Álbum Copa 2026"}
          </h2>
          <p className="mt-1 text-sm opacity-90 drop-shadow">
            {user
              ? "Use o menu abaixo para acessar seu álbum, repetidas e trocas."
              : "Entre ou cadastre-se pelo ícone no topo para começar."}
          </p>
        </div>
      </section>
    </AppShell>
  );
}
