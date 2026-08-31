"use client";

import { useState } from "react";

type Card = { front: string; back: string };

export default function FlashcardViewer({ meta }: { meta: Record<string, unknown> }) {
  const cards = (Array.isArray(meta.cards) ? meta.cards : []) as Card[];
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[i];

  if (!cards.length) {
    return <p className="text-sm text-wisdom-muted">No cards in this deck.</p>;
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="w-full min-h-[180px] rounded-2xl border border-white/15 bg-wisdom-card p-6 text-center shadow-lg"
      >
        <p className="text-[10px] uppercase tracking-wider text-wisdom-muted mb-2">
          {flipped ? "Back" : "Front"} · {i + 1}/{cards.length}
        </p>
        <p className="text-lg font-semibold text-white">
          {flipped ? card.back : card.front}
        </p>
      </button>
      <div className="flex justify-between gap-2">
        <button
          type="button"
          disabled={i === 0}
          onClick={() => {
            setI((x) => x - 1);
            setFlipped(false);
          }}
          className="px-4 py-2 rounded-xl border border-white/12 text-sm disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={i >= cards.length - 1}
          onClick={() => {
            setI((x) => x + 1);
            setFlipped(false);
          }}
          className="px-4 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
