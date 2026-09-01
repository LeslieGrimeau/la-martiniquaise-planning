"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type WheelItem = {
  id: number;
  label: string;
  sort_order: number;
};

type WheelData = {
  id: number;
  name: string;
  type: string;
};

const COLORS = [
  "#050505",
  "#090909",
];

export default function RouesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050509] text-white">
          <div className="text-center">
            <div className="text-5xl">🎡</div>

            <p className="mt-4 font-bold text-pink-300">
              Chargement de la roue...
            </p>
          </div>
        </main>
      }
    >
      <RouesPageContent />
    </Suspense>
  );
}

function RouesPageContent() {
  const searchParams = useSearchParams();

  const wheelId = searchParams.get("wheelId") || "1";

  const [wheel, setWheel] = useState<WheelData | null>(null);
  const [items, setItems] = useState<WheelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [resultItemId, setResultItemId] = useState<number | null>(null);

  useEffect(() => {
    async function loadWheel() {
      try {
        setLoading(true);
        setWheel(null);
        setItems([]);
        setResult(null);
        setResultItemId(null);
        setRotation(0);

        const response = await fetch(
          `/api/roues?wheelId=${wheelId}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Impossible de charger la roue");
        }

        const data = await response.json();

        setWheel(data.wheel);
        setItems(data.items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadWheel();
  }, [wheelId]);

  const segmentAngle = useMemo(() => {
    if (items.length === 0) return 0;

    return 360 / items.length;
  }, [items.length]);

  const wheelBackground = useMemo(() => {
    if (items.length === 0) {
      return "#050505";
    }

    const gap = 1.2;

    const segments = items.flatMap((_, index) => {
      const start = index * segmentAngle;
      const end = (index + 1) * segmentAngle;

      const color = COLORS[index % COLORS.length];

      return [
        `${color} ${start}deg ${end - gap}deg`,
        `#000000 ${end - gap}deg ${end}deg`,
      ];
    });

    return `conic-gradient(${segments.join(", ")})`;
  }, [items, segmentAngle]);

  async function removeResultFromWheel() {
    if (
      resultItemId === null ||
      spinning ||
      !wheel
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
          data?.error || "Impossible de retirer la question."
        );
      }

      setItems((currentItems) =>
        currentItems.filter(
          (item) => item.id !== resultItemId
        )
      );

      setResult(null);
      setResultItemId(null);
      setRotation(0);
    } catch (error) {
      console.error("Erreur suppression :", error);

      alert(
        error instanceof Error
          ? error.message
          : "Impossible de retirer cette question de la roue."
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

    /*
     * Le pointeur est en haut.
     * On calcule la rotation nécessaire pour placer
     * le centre du secteur sélectionné sous le pointeur.
     */

    const sectorCenter =
      selectedIndex * segmentAngle +
      segmentAngle / 2;

    const extraTurns = 6 * 360;

    // Rotation actuelle ramenée entre 0 et 359°
    const currentNormalized =
      ((rotation % 360) + 360) % 360;

    // Rotation nécessaire pour placer le centre
    // du secteur sélectionné sous la flèche du haut
    const correction =
      ((360 - sectorCenter - currentNormalized) + 360) % 360;

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

  const currentSelectValue =
    wheelId === "5"
      ? "fortnite"
      : wheelId === "6"
        ? "motorfest"
        : wheelId === "7"
          ? "callofduty"
          : "questions";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050509] text-white">
        <div className="text-center">
          <div className="text-5xl">🎡</div>

          <p className="mt-4 font-bold text-pink-300">
            Chargement de la roue...
          </p>
        </div>
      </main>
    );
  }

  if (!wheel || items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050509] px-4 text-white">
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <div className="text-4xl">🎡</div>

          <h1 className="mt-4 text-2xl font-black">
            Roue indisponible
          </h1>

          <p className="mt-2 text-gray-400">
            Aucun élément n'est actuellement configuré.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050509] px-4 py-8 text-white md:px-8">

      {/* DÉCORATIONS DU FOND */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-0 h-full w-full"
        aria-hidden="true"
      >
        {/* Palmier gauche */}
        <img
          src="/images/decorations/palmier.png"
          alt=""
          className="absolute -left-16 top-24 w-48 opacity-70 md:-left-8 md:top-20 md:w-64"
        />

        {/* Palmier droit */}
        <img
          src="/images/decorations/palmier.png"
          alt=""
          className="absolute -right-16 bottom-10 w-48 -scale-x-100 opacity-70 md:-right-8 md:w-64"
        />

        {/* Hibiscus haut gauche */}
        <img
          src="/images/decorations/hibiscus.png"
          alt=""
          className="absolute left-[8%] top-8 w-24 opacity-80 md:w-32"
        />

        {/* Hibiscus bas droit */}
        <img
          src="/images/decorations/hibiscus.png"
          alt=""
          className="absolute bottom-8 right-[8%] w-24 -rotate-12 opacity-80 md:w-32"
        />

        {/* Colibri */}
        <img
          src="/images/decorations/colibri.png"
          alt=""
          className="absolute right-[12%] top-[12%] w-24 opacity-80 md:w-32"
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center">

        {/* TITRE */}
        <header className="mb-8 text-center">

          <p className="text-sm font-bold uppercase tracking-[0.35em] text-pink-300">
            🎡 LA MARTINIQUAISE
          </p>

          <div className="relative mt-2">

            <select
              value={currentSelectValue}
              onChange={(event) => {
                const value = event.target.value;

                if (value === "subs") {
                  window.location.href = "/roues/subs";
                }

                if (value === "fortnite") {
                  window.location.href = "/roues?wheelId=5";
                }

                if (value === "motorfest") {
                  window.location.href = "/roues?wheelId=6";
                }

                if (value === "callofduty") {
                  window.location.href = "/roues?wheelId=7";
                }

                if (value === "questions") {
                  window.location.href = "/roues?wheelId=1";
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

              <option value="fortnite">
                🎮 Fortnite
              </option>

              <option value="motorfest">
                🏎️ The Crew Motorfest
              </option>

              <option value="callofduty">
                🔫 Call of Duty
              </option>
            </select>

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-pink-300">
              ▼
            </span>

          </div>

          <p className="mt-3 text-gray-400">
            Appuie sur le bouton pour faire tourner la roue
          </p>

        </header>

        {/* ROUE */}
        <div className="relative flex items-center justify-center">

          {/* CONTOUR ROSE DÉGRADÉ */}
          <div
            className="rounded-full p-[7px] shadow-[0_0_45px_rgba(236,72,153,0.25)]"
            style={{
              background:
                "linear-gradient(135deg, #ec4899, #f472b6, #c084fc, #ec4899)",
            }}
          >

            {/* ROUE */}
            <div
              className="relative aspect-square w-[min(82vw,650px)] overflow-hidden rounded-full border-4 border-white/20 shadow-2xl"
              style={{
                background: wheelBackground,
                transform: `rotate(${rotation}deg)`,
                transition: spinning
                  ? "transform 5.2s cubic-bezier(0.12, 0.72, 0.16, 1)"
                  : "none",
              }}
            >

              {/* TEXTES */}
              {items.map((item, index) => {
                const angle =
                  index * segmentAngle +
                  segmentAngle / 2;

                return (
                  <div
                    key={item.id}
                    className="absolute left-1/2 top-1/2 h-1/2 w-[42%] origin-bottom"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                    }}
                  >
                    <div
                      className="absolute left-1/2 top-[12%] -translate-x-1/2 text-center text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] md:text-2xl"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>
                );
              })}

              {/* CENTRE */}
              <div className="absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/40 bg-[#09090f] text-3xl shadow-2xl md:h-24 md:w-24">
                🎡
              </div>

            </div>
          </div>

          {/* POINTEUR */}
          <div className="absolute left-1/2 top-[-18px] z-30 -translate-x-1/2 md:top-[-22px]">
            <div
              className="h-0 w-0 border-x-[18px] border-t-[32px] border-x-transparent border-t-white drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] md:border-x-[22px] md:border-t-[40px]"
            />
          </div>

        </div>

        {/* BOUTON */}
        <button
          type="button"
          onClick={spinWheel}
          disabled={spinning}
          className="mt-10 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 px-12 py-4 text-xl font-black text-white shadow-[0_0_35px_rgba(236,72,153,0.25)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {spinning
            ? "🎡 LA ROUE TOURNE..."
            : "🎡 TOURNER"}
        </button>

        {/* RESULTAT */}
        {result && !spinning && (
          <div className="mt-8 w-full max-w-2xl rounded-3xl border border-pink-500/30 bg-pink-500/10 p-6 text-center shadow-[0_0_35px_rgba(236,72,153,0.12)]">

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-300">
              🎯 Résultat
            </p>

            <p className="mt-3 text-xl font-black md:text-2xl">
              {result}
            </p>

            <button
              type="button"
              onClick={removeResultFromWheel}
              className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 font-bold text-red-300 transition hover:bg-red-500/20"
            >
              🗑️ Retirer cette question de la roue
            </button>

          </div>
        )}

      </div>
    </main>
  );
}