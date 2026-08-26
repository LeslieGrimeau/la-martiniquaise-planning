"use client";

import { useEffect, useState } from "react";

type WheelItem = {
  id: number;
  label: string;
  sort_order: number;
};

type Wheel = {
  id: number;
  name: string;
  type: string;
};

type WheelState = {
  wheel: Wheel;
  items: WheelItem[];
};

const WHEELS = [
  {
    id: 2,
    title: "🎭 Action ou Vérité",
  },
  {
    id: 3,
    title: "🔥 Action",
  },
  {
    id: 4,
    title: "🤫 Vérité",
  },
];

export default function SubsWheelsPage() {
  const [wheels, setWheels] = useState<WheelState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWheels() {
      try {
        const results = await Promise.all(
          WHEELS.map(async (wheel) => {
            const response = await fetch(
              `/api/roues?wheelId=${wheel.id}`,
              {
                cache: "no-store",
              }
            );

            if (!response.ok) {
              throw new Error(
                `Impossible de charger la roue ${wheel.id}`
              );
            }

            return response.json();
          })
        );

        setWheels(results);
      } catch (error) {
        console.error("Erreur chargement roues subs :", error);
      } finally {
        setLoading(false);
      }
    }

    loadWheels();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050509] text-white">
        <div className="text-center">
          <div className="text-5xl">🎡</div>

          <p className="mt-4 font-bold text-pink-300">
            Chargement des roues...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050509] px-4 py-8 text-white md:px-8">

      {/* DÉCORATIONS DU FOND */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <img
          src="/images/decorations/palmier.png"
          alt=""
          className="absolute -left-16 top-24 w-48 opacity-70 md:-left-8 md:top-20 md:w-64"
        />

        <img
          src="/images/decorations/palmier.png"
          alt=""
          className="absolute -right-16 bottom-10 w-48 -scale-x-100 opacity-70 md:-right-8 md:w-64"
        />

        <img
          src="/images/decorations/hibiscus.png"
          alt=""
          className="absolute left-[8%] top-8 w-24 opacity-80 md:w-32"
        />

        <img
          src="/images/decorations/hibiscus.png"
          alt=""
          className="absolute bottom-8 right-[8%] w-24 -rotate-12 opacity-80 md:w-32"
        />

        <img
          src="/images/decorations/colibri.png"
          alt=""
          className="absolute right-[12%] top-[12%] w-24 opacity-80 md:w-32"
        />
      </div>

      {/* CONTENU */}
      <div className="relative z-10 mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="mb-10 text-center">

          <p className="text-sm font-bold uppercase tracking-[0.35em] text-pink-300">
            💜 LA MARTINIQUAISE
          </p>

          <div className="relative mt-2">
  <select
    defaultValue="subs"
    onChange={(event) => {
      if (event.target.value === "questions") {
        window.location.href = "/roues";
      }
    }}
    className="cursor-pointer appearance-none rounded-2xl border border-pink-500/30 bg-[#09090f] px-6 py-3 pr-12 text-3xl font-black text-white outline-none transition hover:border-pink-400/60 focus:border-pink-400 md:text-5xl"
  >
    <option value="questions">
      🎡 Roues Questions
    </option>

    <option value="subs">
      💜 Roues Subs
    </option>
  </select>

  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-pink-300">
    ▼
  </span>
</div>

          <p className="mt-3 text-gray-400">
            Les roues spéciales réservées aux subs
          </p>

        </header>

        {/* LES 3 ROUES */}
        <div className="grid gap-8 lg:grid-cols-3">

          {wheels.map(({ wheel, items }) => (
            <WheelCard
              key={wheel.id}
              wheel={wheel}
              items={items}
            />
          ))}

        </div>

      </div>
    </main>
  );
}

/* =========================================================
   CARTE D'UNE ROUE
========================================================= */

function WheelCard({
  wheel,
  items,
}: {
  wheel: Wheel;
  items: WheelItem[];
}) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultItemId, setResultItemId] = useState<number | null>(null);

  const segmentAngle =
    items.length > 0
      ? 360 / items.length
      : 0;

      async function removeResultFromWheel() {
  if (
    resultItemId === null ||
    spinning
  ) {
    return;
  }

  try {
    const response = await fetch("/api/roues/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wheelId: wheel.id,
        itemId: resultItemId,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        data?.error ||
          "Impossible de retirer cet élément de la roue."
      );
    }

    // Retire immédiatement l'élément de la roue affichée
    // sans avoir besoin de recharger la page.
    // Ici, le composant parent devra lui aussi être mis à jour.
    setResult(null);
    setResultItemId(null);

    window.location.reload();
  } catch (error) {
    console.error(
      "Erreur suppression résultat :",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Impossible de retirer ce résultat de la roue."
    );
  }
}

  function spinWheel() {
    if (spinning || items.length === 0) {
      return;
    }

    setSpinning(true);
    setResult(null);

    const selectedIndex = Math.floor(
      Math.random() * items.length
    );

    const sectorCenter =
      selectedIndex * segmentAngle +
      segmentAngle / 2;

    const currentNormalized =
      ((rotation % 360) + 360) % 360;

    const extraTurns = 6 * 360;

    const correction =
      ((360 - sectorCenter - currentNormalized) + 360) %
      360;

    const targetRotation =
      rotation +
      extraTurns +
      correction;

    setRotation(targetRotation);

    setTimeout(() => {
  setResult(items[selectedIndex].label);
  setResultItemId(items[selectedIndex].id);
  setSpinning(false);
}, 5200);
  }

  const colors = [
    "#050505",
    "#090909",
  ];

  const segments = items.flatMap((_, index) => {
    const start = index * segmentAngle;
    const end = (index + 1) * segmentAngle;
    const gap = 1.2;

    return [
      `${colors[index % colors.length]} ${start}deg ${end - gap}deg`,
      `#000000 ${end - gap}deg ${end}deg`,
    ];
  });

  const background =
    items.length > 0
      ? `conic-gradient(${segments.join(", ")})`
      : "#050505";

  return (
    <section className="flex flex-col items-center">

      {/* NOM */}
      <h2 className="mb-5 text-center text-2xl font-black">
        {wheel.type === "action_verite" && "🎭 "}
        {wheel.type === "action" && "🔥 "}
        {wheel.type === "verite" && "🤫 "}
        {wheel.name}
      </h2>

      {/* ROUE */}
      <div
        className="rounded-full p-[6px] shadow-[0_0_40px_rgba(236,72,153,0.25)]"
        style={{
          background:
            "linear-gradient(135deg, #ec4899, #f472b6, #c084fc, #ec4899)",
        }}
      >
        <div
          className="relative aspect-square w-[min(28vw,360px)] min-w-[260px] overflow-hidden rounded-full border-4 border-white/10"
          style={{
            background,
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? "transform 5.2s cubic-bezier(0.12, 0.72, 0.16, 1)"
              : "none",
          }}
        >

          {/* NUMÉROS */}
          {items.map((item, index) => {
            const angle =
              index * segmentAngle +
              segmentAngle / 2;

            return (
              <div
                key={item.id}
                className="absolute left-1/2 top-1/2 h-1/2 w-[42%] origin-bottom"
                style={{
                  transform:
                    `translate(-50%, -100%) rotate(${angle}deg)`,
                }}
              >
                <div className="absolute left-1/2 top-[12%] -translate-x-1/2 text-center text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                  {String(index + 1).padStart(2, "0")}
                </div>
              </div>
            );
          })}

          {/* CENTRE */}
          <div className="absolute left-1/2 top-1/2 z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/30 bg-[#09090f] text-xl shadow-2xl">
            🎡
          </div>

        </div>
      </div>

      {/* POINTEUR */}
<div className="relative z-20 -mt-[2px]">
  <div className="h-0 w-0 border-x-[16px] border-b-[28px] border-x-transparent border-b-white drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
</div>

      {/* BOUTON */}
      <button
        type="button"
        onClick={spinWheel}
        disabled={spinning || items.length === 0}
        className="mt-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-3 font-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {spinning ? "🎡..." : "🎡 TOURNER"}
      </button>

      {/* RESULTAT */}
      {result && !spinning && (
  <div className="mt-5 w-full max-w-sm rounded-2xl border border-pink-500/30 bg-pink-500/10 p-4 text-center">

    <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-300">
      🎯 Résultat
    </p>

    <p className="mt-2 font-black">
      {result}
    </p>

    <button
      type="button"
      onClick={removeResultFromWheel}
      className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
    >
      🗑️ Retirer de la roue
    </button>

  </div>
)}

    </section>
  );
}