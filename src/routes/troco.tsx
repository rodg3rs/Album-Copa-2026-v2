import { createFileRoute } from "@tanstack/react-router";
import { TradesPage } from "@/components/trades-page";

export const Route = createFileRoute("/troco")({
  head: () => ({ meta: [{ title: "Eu Troco — Copa 2026" }, { name: "description", content: "Veja quem precisa das figurinhas que você tem repetidas." }] }),
  component: () => <TradesPage mode="troco" />,
});
