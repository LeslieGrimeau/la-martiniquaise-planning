export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#050509] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-pink-300">
            🔐 Espace privé
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-5xl">
            La Martiniquaise
          </h1>

          <p className="mt-3 text-gray-400">
            Tableau de bord
          </p>
        </header>

        {/* MENU ADMIN */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <AdminCard
            emoji="📅"
            title="Planning"
            text="Gérer les jours, horaires et jeux."
          />

          <AdminCard
            emoji="💜"
            title="Paliers Subs"
            text="Modifier les paliers et récompenses."
          />

          <AdminCard
            emoji="🏆"
            title="Objectifs"
            text="Gérer les objectifs du mois."
          />

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

          <AdminCard
            emoji="🎡"
            title="Roues"
            text="Créer et gérer tes roues de défis."
          />

        </div>

      </div>
    </main>
  );
}

function AdminCard({
  emoji,
  title,
  text,
}: {
  emoji: string;
  title: string;
  text: string;
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