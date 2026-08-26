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

async function saveObjectives(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!isValidSession(token)) {
    redirect("/admin");
  }

  const id = Number(formData.get("id"));

  const subsTarget = Number(formData.get("subsTarget"));
  const subsCurrent = Number(formData.get("subsCurrent"));

  const followersTarget = Number(formData.get("followersTarget"));
  const followersCurrent = Number(formData.get("followersCurrent"));

  const viewersTarget = Number(formData.get("viewersTarget"));
  const viewersCurrent = Number(formData.get("viewersCurrent"));

  if (
    !Number.isFinite(id) ||
    !Number.isFinite(subsTarget) ||
    !Number.isFinite(subsCurrent) ||
    !Number.isFinite(followersTarget) ||
    !Number.isFinite(followersCurrent) ||
    !Number.isFinite(viewersTarget) ||
    !Number.isFinite(viewersCurrent)
  ) {
    redirect("/admin/objectifs?error=1");
  }

  try {
    await sql`
      UPDATE objectifs
      SET
        subs_target = ${Math.max(0, subsTarget)},
        subs_current = ${Math.max(0, subsCurrent)},
        followers_target = ${Math.max(0, followersTarget)},
        followers_current = ${Math.max(0, followersCurrent)},
        viewers_target = ${Math.max(0, viewersTarget)},
        viewers_current = ${Math.max(0, viewersCurrent)},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    revalidatePath("/");
    revalidatePath("/admin/objectifs");
  } catch (error) {
    console.error("Erreur sauvegarde objectifs :", error);
    redirect("/admin/objectifs?error=1");
  }

  redirect("/admin/objectifs?saved=1");
}

function getPercentage(current: number, target: number) {
  if (target <= 0) return 0;

  return Math.min(100, Math.max(0, (current / target) * 100));
}

function formatPercentage(value: number) {
  return Number.isInteger(value)
    ? `${value}%`
    : `${value.toFixed(1).replace(".", ",")}%`;
}

export default async function ObjectivesPage({
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
      subs_target,
      subs_current,
      followers_target,
      followers_current,
      viewers_target,
      viewers_current
    FROM objectifs
    ORDER BY id DESC
    LIMIT 1
  `;

  const objective = result[0];

  if (!objective) {
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
            <p className="text-4xl">🏆</p>

            <h1 className="mt-4 text-2xl font-black">
              Aucun objectif configuré
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              Aucun objectif n'est encore enregistré dans Neon.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const subsPercentage = getPercentage(
    Number(objective.subs_current),
    Number(objective.subs_target)
  );

  const followersPercentage = getPercentage(
    Number(objective.followers_current),
    Number(objective.followers_target)
  );

  const viewersPercentage = getPercentage(
    Number(objective.viewers_current),
    Number(objective.viewers_target)
  );

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
              🏆 Objectifs
            </h1>

            <p className="mt-3 text-gray-400">
              Modifie les objectifs et leur progression.
            </p>
          </div>
        </header>

        {/* MESSAGES */}
        {params.saved === "1" && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 font-semibold text-green-300">
            ✅ Les objectifs ont été enregistrés !
          </div>
        )}

        {params.error === "1" && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 font-semibold text-red-300">
            ❌ Une erreur est survenue lors de l'enregistrement.
          </div>
        )}

        <form action={saveObjectives} className="space-y-6">

          <input
            type="hidden"
            name="id"
            value={objective.id}
          />

          <ObjectiveCard
            emoji="💜"
            title="Abonnés Twitch"
            currentName="subsCurrent"
            targetName="subsTarget"
            current={Number(objective.subs_current)}
            target={Number(objective.subs_target)}
            percentage={subsPercentage}
          />

          <ObjectiveCard
            emoji="👥"
            title="Followers Twitch"
            currentName="followersCurrent"
            targetName="followersTarget"
            current={Number(objective.followers_current)}
            target={Number(objective.followers_target)}
            percentage={followersPercentage}
          />

          <ObjectiveCard
            emoji="👀"
            title="Moyenne de viewers"
            currentName="viewersCurrent"
            targetName="viewersTarget"
            current={Number(objective.viewers_current)}
            target={Number(objective.viewers_target)}
            percentage={viewersPercentage}
            step="0.1"
          />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-7 py-3 font-black text-white transition hover:scale-[1.02]"
            >
              💾 Enregistrer les objectifs
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}

function ObjectiveCard({
  emoji,
  title,
  currentName,
  targetName,
  current,
  target,
  percentage,
  step = "1",
}: {
  emoji: string;
  title: string;
  currentName: string;
  targetName: string;
  current: number;
  target: number;
  percentage: number;
  step?: string;
}) {
  const percentageId = `${currentName}-percentage`;
  const barId = `${currentName}-bar`;
  const valuesId = `${currentName}-values`;

  return (
    <section className="rounded-3xl border border-purple-500/30 bg-white/[0.03] p-6">

      <div className="flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>

        <h2 className="text-xl font-black">
          {title}
        </h2>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">

        <div>
          <label
            htmlFor={currentName}
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
          >
            Actuel
          </label>

          <input
            id={currentName}
            name={currentName}
            type="number"
            min="0"
            step={step}
            defaultValue={current}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-pink-400/60"
          />
        </div>

        <div>
          <label
            htmlFor={targetName}
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
          >
            Objectif
          </label>

          <input
            id={targetName}
            name={targetName}
            type="number"
            min="0"
            step={step}
            defaultValue={target}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-pink-400/60"
          />
        </div>

      </div>

      {/* PROGRESSION */}
      <div className="mt-6">

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-400">
            Progression
          </span>

          <span
            id={percentageId}
            className="text-sm font-black text-pink-300"
          >
            {formatPercentage(percentage)}
          </span>
        </div>

        <div className="h-4 overflow-hidden rounded-full bg-white/10">
          <div
            id={barId}
            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <div
          id={valuesId}
          className="mt-2 text-right text-xs text-gray-500"
        >
          {current} / {target}
        </div>

      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const currentInput = document.getElementById("${currentName}");
              const targetInput = document.getElementById("${targetName}");
              const percentageElement = document.getElementById("${percentageId}");
              const barElement = document.getElementById("${barId}");
              const valuesElement = document.getElementById("${valuesId}");

              if (!currentInput || !targetInput || !percentageElement || !barElement || !valuesElement) {
                return;
              }

              const updateProgress = () => {
                const current = Number(currentInput.value) || 0;
                const target = Number(targetInput.value) || 0;

                let percentage = 0;

                if (target > 0) {
                  percentage = (current / target) * 100;
                }

                percentage = Math.min(100, Math.max(0, percentage));

                const formatted = Number.isInteger(percentage)
                  ? percentage + "%"
                  : percentage.toFixed(1).replace(".", ",") + "%";

                percentageElement.textContent = formatted;
                barElement.style.width = percentage + "%";
                valuesElement.textContent = current + " / " + target;
              };

              currentInput.addEventListener("input", updateProgress);
              targetInput.addEventListener("input", updateProgress);
            })();
          `,
        }}
      />

    </section>
  );
}