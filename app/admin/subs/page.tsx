import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

  if (Date.now() - timestampNumber > 7 * 24 * 60 * 60 * 1000) {
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

async function saveSubsGoal(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!isValidSession(token)) {
    redirect("/admin");
  }

  const id = Number(formData.get("id"));
  const month = String(formData.get("month") || "").trim();

  const level5 = String(formData.get("level5") || "").trim();
  const level10 = String(formData.get("level10") || "").trim();
  const level15 = String(formData.get("level15") || "").trim();
  const level20 = String(formData.get("level20") || "").trim();
  const level25 = String(formData.get("level25") || "").trim();
  const level30 = String(formData.get("level30") || "").trim();

  if (!Number.isFinite(id) || !month) {
    redirect("/admin/subs?error=1");
  }

  try {
    await sql`
      UPDATE subs_goal
      SET
        month = ${month},
        level_5 = ${level5},
        level_10 = ${level10},
        level_15 = ${level15},
        level_20 = ${level20},
        level_25 = ${level25},
        level_30 = ${level30},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    revalidatePath("/");
    revalidatePath("/admin/subs");
  } catch (error) {
    console.error("Erreur sauvegarde Sub Goal :", error);
    redirect("/admin/subs?error=1");
  }

  redirect("/admin/subs?saved=1");
}

export default async function SubsAdminPage({
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

  const result = await sql`
    SELECT
      id,
      month,
      level_5,
      level_10,
      level_15,
      level_20,
      level_25,
      level_30
    FROM subs_goal
    ORDER BY id DESC
    LIMIT 1
  `;

  const goal = result[0];

  if (!goal) {
    return (
      <main className="min-h-screen bg-[#050509] px-4 py-8 text-white md:px-8">
        <div className="mx-auto max-w-4xl">
          <a
            href="/admin"
            className="text-sm font-semibold text-pink-300"
          >
            ← Retour au tableau de bord
          </a>

          <div className="mt-8 rounded-3xl border border-purple-500/30 bg-white/[0.03] p-8 text-center">
            <p className="text-4xl">💜</p>

            <h1 className="mt-4 text-2xl font-black">
              Aucun Sub Goal configuré
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              Crée d'abord un mois dans la base de données.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050509] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-4xl">

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
              💜 Paliers Subs
            </h1>

            <p className="mt-3 text-gray-400">
              Configure les 6 paliers de ton Sub Goal.
            </p>
          </div>
        </header>

        {/* MESSAGES */}
        {params.saved === "1" && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 font-semibold text-green-300">
            ✅ Les 6 paliers ont été enregistrés !
          </div>
        )}

        {params.error === "1" && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 font-semibold text-red-300">
            ❌ Une erreur est survenue lors de l'enregistrement.
          </div>
        )}

        {/* FORMULAIRE */}
        <form action={saveSubsGoal} className="space-y-5">

          {/* MOIS */}
          <div className="rounded-3xl border border-purple-500/30 bg-white/[0.03] p-6">
            <label
              htmlFor="month"
              className="mb-2 block text-sm font-bold uppercase tracking-wider text-gray-400"
            >
              Mois du Sub Goal
            </label>

            <input
              id="month"
              name="month"
              type="text"
              defaultValue={goal.month}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-pink-400/60"
            />
          </div>

          <input
            type="hidden"
            name="id"
            value={goal.id}
          />

          {/* 5 SUBS */}
          <RewardInput
            level={5}
            name="level5"
            value={goal.level_5}
          />

          {/* 10 SUBS */}
          <RewardInput
            level={10}
            name="level10"
            value={goal.level_10}
          />

          {/* 15 SUBS */}
          <RewardInput
            level={15}
            name="level15"
            value={goal.level_15}
          />

          {/* 20 SUBS */}
          <RewardInput
            level={20}
            name="level20"
            value={goal.level_20}
          />

          {/* 25 SUBS */}
          <RewardInput
            level={25}
            name="level25"
            value={goal.level_25}
          />

          {/* 30 SUBS */}
          <RewardInput
            level={30}
            name="level30"
            value={goal.level_30}
          />

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-7 py-3 font-black text-white shadow-[0_0_25px_rgba(236,72,153,0.15)] transition hover:scale-[1.02]"
            >
              💾 Enregistrer les 6 paliers
            </button>
          </div>
        </form>

      </div>
    </main>
  );
}

function RewardInput({
  level,
  name,
  value,
}: {
  level: number;
  name: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-purple-500/30 bg-white/[0.03] p-6">
      <label
        htmlFor={name}
        className="mb-3 flex items-center gap-3"
      >
        <span className="text-2xl font-black text-purple-300">
          {level}
        </span>

        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Subs
        </span>
      </label>

      <input
        id={name}
        name={name}
        type="text"
        defaultValue={value}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-pink-400/60"
      />
    </div>
  );
}