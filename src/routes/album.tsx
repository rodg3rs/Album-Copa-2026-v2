import { createFileRoute } from "@tanstack/react-router";
import { AlbumPage } from "@/components/album-page";

export const Route = createFileRoute("/album")({
  head: () => ({ meta: [{ title: "Meu Álbum — Copa 2026" }, { name: "description", content: "Marque as figurinhas que você já colou no álbum." }] }),
  component: () => <AlbumPage tipo="A" />,
});
