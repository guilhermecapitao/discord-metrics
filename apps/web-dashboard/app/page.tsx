"use client";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  const eventsQuery = trpc.events.latest.useQuery({ limit: 20 }, { refetchInterval: 5000 });

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Últimos eventos</h1>

      {eventsQuery.isLoading && <p>Carregando…</p>}
      {eventsQuery.error && <p className="text-red-500">Erro ao carregar</p>}

      {eventsQuery.data && (
        <ul className="space-y-2">
          {eventsQuery.data.map(ev => (
            <li key={ev.id} className="border border-neutral-800 p-3 rounded">
              <span className="text-sm text-neutral-400">
                {new Date(ev.createdAt).toLocaleTimeString()} —
              </span>{" "}
              <span className="font-mono">{ev.type}</span> •{" "}
              {(ev.payload as any).content?.slice(0, 70)}
            </li>
          ))}
        </ul>
      )}

      <Button className="mt-6" onClick={() => eventsQuery.refetch()}>
        Atualizar
      </Button>
    </main>
  );
}