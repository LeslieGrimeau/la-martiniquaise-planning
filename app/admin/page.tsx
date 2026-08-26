import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

const COOKIE_NAME = "admin_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

function createSessionToken() {
  const secret = process.env.ADMIN_PASSWORD;

  if (!secret) {
    throw new Error("ADMIN_PASSWORD n'est pas configuré.");
  }

  const timestamp = Date.now().toString();

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`la-martiniquaise-admin:${timestamp}`)
    .digest("hex");

  return `${timestamp}.${signature}`;
}

function isValidSession(token: string | undefined) {
  if (!token) return false;

  const secret = process.env.ADMIN_PASSWORD;

  if (!secret) return false;

  const parts = token.split(".");

  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const timestampNumber = Number(timestamp);

  if (!Number.isFinite(timestampNumber)) return false;

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

async function login(formData: FormData) {
  "use server";

  const password = formData.get("password");

  if (
    typeof password !== "string" ||
    !process.env.ADMIN_PASSWORD ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    redirect("/admin?error=1");
  }

  const token = createSessionToken();

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 7 * 24 * 60 * 60,
  });

  redirect("/admin");
}

async function logout() {
  "use server";

  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);

  redirect("/admin");
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  const authenticated = isValidSession(token);
  const params = await searchParams;

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050509] px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-purple-500/30 bg-white/[0.03] p-8 shadow-[0_0_50px_rgba(168,85,247,0.12)]">

          <div className="text-center">
            <div className="text-5xl">🔐</div>

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-pink-300">
              Espace privé
            </p>

            <h1 className="mt-2 text-3xl font-black">
              La Martiniquaise
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              Entre ton mot de passe pour accéder au tableau de bord.
            </p>
          </div>

          <form action={login} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-300"
              >
                Mot de passe
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-pink-400/60"
                placeholder="Ton mot de passe"
              />
            </div>

            {params.error === "1" && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-300">
                ❌ Mot de passe incorrect.
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 font-black text-white transition hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(236,72,153,0.2)]"
            >
              🔓 Se connecter
            </button>
          </form>

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
  {/* Palmier gauche */}
  <img
    src="/images/decorations/palmier.png"
    alt=""
    className="absolute -left-20 top-24 w-56 opacity-50 md:-left-10 md:w-72"
  />

  {/* Palmier droit */}
  <img
    src="/images/decorations/palmier.png"
    alt=""
    className="absolute -right-20 bottom-10 w-56 -scale-x-100 opacity-50 md:-right-10 md:w-72"
  />

  {/* Hibiscus */}
  <img
    src="/images/decorations/hibiscus.png"
    alt=""
    className="absolute left-[10%] top-8 w-24 opacity-60 md:w-32"
  />

  <img
    src="/images/decorations/hibiscus.png"
    alt=""
    className="absolute bottom-10 right-[10%] w-24 -rotate-12 opacity-60 md:w-32"
  />

  {/* Colibri */}
  <img
    src="/images/decorations/colibri.png"
    alt=""
    className="absolute right-[15%] top-[10%] w-24 opacity-60 md:w-32"
  />
</div>
      <div className="relative z-10 mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-10 flex flex-col gap-5 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-pink-300">
              🔐 Espace privé
            </p>

            <h1 className="mt-2 text-3xl font-black md:text-5xl">
              Tableau de bord
            </h1>

            <p className="mt-3 text-gray-400">
              Bienvenue dans ton espace de gestion.
            </p>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2 text-sm font-bold text-red-300 transition hover:border-red-400/60 hover:bg-red-500/20 hover:text-white"
            >
              🚪 Déconnexion
            </button>
          </form>
        </header>

        {/* MENU ADMIN */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <a
  href="/admin/planning"
  className="group block rounded-3xl border border-purple-500/30 bg-white/[0.03] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-pink-400/60 hover:bg-purple-500/10"
>
  <div className="flex items-center gap-4">
    <span className="text-4xl">
      📅
    </span>

    <div>
      <h2 className="text-lg font-black text-white">
        Planning
      </h2>

      <p className="mt-1 text-sm leading-relaxed text-gray-400">
        Gérer les jours, horaires et jeux.
      </p>
    </div>
  </div>
</a>

          <a
  href="/admin/subs"
  className="group block rounded-3xl border border-purple-500/30 bg-white/[0.03] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-pink-400/60 hover:bg-purple-500/10"
>
  <div className="flex items-center gap-4">
    <span className="text-4xl">
      💜
    </span>

    <div>
      <h2 className="text-lg font-black text-white">
        Paliers Subs
      </h2>

      <p className="mt-1 text-sm leading-relaxed text-gray-400">
        Modifier les paliers et récompenses.
      </p>
    </div>
  </div>
</a>

          <a
  href="/admin/objectifs"
  className="group block rounded-3xl border border-purple-500/30 bg-white/[0.03] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-pink-400/60 hover:bg-purple-500/10"
>
  <div className="flex items-center gap-4">
    <span className="text-4xl">
      🏆
    </span>

    <div>
      <h2 className="text-lg font-black text-white">
        Objectifs
      </h2>

      <p className="mt-1 text-sm leading-relaxed text-gray-400">
        Gérer les objectifs et leur progression.
      </p>
    </div>
  </div>
</a>

          <AdminCard
            emoji="🎮"
            title="Jeux"
            text="Gérer les jeux et le jeu à l'honneur."
          />

          <AdminCard
            emoji="📢"
            title="Infos du moment"
            text="Modifier les informations affichées."
          />

          <AdminCard
            emoji="🎧"
            title="Communauté"
            text="Gérer les règles et le Discord."
          />

          <a
  href="/admin/roues"
  className="group block rounded-3xl border border-purple-500/30 bg-white/[0.03] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-pink-400/60 hover:bg-purple-500/10"
>
  <div className="flex items-center gap-4">
    <span className="text-4xl">
      🎡
    </span>

    <div>
      <h2 className="text-lg font-black text-white">
        Roues
      </h2>

      <p className="mt-1 text-sm leading-relaxed text-gray-400">
        Créer et gérer tes roues de défis.
      </p>
    </div>
  </div>
</a>

        </div>
      </div>
      {/* 🌺 ACCÈS RAPIDE AUX ROUES */}
<a
  href="/roues"
  aria-label="Ouvrir les roues du live"
  className="group fixed bottom-6 left-6 z-[9999]"
>
  <div className="relative">

    {/* Halo rose */}
    <div className="absolute inset-2 rounded-full bg-pink-500/30 blur-2xl transition-all duration-300 group-hover:bg-pink-500/60" />

    {/* Hibiscus */}
    <img
      src="/images/decorations/hibiscus.png"
      alt="Roues du live"
      className="relative block h-auto w-32 object-contain drop-shadow-[0_0_18px_rgba(236,72,153,0.7)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 md:w-40"
    />

    {/* Indication au survol */}
    <span className="absolute bottom-0 left-1/2 translate-y-full -translate-x-1/2 whitespace-nowrap rounded-full border border-pink-500/40 bg-[#09090f] px-3 py-1.5 text-xs font-bold text-pink-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      🎡 Roues du live
    </span>

  </div>
</a>
{/* ☀️ RETOUR À L'ACCUEIL */}
<a
  href="/"
  aria-label="Retour à l'accueil"
  className="group fixed right-4 top-4 z-[9999] md:right-8 md:top-6"
>
  <div className="relative">

    {/* Halo lumineux */}
    <div className="absolute inset-2 rounded-full bg-yellow-400/20 blur-2xl transition-all duration-300 group-hover:bg-yellow-400/40" />

    {/* Soleil */}
    <img
      src="/images/decorations/soleil.png"
      alt="Accueil"
      className="relative block w-28 object-contain drop-shadow-[0_0_18px_rgba(250,204,21,0.55)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 md:w-36"
    />

    {/* Texte au survol */}
    <span className="absolute right-0 top-full mt-1 whitespace-nowrap rounded-full border border-yellow-400/30 bg-[#09090f]/95 px-3 py-1.5 text-xs font-bold text-yellow-300 opacity-0 shadow-xl transition-opacity duration-300 group-hover:opacity-100">
      🏠 Retour à l'accueil
    </span>

  </div>
</a>
    </main>
  );
}

function AdminCard({
  emoji,
  title,
  text,
  href,
}: {
  emoji: string;
  title: string;
  text: string;
  href?: string;
}) {
  return (
    <button
      type="button"
      className="group rounded-3xl border border-purple-500/30 bg-white/[0.03] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-pink-400/60 hover:bg-purple-500/10"
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
          {emoji}
        </span>

        <div>
          <h2 className="text-lg font-black text-white">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-relaxed text-gray-400">
            {text}
          </p>
        </div>
      </div>
    </button>
  );
}