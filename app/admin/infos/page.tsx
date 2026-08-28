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

async function saveInfos(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!isValidSession(token)) {
    redirect("/admin");
  }

  const infos = [
    {
      id: Number(formData.get("id1")),
      emoji: String(formData.get("emoji1") || "🔥"),
      title: String(formData.get("title1") || ""),
      text: String(formData.get("text1") || ""),
      imageUrl: String(formData.get("imageUrl1") || "").trim(),
    },
    {
      id: Number(formData.get("id2")),
      emoji: String(formData.get("emoji2") || "🎮"),
      title: String(formData.get("title2") || ""),
      text: String(formData.get("text2") || ""),
      imageUrl: "",
    },
    {
      id: Number(formData.get("id3")),
      emoji: String(formData.get("emoji3") || "💜"),
      title: String(formData.get("title3") || ""),
      text: String(formData.get("text3") || ""),
      imageUrl: "",
    },
    {
      id: Number(formData.get("id4")),
      emoji: String(formData.get("emoji4") || "📌"),
      title: String(formData.get("title4") || ""),
      text: String(formData.get("text4") || ""),
      imageUrl: "",
    },
  ];

  try {
    for (const info of infos) {
      if (
        !Number.isFinite(info.id) ||
        !info.title.trim() ||
        !info.text.trim()
      ) {
        redirect("/admin/infos?error=1");
      }

      await sql`
        UPDATE infos
        SET
          emoji = ${info.emoji},
          title = ${info.title.trim()},
          text = ${info.text.trim()},
          image_url = ${info.imageUrl || null},
          updated_at = NOW()
        WHERE id = ${info.id}
      `;
    }

    revalidatePath("/");
    revalidatePath("/admin/infos");

  } catch (error) {
    console.error("Erreur sauvegarde infos :", error);
    redirect("/admin/infos?error=1");
  }

  redirect("/admin/infos?saved=1");
}

export default async function InfosPage({
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
      emoji,
      title,
      text,
      image_url,
      sort_order
    FROM infos
    ORDER BY sort_order ASC
  `;

  return (
    <main className="min-h-screen bg-[#050509] px-4 py-8 text-white md:px-8">

      <div className="mx-auto max-w-5xl">

        {/* RETOUR */}
        <a
          href="/admin"
          className="text-sm font-semibold text-pink-300 transition hover:text-pink-200"
        >
          ← Retour au tableau de bord
        </a>

        {/* HEADER */}
        <header className="mb-8 mt-5">

          <p className="text-sm font-bold uppercase tracking-[0.3em] text-pink-300">
            🔐 Administration
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-5xl">
            📢 Infos du moment
          </h1>

          <p className="mt-3 text-gray-400">
            Gère les informations affichées dans la section 05 de l'accueil.
          </p>

        </header>

        {/* MESSAGES */}
        {params.saved === "1" && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 font-semibold text-green-300">
            ✅ Les informations ont été enregistrées !
          </div>
        )}

        {params.error === "1" && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 font-semibold text-red-300">
            ❌ Une erreur est survenue lors de l'enregistrement.
          </div>
        )}

        <form action={saveInfos} className="space-y-6">

          {result.map((info, index) => (
            <section
              key={info.id}
              className="rounded-3xl border border-purple-500/30 bg-white/[0.03] p-6"
            >

              <input
                type="hidden"
                name={`id${index + 1}`}
                value={info.id}
              />

              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/10 text-sm font-black text-pink-300">
                  0{index + 1}
                </span>

                <h2 className="text-xl font-black">
                  {info.title}
                </h2>
              </div>

              {/* EMOJI + TITRE */}
              <div className="mt-6 grid gap-4 sm:grid-cols-[120px_1fr]">

                <div>
                  <label
                    htmlFor={`emoji${index + 1}`}
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
                  >
                    Emoji
                  </label>

                  <input
                    id={`emoji${index + 1}`}
                    name={`emoji${index + 1}`}
                    type="text"
                    defaultValue={info.emoji}
                    maxLength={8}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center text-2xl text-white outline-none focus:border-pink-400/60"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`title${index + 1}`}
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
                  >
                    Titre
                  </label>

                  <input
                    id={`title${index + 1}`}
                    name={`title${index + 1}`}
                    type="text"
                    defaultValue={info.title}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-pink-400/60"
                  />
                </div>

              </div>

              {/* TEXTE */}
              <div className="mt-4">

                <label
                  htmlFor={`text${index + 1}`}
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
                >
                  Texte
                </label>

                <textarea
                  id={`text${index + 1}`}
                  name={`text${index + 1}`}
                  defaultValue={info.text}
                  rows={4}
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-relaxed text-white outline-none focus:border-pink-400/60"
                />

              </div>

              {/* IMAGE UNIQUEMENT POUR ÉVÉNEMENT */}
              {index === 0 && (
                <div className="mt-4">

                  <label
                    htmlFor="imageUrl1"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400"
                  >
                    📷 Image de l'événement
                  </label>

                  <input
                    id="imageUrl1"
                    name="imageUrl1"
                    type="text"
                    defaultValue={info.image_url || ""}
                    placeholder="/images/evenements/mon-evenement.png"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-pink-400/60"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Facultatif. Indique le chemin de l'image située dans le dossier public.
                  </p>

                  {info.image_url && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-3">
                      <img
                        src={info.image_url}
                        alt={info.title}
                        className="max-h-48 w-full object-contain"
                      />
                    </div>
                  )}

                </div>
              )}

            </section>
          ))}

          {/* ENREGISTRER */}
          <div className="flex justify-end pt-2">

            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-7 py-3 font-black text-white transition hover:scale-[1.02]"
            >
              💾 Enregistrer les informations
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}