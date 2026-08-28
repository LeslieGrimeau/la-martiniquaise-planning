import Image from "next/image";
import { sql } from "@/lib/db";

import {
  lastUpdate,
  communityRules,
} from "./data";

import { getPlanning } from "@/lib/planning";

function getCurrentDay() {
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];

  const franceDate = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Paris",
  });

  return days[new Date(franceDate).getDay()];
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const currentDay = getCurrentDay();
  const weeklySchedule = await getPlanning();

  /* ========================================
     📢 INFOS DU MOMENT
  ======================================== */

  const infosResult = await sql`
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

  const currentInfos = infosResult.map((info) => ({
    emoji: info.emoji,
    title: info.title,
    text: info.text,
    imageUrl: info.image_url,
  }));

  /* ========================================
     🎮 JEUX
  ======================================== */

  const gamesResult = await sql`
    SELECT
      id,
      title,
      image_url,
      type
    FROM jeux
    WHERE active = TRUE
    ORDER BY sort_order ASC
  `;

  const games = gamesResult.map((game) => ({
    title: game.title,
    image: game.image_url,
    type: game.type,
  }));

  /* ========================================
     ⭐ JEU À L'HONNEUR
  ======================================== */

  const mainGameResult = await sql`
    SELECT
      j.title,
      j.image_url
    FROM jeu_honneur jh
    JOIN jeux j ON j.id = jh.jeu_id
    WHERE jh.id = 1
      AND j.active = TRUE
    LIMIT 1
  `;

  const mainGame = mainGameResult[0]
    ? {
        title: mainGameResult[0].title,
        image: mainGameResult[0].image_url,
      }
    : null;

  /* ========================================
     🏆 OBJECTIFS
  ======================================== */

  const objectivesResult = await sql`
    SELECT
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

  const objective = objectivesResult[0];

  function getPercentage(current: number, target: number) {
    if (target <= 0) return 0;

    return Math.min(
      100,
      Math.max(0, (current / target) * 100)
    );
  }

  const monthlyGoals = objective
    ? [
        {
          label: "Abonnés Twitch",
          current: String(objective.subs_current),
          target: String(objective.subs_target),
          progress: getPercentage(
            Number(objective.subs_current),
            Number(objective.subs_target)
          ),
        },
        {
          label: "Followers Twitch",
          current: String(objective.followers_current),
          target: String(objective.followers_target),
          progress: getPercentage(
            Number(objective.followers_current),
            Number(objective.followers_target)
          ),
        },
        {
          label: "Moyenne de viewers",
          current: String(objective.viewers_current),
          target: String(objective.viewers_target),
          progress: getPercentage(
            Number(objective.viewers_current),
            Number(objective.viewers_target)
          ),
        },
      ]
    : [];

    const subsResult = await sql`
  SELECT
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

const subsGoal = subsResult[0];

const subscriberRewards = subsGoal
  ? [
      {
        level: 5,
        reward: subsGoal.level_5,
      },
      {
        level: 10,
        reward: subsGoal.level_10,
      },
      {
        level: 15,
        reward: subsGoal.level_15,
      },
      {
        level: 20,
        reward: subsGoal.level_20,
      },
      {
        level: 25,
        reward: subsGoal.level_25,
      },
      {
        level: 30,
        reward: subsGoal.level_30,
      },
    ]
  : [];

  return (
    <main className="min-h-screen bg-[#050509] text-white">

      {/* 🌴 PALMIER DÉCORATIF */}
      <div className="pointer-events-none fixed bottom-0 left-0 z-0">
        <Image
          src="/images/decorations/palmier.png"
          alt=""
          width={520}
          height={520}
          className="h-auto w-[100px] object-contain opacity-50 sm:w-[140px] md:w-[320px] lg:w-[300px]"
        />
      </div>

      {/* 🌺 HIBISCUS DÉCORATIF */}
      <div className="pointer-events-none fixed bottom-2 right-0 z-0">
        <Image
          src="/images/decorations/hibiscus.png"
          alt=""
          width={320}
          height={320}
          className="h-auto w-[90px] object-contain opacity-60 sm:w-[120px] md:w-[180px] lg:w-[240px]"
        />
      </div>

      {/* HEADER */}
      <header className="relative overflow-hidden px-6 pb-16 pt-10 text-center md:pb-20 md:pt-12">

        {/* 🐦 COLIBRI ANIMÉ */}
        <div className="pointer-events-none absolute left-0 top-28 z-20 w-full overflow-hidden">
          <Image
            src="/images/decorations/colibri.png"
            alt=""
            width={120}
            height={100}
            className="colibri-animation h-auto w-28 object-contain sm:w-32 md:w-40"
          />
        </div>

        {/* Lumières d'ambiance */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute -right-32 -top-20 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-yellow-400/5 blur-3xl" />

        {/* Avatar */}
        <div className="absolute left-3 top-3 z-10 md:left-8 md:top-6">
          <div className="relative">
            <div className="absolute inset-2 rounded-full bg-pink-500/20 blur-xl" />

            <Image
              src="/images/avatar.png"
              alt="La Martiniquaise"
              width={220}
              height={220}
              className="relative h-24 w-24 object-contain sm:h-32 sm:w-32 md:h-56 md:w-56"
              priority
            />
          </div>
        </div>

        {/* Contenu central */}
        <div className="relative mx-auto max-w-4xl px-12 sm:px-20 md:px-32">

          <p className="text-xs font-bold uppercase tracking-[0.35em] text-pink-400 md:text-sm">
            🇲🇶 Gamer • Créole • Passion
          </p>

          <h1 className="mt-4 bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 bg-clip-text text-4xl font-black uppercase tracking-tight text-transparent sm:text-5xl md:text-7xl">
            La Martiniquaise
          </h1>

          <div className="mx-auto mt-5 h-px w-32 bg-gradient-to-r from-transparent via-pink-400 to-transparent" />

          <p className="mt-5 text-lg font-semibold text-pink-200 md:text-2xl">
            Yépa ! Bienvenue dans mon univers Twitch 🌴
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base">
            Retrouvez ici mon planning, mes objectifs, mes jeux du moment
            et toutes les informations pour participer à la vie de la communauté.
          </p>

          {/* Réseaux sociaux */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">

            <a
              href="https://www.twitch.tv/la_martiniquaise_"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-xs font-semibold text-pink-300 transition-all duration-300 hover:scale-105 hover:border-pink-400/60 hover:bg-pink-500/20 hover:text-white"
            >
              🎮 Twitch
            </a>

            <a
              href="https://www.tiktok.com/@la_martiniquaise61"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-300 transition-all duration-300 hover:scale-105 hover:border-purple-400/60 hover:bg-purple-500/20 hover:text-white"
            >
              🎵 TikTok
            </a>

            <a
              href="https://www.instagram.com/la_martiniquaise_/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold text-yellow-300 transition-all duration-300 hover:scale-105 hover:border-yellow-400/60 hover:bg-yellow-500/20 hover:text-white"
            >
              📸 Instagram
            </a>

            <a
              href="https://discord.gg/7PqVKVPEDq"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300 transition-all duration-300 hover:scale-105 hover:border-indigo-400/60 hover:bg-indigo-500/20 hover:text-white"
            >
              💬 Discord
            </a>

          </div>

        </div>

        {/* Décoration basse du header */}
        <div className="absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-pink-500/60 to-transparent" />

      </header>

      {/* CONTENU */}
      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-12 md:px-6">

        {/* 1 — PLANNING */}
        <section className="rounded-3xl border border-pink-500/40 bg-white/[0.03] p-5 shadow-[0_0_40px_rgba(236,72,153,0.08)] md:p-7">

          <SectionTitle
            number="01"
            emoji="📅"
            title="Planning de la semaine"
          />

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">

            {weeklySchedule.map((item) => (
              <DayCard
                key={item.day}
                day={item.day}
                sessions={item.sessions}
                today={item.day === currentDay}
              />
            ))}

          </div>

        </section>

        {/* 2 + 3 */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* 2 — SUBS */}
          <section className="rounded-3xl border border-purple-500/40 bg-white/[0.03] p-5 shadow-[0_0_40px_rgba(168,85,247,0.08)] md:p-7">

            <SectionTitle
              number="02"
              emoji="💜"
              title="Paliers Subs & Récompenses"
            />

            <p className="mt-3 text-sm text-gray-400">
              Plus la communauté grandit, plus les récompenses se débloquent !
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">

              {subscriberRewards.map((item) => (
                <RewardCard
                  key={item.level}
                  level={item.level}
                  reward={item.reward}
                />
              ))}

            </div>

          </section>

          {/* 3 — OBJECTIFS */}
          <section className="rounded-3xl border border-green-500/40 bg-white/[0.03] p-5 shadow-[0_0_40px_rgba(34,197,94,0.08)] md:p-7">

            <SectionTitle
              number="03"
              emoji="🏆"
              title="Objectifs du mois"
            />

            <div className="mt-6 space-y-5">

              {monthlyGoals.map((goal) => (
                <Goal
                  key={goal.label}
                  label={goal.label}
                  current={goal.current}
                  target={goal.target}
                  progress={goal.progress}
                />
              ))}

            </div>

          </section>

        </div>

        {/* 4 + 5 */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* 4 — INFOS JEUX */}
          <section className="rounded-3xl border border-cyan-500/40 bg-white/[0.03] p-5 shadow-[0_0_40px_rgba(6,182,212,0.08)] md:p-7">

            <SectionTitle
              number="04"
              emoji="🎮"
              title="Infos jeux"
            />

            {/* Message communauté */}
            <div className="mt-5 rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-4 text-center">

              <p className="text-sm font-semibold text-cyan-200 md:text-base">
                🎮 Tous ces jeux sont jouables avec la communauté !
              </p>

            </div>

            {/* Jeux */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              {games.map((game) => (
                <GameCard
                  key={game.title}
                  image={game.image}
                  title={game.title}
                  type={game.type}
                />
              ))}

            </div>

            {/* Jeu à l'honneur */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-yellow-400/40 bg-gradient-to-b from-yellow-400/10 to-pink-500/5 p-5 text-center shadow-[0_0_30px_rgba(250,204,21,0.08)]">

              <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                ⭐ Jeu à l'honneur ⭐
              </p>

              {mainGame ? (
                <div className="mt-4 flex flex-col items-center">

                  <Image
                    src={mainGame.image}
                    alt={mainGame.title}
                    width={240}
                    height={140}
                    className="h-28 w-auto object-contain md:h-36"
                  />

                  <p className="mt-2 text-xl font-black text-yellow-300 md:text-2xl">
                    {mainGame.title}
                  </p>

                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  Aucun jeu à l'honneur pour le moment.
                </p>
              )}

            </div>

          </section>

          {/* 5 — INFOS DU MOMENT */}
          <section className="rounded-3xl border border-pink-500/40 bg-white/[0.03] p-4 shadow-[0_0_30px_rgba(236,72,153,0.08)] md:p-5">

            <SectionTitle
              number="05"
              emoji="📢"
              title="Infos du moment"
            />

            {/* Annonces */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">

              {currentInfos.map((info) => (
                <InfoItem
                  key={info.title}
                  emoji={info.emoji}
                  title={info.title}
                  text={info.text}
                  imageUrl={info.imageUrl}
                />
              ))}

            </div>

            {/* Code créateur Fortnite */}
            <div className="mt-4 rounded-2xl border border-yellow-400/40 bg-gradient-to-r from-yellow-400/10 via-pink-500/10 to-purple-500/10 p-4 text-center">

              <p className="text-sm font-black leading-relaxed text-yellow-300 md:text-base">
                😁 Hooo les gars, utilisez mon code créateur FORTNITE dans la boutique sinon je vous ban 😁
              </p>

              <div className="mt-3 flex justify-center">

                <Image
                  src="/images/decorations/code-createur.png"
                  alt="Code créateur Fortnite LILI9724"
                  width={300}
                  height={100}
                  className="h-auto w-[220px] object-contain sm:w-[260px] md:w-[300px]"
                />

              </div>

            </div>

            {/* Mise à jour */}
            <div className="mt-3 text-center">

              <p className="text-[10px] text-gray-500">
                🔄 Dernière mise à jour :{" "}
                <span className="font-semibold text-pink-300">
                  {lastUpdate}
                </span>
              </p>

            </div>

          </section>

        </div>

        {/* 6 — JOUER */}
        <section className="rounded-3xl border border-blue-500/40 bg-white/[0.03] p-5 shadow-[0_0_40px_rgba(59,130,246,0.08)] md:p-7">

          <SectionTitle
            number="06"
            emoji="🎧"
            title="Infos pour jouer avec la communauté"
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {communityRules.map((rule) => (
              <CommunityRule
                key={rule.number}
                number={rule.number}
                emoji={rule.emoji}
                title={rule.title}
                text={rule.text}
              />
            ))}

          </div>

          {/* BOUTON DISCORD */}
          <div className="mt-6 flex justify-center">

            <a
              href="https://discord.gg/7PqVKVPEDq"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full border border-purple-400/40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-6 py-3 text-sm font-black text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.12)] transition-all duration-300 hover:scale-105 hover:border-pink-400/60 hover:from-purple-500/30 hover:to-pink-500/30 hover:text-white"
            >

              <span className="text-xl transition-transform duration-300 group-hover:scale-110">
                💬
              </span>

              Rejoindre le Discord

            </a>

          </div>

          <div className="mt-6 rounded-2xl border border-pink-400/30 bg-pink-500/5 p-5 text-center">

            <p className="text-lg font-semibold text-pink-300">
              ❤️ Le but est simple :
            </p>

            <p className="mt-1 text-gray-300">
              jouer ensemble, passer un bon moment et faire vivre la communauté !
            </p>

          </div>

        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8 text-center">

        <p className="text-sm text-gray-500">
          🇲🇶 La Martiniquaise • Merci de faire partie de l'aventure ❤️
        </p>

      </footer>

      {/* ☀️ ACCÈS ADMIN */}
      <a
        href="/admin"
        aria-label="Accéder à l'administration"
        className="group fixed right-4 top-4 z-[9999] md:right-8 md:top-6"
      >

        <div className="relative">

          {/* Halo lumineux */}
          <div className="absolute inset-2 rounded-full bg-yellow-400/20 blur-2xl transition-all duration-300 group-hover:bg-yellow-400/40" />

          {/* Soleil */}
          <img
            src="/images/decorations/soleil.png"
            alt="Administration"
            className="relative block w-28 object-contain drop-shadow-[0_0_18px_rgba(250,204,21,0.55)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 md:w-36"
          />

          {/* Texte au survol */}
          <span className="absolute right-0 top-full mt-1 whitespace-nowrap rounded-full border border-yellow-400/30 bg-[#09090f]/95 px-3 py-1.5 text-xs font-bold text-yellow-300 opacity-0 shadow-xl transition-opacity duration-300 group-hover:opacity-100">
            ⚙️ Administration
          </span>

        </div>

      </a>

    </main>
  );
}

/* ========================================
   COMPOSANTS
======================================== */

function SectionTitle({
  number,
  emoji,
  title,
}: {
  number: string;
  emoji: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <span className="text-2xl font-black text-pink-400">
        {number}
      </span>

      <span className="text-2xl">
        {emoji}
      </span>

      <h2 className="text-xl font-black uppercase tracking-wide md:text-2xl">
        {title}
      </h2>

    </div>
  );
}

function DayCard({
  day,
  sessions,
  today = false,
}: {
  day: string;
  sessions: {
    time: string;
    games: {
      name: string;
      image?: string;
      emoji?: string;
    }[];
  }[];
  today?: boolean;
}) {
  const isRestDay = sessions.length === 0;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-4 text-center transition-all duration-300 ${
        today
          ? "border-yellow-400/90 bg-gradient-to-b from-yellow-400/15 to-pink-500/5 shadow-[0_0_30px_rgba(250,204,21,0.18)]"
          : "border-white/10 bg-black/20 hover:border-pink-400/50 hover:bg-pink-500/5 hover:shadow-[0_0_25px_rgba(236,72,153,0.12)]"
      }`}
    >

      <div
        className={`absolute -right-8 -top-8 h-20 w-20 rounded-full blur-2xl transition-opacity ${
          today
            ? "bg-yellow-400/20 opacity-100"
            : "bg-pink-500/10 opacity-0 group-hover:opacity-100"
        }`}
      />

      {today && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-red-500 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-white shadow-lg">
          Aujourd'hui
        </span>
      )}

      <p
        className={`relative z-10 text-sm font-black uppercase tracking-wide ${
          today ? "text-yellow-300" : "text-pink-300"
        }`}
      >
        {day}
      </p>

      {isRestDay ? (
        <div className="relative z-10 flex min-h-[145px] flex-col items-center justify-center">

          <div className="text-4xl transition-transform duration-300 group-hover:scale-110">
            🌴
          </div>

          <p className="mt-3 text-sm font-bold text-gray-400">
            Repos
          </p>

          <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-600">
            Pas de live
          </p>

        </div>
      ) : (
        <div className="relative z-10 mt-4 space-y-3">

          {sessions.map((session, sessionIndex) => {

            const gameCount = session.games.length;

            return (
              <div
                key={`${session.time}-${sessionIndex}`}
                className="rounded-xl border border-white/10 bg-black/30 p-3"
              >

                <div
                  className={`mb-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${
                    today
                      ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300"
                      : "border-white/10 bg-white/5 text-yellow-300"
                  }`}
                >
                  🕐 {session.time}
                </div>

                <div
                  className={`grid items-start gap-2 ${
                    gameCount === 1
                      ? "grid-cols-1"
                      : gameCount === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                  }`}
                >

                  {session.games.map((game, gameIndex) => (

                    <div
                      key={`${game.name}-${gameIndex}`}
                      className="flex min-w-0 flex-col items-center justify-start"
                    >

                      {game.image ? (
                        <div
                          className={`flex items-center justify-center ${
                            gameCount === 1
                              ? "h-20 w-full"
                              : "h-12 w-full"
                          }`}
                        >

                          <Image
                            src={game.image}
                            alt={game.name}
                            width={120}
                            height={80}
                            className={`object-contain transition-transform duration-300 group-hover:scale-105 ${
                              gameCount === 1
                                ? "h-20 w-auto max-w-[130px]"
                                : "h-11 w-auto max-w-[85px]"
                            }`}
                          />

                        </div>
                      ) : (
                        <div
                          className={`flex items-center justify-center ${
                            gameCount === 1 ? "h-20" : "h-14"
                          } text-3xl`}
                        >
                          {game.emoji}
                        </div>
                      )}

                      <span
                        className={`mt-1 text-center font-semibold leading-tight text-gray-300 ${
                          gameCount === 3
                            ? "text-[8px] leading-tight"
                            : "text-[10px] leading-tight"
                        }`}
                      >
                        {game.name}
                      </span>

                    </div>

                  ))}

                </div>

              </div>
            );

          })}

        </div>
      )}

    </div>
  );
}

function RewardCard({
  level,
  reward,
}: {
  level: number;
  reward: string;
}) {
  return (
    <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4 text-center transition-all duration-300 hover:border-pink-400/50 hover:bg-purple-500/10">

      <p className="text-2xl font-black text-purple-300">
        {level}
      </p>

      <p className="text-xs font-bold uppercase text-gray-400">
        Subs
      </p>

      <div className="my-3 flex justify-center">

        <Image
          src="/images/decorations/recompense-sub.png"
          alt="Récompense"
          width={90}
          height={90}
          className="h-20 w-20 object-contain"
        />

      </div>

      <p className="text-xs leading-relaxed text-gray-300">
        {reward}
      </p>

    </div>
  );
}

function Goal({
  label,
  current,
  target,
  progress,
}: {
  label: string;
  current: string;
  target: string;
  progress: number;
}) {
  return (
    <div>

      <div className="mb-2 flex justify-between text-sm">

        <span className="font-semibold text-gray-300">
          {label}
        </span>

        <span className="text-green-300">
          {current} / {target}
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/10">

        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-300"
          style={{ width: `${progress}%` }}
        />

      </div>

    </div>
  );
}

function GameCard({
  image,
  title,
  type,
}: {
  image: string;
  title: string;
  type: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-black/20 p-4 text-center transition-all duration-300 hover:border-cyan-400/50 hover:bg-cyan-400/5 hover:shadow-[0_0_25px_rgba(34,211,238,0.12)]">

      <div className="flex h-24 items-center justify-center md:h-28">

        <Image
          src={image}
          alt={title}
          width={160}
          height={100}
          className="h-20 w-auto max-w-[150px] object-contain transition-transform duration-300 group-hover:scale-110 md:h-24"
        />

      </div>

      <h3 className="mt-2 text-sm font-black text-white md:text-base">
        {title}
      </h3>

      <p className="mt-1 text-xs text-gray-400">
        {type}
      </p>

    </div>
  );
}

function InfoItem({
  emoji,
  title,
  text,
  imageUrl,
}: {
  emoji: string;
  title: string;
  text: string;
  imageUrl?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

      <div className="flex gap-4">

        <span className="text-2xl">
          {emoji}
        </span>

        <div className="flex-1">

          <h3 className="font-black text-pink-300">
            {title}
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            {text}
          </p>

        </div>

      </div>

      {imageUrl && (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">

          <img
            src={imageUrl}
            alt={title}
            className="max-h-64 w-full object-contain"
          />

        </div>
      )}

    </div>
  );
}

function CommunityRule({
  number,
  emoji,
  title,
  text,
}: {
  number: string;
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-500/10 to-purple-500/5 p-5 transition-all duration-300 hover:border-pink-400/50 hover:shadow-[0_0_25px_rgba(236,72,153,0.12)]">

      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-500/10 blur-2xl transition-opacity group-hover:bg-pink-500/15" />

      <div className="relative z-10 flex items-center justify-between">

        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10 text-sm font-black text-blue-300">
          {number}
        </span>

        <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
          {emoji}
        </span>

      </div>

      <h3 className="relative z-10 mt-5 text-base font-black text-pink-300">
        {title}
      </h3>

      <p className="relative z-10 mt-2 text-sm leading-relaxed text-gray-400">
        {text}
      </p>

    </div>
  );
}