import { createFileRoute } from "@tanstack/react-router";
import { AlbumPage } from "@/components/album-page";

export const Route = createFileRoute("/repetidas")({
  head: () => ({ meta: [{ title: "Repetidas — Copa 2026" }, { name: "description", content: "Marque as figurinhas que você tem repetidas." }] }),
  component: () => <AlbumPage tipo="R" />,
});
