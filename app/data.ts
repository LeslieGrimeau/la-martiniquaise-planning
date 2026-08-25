// ========================================
// LA MARTINIQUAISE — DONNÉES DU PLANNING
// ========================================

// 🎮 LOGOS DES JEUX

export const gameImages = {
  fortnite: "/images/games/fortnite.png",
  motorfest: "/images/games/motorfest.png",
  roblox: "/images/games/roblox.png",
  callOfDuty: "/images/games/call-of-duty.png",
};

// 📅 PLANNING DE LA SEMAINE

export const weeklySchedule = [
  {
    day: "Lundi",
    sessions: [
      {
        time: "21h00",
        games: [
          {
            name: "Jeux",
            emoji: "🎮",
          },
        ],
      },
    ],
  },

  {
    day: "Mardi",
    sessions: [
      {
        time: "17h00",
        games: [
          {
            name: "Motorfest",
            image: gameImages.motorfest,
          },
          {
            name: "Roblox",
            image: gameImages.roblox,
          },
        ],
      },
    ],
  },

  {
    day: "Mercredi",
    sessions: [
      {
        time: "14h00",
        games: [
          {
            name: "Fortnite",
            image: gameImages.fortnite,
          },
          {
            name: "Motorfest",
            image: gameImages.motorfest,
          },
        ],
      },
    ],
  },

  {
    day: "Jeudi",
    sessions: [
      {
        time: "14h00",
        games: [
          {
            name: "Fortnite",
            image: gameImages.fortnite,
          },
          {
            name: "Roblox",
            image: gameImages.roblox,
          },
        ],
      },
    ],
  },

  {
    day: "Vendredi",
    sessions: [
      {
        time: "14h00",
        games: [
          {
            name: "Fortnite",
            image: gameImages.fortnite,
          },
          {
            name: "Motorfest",
            image: gameImages.motorfest,
          },
         
        ],
      },
    ],
  },

  {
    day: "Samedi",
    sessions: [
      {
        time: "14h00",
        games: [
          {
            name: "À voir",
            emoji: "❓",
          },
        ],
      },
    ],
  },

  {
    day: "Dimanche",
    sessions: [],
  },
];

// 💜 PALIERS SUBS & RÉCOMPENSES

export const subscriberRewards = [
  {
    level: 5,
    reward: "Vos défis en game",
  },
  {
    level: 10,
    reward: "Intégration d'un nouveau jeu au planning",
  },
  {
    level: 15,
    reward: "Jeu d'arme",
  },
  {
    level: 20,
    reward: "Game du silence / Hmm hmmm",
  },
  {
    level: 25,
    reward: "Gagner 5 Box Saveurs Créoles lors d'un live cuisine",
  },
  {
    level: 30,
    reward: "Live 24h",
  },
];

// 🏆 OBJECTIFS DU MOIS

export const monthlyGoals = [
  {
    label: "Abonnés Twitch",
    current: "56",
    target: "75",
    progress: 75,
  },
  {
    label: "Moyenne de viewers",
    current: "8",
    target: "10",
    progress: 80,
  },
];

// 🎮 INFOS JEUX

export const games = [
  {
    title: "Fortnite",
    image: gameImages.fortnite,
    type: "Battle Royale • Créatif",
  },
  {
    title: "The Crew Motorfest",
    image: gameImages.motorfest,
    type: "Course • Open World",
  },
  {
    title: "Roblox",
    image: gameImages.roblox,
    type: "Découverte • Jeux variés",
  },
  {
    title: "Call of Duty",
    image: gameImages.callOfDuty,
    type: "FPS • Action",
  },
];

// ⭐ JEU À L'HONNEUR

export const mainGame = {
  title: "The Crew Motorfest",
  image: gameImages.motorfest,
};

// 📢 INFOS DU MOMENT

export const currentInfos = [
  {
    emoji: "🔥",
    title: "Événement",
    text: "Les prochains événements et lives spéciaux seront annoncés ici.",
  },
  {
    emoji: "🎮",
    title: "Prochain live",
    text: "Consultez le planning pour connaître le prochain rendez-vous.",
  },
  {
    emoji: "💜",
    title: "Communauté",
    text: "Les inscriptions pour jouer avec moi se font via le salon Discord dédié.",
  },
  {
    emoji: "📌",
    title: "À savoir",
    text: "Cette page est régulièrement mise à jour. Pensez à la consulter avant les lives !",
  },
];

// 🔄 DATE DE MISE À JOUR

export const lastUpdate = "25 août 2026";

// 🎧 INFOS POUR JOUER AVEC LA COMMUNAUTÉ

export const communityRules = [
  {
    number: "1",
    emoji: "🎧",
    title: "Discord recommandé",
    text: "Avoir Discord est fortement recommandé pour participer aux vocaux pendant les jeux.",
  },
  {
    number: "2",
    emoji: "🤝",
    title: "Respect avant tout",
    text: "Respect des autres joueurs, de la communauté et de la bonne ambiance du live.",
  },
  {
    number: "3",
    emoji: "💬",
    title: "Utilisez le salon pour jouer",
    text: "Utilisez autant que possible le salon Discord dédié pour organiser les parties.",
  },
  {
    number: "4",
    emoji: "⏰",
    title: "Si vous vous inscrivez, soyez présents",
    text: "Si vous vous inscrivez pour jouer, soyez présents un minimum afin de ne pas bloquer une place inutilement.",
  },
];