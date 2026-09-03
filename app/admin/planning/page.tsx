import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import PlanningForm from "./PlanningForm";

import { sql } from "@/lib/db";

const COOKIE_NAME = "admin_session";

function isValidSession(token: string | undefined) {
  if (!token) return false;

  const secret = process.env.ADMIN_PASSWORD;

  if (!secret) return false;

  const parts = token.split(".");

  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const timestampNumber = Number(timestamp);

  if (!Number.isFinite(timestampNumber)) return false;

  const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

  if (Date.now() - timestampNumber > SESSION_DURATION) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`la-martiniquaise-admin:${timestamp}`)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

function createGameData(gameName: string) {
  const game = gameName.trim();

  if (!game) return null;

  const games: Record<string, object> = {
    Fortnite: {
      name: "Fortnite",
      image: "/images/games/fortnite.png",
    },

    Motorfest: {
      name: "Motorfest",
      image: "/images/games/motorfest.png",
    },

    Roblox: {
      name: "Roblox",
      image: "/images/games/roblox.png",
    },

    "Call of Duty": {
      name: "Call of Duty",
      image: "/images/games/call-of-duty.png",
    },

        Cuisine: {
      name: "Cuisine",
      image: "/images/games/cuisine.png",
    },

    Jeux: {
      name: "Jeux",
      emoji: "🎮",
    },

    "À voir": {
      name: "À voir",
      emoji: "❓",
    },
  };

  return (
    games[game] ?? {
      name: game,
      emoji: "🎮",
    }
  );
}

async function savePlanning(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!isValidSession(token)) {
    redirect("/admin");
  }

  const planningJson = formData.get("planning");

  if (typeof planningJson !== "string") {
    redirect("/admin/planning?error=1");
  }

  try {
    const planning = JSON.parse(planningJson);

    if (!Array.isArray(planning)) {
      throw new Error("Planning invalide");
    }

    for (const item of planning) {
      const id = Number(item.id);
      const day = String(item.day || "").trim();
      const sessionTime = String(item.sessionTime || "").trim();
      const gamesText = String(item.games || "");

      const games = gamesText
        .split(",")
        .map((game: string) => createGameData(game))
        .filter(Boolean);

      if (!Number.isFinite(id) || !day) {
        throw new Error("Données du planning invalides");
      }

      await sql`
        UPDATE planning
        SET
          day = ${day},
          session_time = ${sessionTime},
          games = ${JSON.stringify(games)}::jsonb,
          updated_at = NOW()
        WHERE id = ${id}
      `;
    }

    revalidatePath("/");
    revalidatePath("/admin/planning");

  } catch (error) {
    console.error("Erreur sauvegarde planning :", error);
    redirect("/admin/planning?error=1");
  }

  redirect("/admin/planning?saved=1");
}

export default async function PlanningAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!isValidSession(token)) {
    redirect("/admin");
  }

  const params = await searchParams;

  const planning = await sql`
    SELECT
      id,
      day,
      session_time,
      games,
      sort_order
    FROM planning
    ORDER BY sort_order ASC
  `;

  return (
    <main className="min-h-screen bg-[#050509] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-8">
          <a
            href="/admin"
            className="text-sm font-semibold text-pink-300 transition hover:text-pink-200"
          >
            ← Retour au tableau de bord
          </a>

          <div className="mt-5">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-pink-300">
              🔐 Administration
            </p>

            <h1 className="mt-2 text-3xl font-black md:text-5xl">
              📅 Gestion du planning
            </h1>

            <p className="mt-3 text-gray-400">
              Modifie ton planning directement depuis ton espace privé.
            </p>
          </div>
        </header>

        {/* MESSAGES */}
        {params.saved === "1" && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 font-semibold text-green-300">
            ✅ Planning enregistré avec succès !
          </div>
        )}

        {params.error === "1" && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 font-semibold text-red-300">
            ❌ Une erreur est survenue pendant l'enregistrement.
          </div>
        )}

        {/* FORMULAIRE */}
        <PlanningForm
  planning={planning.map((item) => ({
    id: item.id,
    day: item.day,
    sessionTime: item.session_time,
    games: Array.isArray(item.games) ? item.games : [],
  }))}
  savePlanning={savePlanning}
/>

      </div>
    </main>
  );
}