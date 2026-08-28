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

async function saveGames(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!isValidSession(token)) {
    redirect("/admin");
  }

  const gameIds = [
    Number(formData.get("gameId1")),
    Number(formData.get("gameId2")),
    Number(formData.get("gameId3")),
    Number(formData.get("gameId4")),
  ];

  const titles = [
    String(formData.get("title1") || "").trim(),
    String(formData.get("title2") || "").trim(),
    String(formData.get("title3") || "").trim(),
    String(formData.get("title4") || "").trim(),
  ];

  const types = [
    String(formData.get("type1") || "").trim(),
    String(formData.get("type2") || "").trim(),
    String(formData.get("type3") || "").trim(),
    String(formData.get("type4") || "").trim(),
  ];

  const images = [
    String(formData.get("image1") || "").trim(),
    String(formData.get("image2") || "").trim(),
    String(formData.get("image3") || "").trim(),
    String(formData.get("image4") || "").trim(),
  ];

  const active = [
    formData.get("active1") === "on",
    formData.get("active2") === "on",
    formData.get("active3") === "on",
    formData.get("active4") === "on",
  ];

  const honourId = Number(formData.get("jeuHonneur"));

  if (
    gameIds.some((id) => !Number.isFinite(id)) ||
    titles.some((title) => !title) ||
    types.some((type) => !type) ||
    images.some((image) => !image) ||
    !Number.isFinite(honourId)
  ) {
    redirect("/admin/jeux?error=1");
  }

  try {
    for (let i = 0; i < gameIds.length; i++) {
      await sql`
        UPDATE jeux
        SET
          title = ${titles[i]},
          type = ${types[i]},
          image_url = ${images[i]},
          active = ${active[i]},
          updated_at = NOW()
        WHERE id = ${gameIds[i]}
      `;
    }

    await sql`
      INSERT INTO jeu_honneur (id, jeu_id, updated_at)
      VALUES (1, ${honourId}, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        jeu_id = EXCLUDED.jeu_id,
        updated_at = NOW()
    `;

    revalidatePath("/");
    revalidatePath("/admin/jeux");
  } catch (error) {
    console.error("Erreur sauvegarde jeux :", error);
    redirect("/admin/jeux?error=1");
  }

  redirect("/admin/jeux?saved=1");
}

export default async function JeuxPage({
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

  const games = await sql`
    SELECT
      id,
      title,
      image_url,
      type,
      active,
      sort_order
    FROM jeux
    ORDER BY sort_order ASC
  `;

  const honourResult = await sql`
    SELECT jeu_id
    FROM jeu_honneur
    WHERE id = 1
    LIMIT 1
  `;

  const honourId = honourResult[0]?.jeu_id ?? games[0]?.id;

  if (!games.length) {
    return (
      <main className="min-h-screen bg-[#050509] px-4 py-8 text-white md:px-8">
        <div className="mx-auto max-w-4xl">

          <a
            href="/admin"
            className="text-sm font-semibold text-pink-300 transition hover:text-pink-200"
          >
            ← Retour au tableau de bord
          </a>

          <div className="mt-8 rounded-3xl border border-purple-500/30 bg-white/[0.03] p-8 text-center">
            <p className="text-4xl">🎮</p>

            <h1 className="mt-4 text-2xl font-black">
              Aucun jeu configuré
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              Aucun jeu n'est encore enregistré dans Neon.
            </p>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050509] px-4 py-8 text-white md:px-8">

      <div className="mx-auto max-w-5xl">

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
              🎮 Jeux
            </h1>

            <p className="mt-3 text-gray-400">
              Gère les jeux disponibles et choisis le jeu à l'honneur.
            </p>

          </div>
        </header>

        {/* MESSAGES */}
        {params.saved === "1" && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 font-semibold text-green-300">
            ✅ Les jeux ont été enregistrés !
          </div>
        )}

        {params.error === "1" && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 font-semibold text-red-300">
            ❌ Une erreur est survenue lors de l'enregistrement.
          </div>
        )}

        <form action={saveGames} className="space-y-6">

          {/* JEUX */}
          {games.map((game, index) => (
            <section
              key={game.id}
              className="rounded-3xl border border-purple-500/30 bg-white/[0.03] p-6"
            >

              <input
                type="hidden"
                name={`gameId${index + 1}`}
                value={game.id}
              />

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/10 text-sm font-black text-pink-300">
                    0{index + 1}
                  </span>

                  <h2 className="text-xl font-black">
                    {game.title}
                  </h2>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-300">
                  <input
                    type="checkbox"
                    name={`active${index + 1}`}
                    defaultChecked={game.active}
                    className="h-4 w-4 accent-pink-500"
                  />
                  Actif
                </label>

              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {/* TITRE */}
                <div>
                  <label
                    htmlFor={`title${index + 1}`}
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
                  >
                    Nom du jeu
                  </label>

                  <input
                    id={`title${index + 1}`}
                    name={`title${index + 1}`}
                    type="text"
                    defaultValue={game.title}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-pink-400/60"
                  />
                </div>

                {/* TYPE */}
                <div>
                  <label
                    htmlFor={`type${index + 1}`}
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
                  >
                    Type
                  </label>

                  <input
                    id={`type${index + 1}`}
                    name={`type${index + 1}`}
                    type="text"
                    defaultValue={game.type}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-pink-400/60"
                  />
                </div>

              </div>

              {/* IMAGE */}
              <div className="mt-5">

                <label
                  htmlFor={`image${index + 1}`}
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
                >
                  🖼️ Image
                </label>

                <input
                  id={`image${index + 1}`}
                  name={`image${index + 1}`}
                  type="text"
                  defaultValue={game.image_url}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-pink-400/60"
                />

                <div className="mt-4 flex justify-center rounded-2xl border border-white/10 bg-black/20 p-4">
                  <img
                    src={game.image_url}
                    alt={game.title}
                    className="h-32 w-32 object-contain"
                  />
                </div>

              </div>

            </section>
          ))}

          {/* JEU À L'HONNEUR */}
          <section className="rounded-3xl border border-yellow-500/30 bg-yellow-500/[0.03] p-6">

            <div className="flex items-center gap-3">

              <span className="text-3xl">
                ⭐
              </span>

              <div>
                <h2 className="text-xl font-black">
                  Jeu à l'honneur
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Choisis le jeu mis en avant sur l'accueil.
                </p>
              </div>

            </div>

            <select
              name="jeuHonneur"
              defaultValue={honourId}
              className="mt-6 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-yellow-400/60"
            >
              {games.map((game) => (
                <option
                  key={game.id}
                  value={game.id}
                  className="bg-[#09090f]"
                >
                  {game.title}
                </option>
              ))}
            </select>

          </section>

          {/* ENREGISTRER */}
          <div className="flex justify-end pt-2">

            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-7 py-3 font-black text-white transition hover:scale-[1.02]"
            >
              💾 Enregistrer les jeux
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}