"use client";

import { useState } from "react";

type Game = {
  name?: string;
  image?: string;
  emoji?: string;
};

type PlanningItem = {
  id: number;
  day: string;
  sessionTime: string;
  games: Game[];
};

export default function PlanningForm({
  planning,
  savePlanning,
}: {
  planning: PlanningItem[];
  savePlanning: (formData: FormData) => void;
}) {
  const [items, setItems] = useState(planning);

  function updateItem(
    id: number,
    field: "day" | "sessionTime" | "games",
    value: string
  ) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        if (field === "games") {
          return {
            ...item,
            games: value
              .split(",")
              .map((name) => name.trim())
              .filter(Boolean)
              .map((name) => ({ name })),
          };
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  }

  const payload = items.map((item) => ({
    id: item.id,
    day: item.day,
    sessionTime: item.sessionTime,
    games: item.games.map((game) => game.name).filter(Boolean).join(", "),
  }));

  return (
    <form action={savePlanning}>
      <input
        type="hidden"
        name="planning"
        value={JSON.stringify(payload)}
        readOnly
      />

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl border border-purple-500/30 bg-white/[0.03] p-5"
          >
            <div className="grid gap-4 md:grid-cols-[1fr_160px_2fr]">

              {/* JOUR */}
              <div>
                <label
                  htmlFor={`day-${item.id}`}
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
                >
                  Jour
                </label>

                <select
                  id={`day-${item.id}`}
                  value={item.day}
                  onChange={(event) =>
                    updateItem(item.id, "day", event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-pink-400/60"
                >
                  <option value="Lundi">Lundi</option>
                  <option value="Mardi">Mardi</option>
                  <option value="Mercredi">Mercredi</option>
                  <option value="Jeudi">Jeudi</option>
                  <option value="Vendredi">Vendredi</option>
                  <option value="Samedi">Samedi</option>
                  <option value="Dimanche">Dimanche</option>
                </select>
              </div>

              {/* HEURE */}
              <div>
                <label
                  htmlFor={`time-${item.id}`}
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
                >
                  Heure
                </label>

                <input
                  id={`time-${item.id}`}
                  type="text"
                  value={item.sessionTime}
                  onChange={(event) =>
                    updateItem(item.id, "sessionTime", event.target.value)
                  }
                  placeholder="14h00"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-pink-400/60"
                />
              </div>

              {/* JEUX */}
              <div>
                <label
                  htmlFor={`games-${item.id}`}
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
                >
                  Jeux
                </label>

                <input
                  id={`games-${item.id}`}
                  type="text"
                  value={item.games
                    .map((game) => game.name)
                    .filter(Boolean)
                    .join(", ")}
                  onChange={(event) =>
                    updateItem(item.id, "games", event.target.value)
                  }
                  placeholder="Fortnite, Motorfest"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-pink-400/60"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Sépare plusieurs jeux avec une virgule.
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 font-black text-white shadow-[0_0_25px_rgba(236,72,153,0.15)] transition hover:scale-[1.02]"
        >
          💾 Enregistrer le planning
        </button>
      </div>
    </form>
  );
}