import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Send, Loader2 } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — Copa 2026" }, { name: "description", content: "Combine trocas com outros colecionadores." }] }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <ChatPage />
      </AppShell>
    </RequireAuth>
  ),
});

type Msg = { user: string; text: string; timestamp: number };

function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const data = await api<{ success: boolean; messages: Msg[] }>("/chat");
      if (data.success) setMessages(data.messages);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await api("/chat", { method: "POST", body: JSON.stringify({ text: text.trim() }) });
      setText("");
      await load();
    } finally { setSending(false); }
  };

  return (
    <>
      <section className="sticky top-[72px] z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <h2 className="text-lg font-black text-foreground">Chat da Galera</h2>
        <p className="text-[11px] text-muted-foreground">Últimas 24 horas · combine suas trocas aqui.</p>
      </section>

      <div className="flex flex-col gap-2 px-4 py-4 pb-28">
        {loading ? (
          <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Nenhuma mensagem ainda. Mande a primeira!</p>
        ) : (
          messages.map((m, i) => {
            const mine = m.user === user?.nome;
            const time = new Date(m.timestamp * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            return (
              <div key={i} className={"flex flex-col " + (mine ? "items-end" : "items-start")}>
                {!mine && <span className="mb-0.5 ml-3 text-[10px] font-semibold text-muted-foreground">{m.user}</span>}
                <div className={
                  "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm " +
                  (mine
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm border border-border bg-card text-card-foreground")
                }>
                  {m.text}
                </div>
                <span className="mt-0.5 px-2 text-[10px] text-muted-foreground">{time}</span>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={send}
        className="safe-bottom fixed inset-x-0 bottom-[64px] z-20 border-t border-border bg-card/95 px-3 py-2 backdrop-blur"
      >
        <div className="mx-auto flex max-w-md items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Mensagem..."
            className="h-11 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground active:scale-95 disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </>
  );
}
