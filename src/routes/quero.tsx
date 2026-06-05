import { createFileRoute } from "@tanstack/react-router";
import { TradesPage } from "@/components/trades-page";

export const Route = createFileRoute("/quero")({
  head: () => ({ meta: [{ title: "Eu Quero — Copa 2026" }, { name: "description", content: "Veja quem tem as figurinhas que faltam no seu álbum." }] }),
  component: () => <TradesPage mode="quero" />,
});
