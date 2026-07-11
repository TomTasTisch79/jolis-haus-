export type Achievement = {
  key: string;
  icon: string;
  title: string;
  earned: boolean;
};

export type AchievementStats = {
  completedCount: number;
  points: number;
  goodRatings: number;
  badRatings: number;
  streak: number;
};

export function computeAchievements(stats: AchievementStats): Achievement[] {
  return [
    {
      key: "starter",
      icon: "🌱",
      title: "Erste Aufgabe erledigt",
      earned: stats.completedCount >= 1,
    },
    {
      key: "fleissig",
      icon: "💪",
      title: "10 Aufgaben erledigt",
      earned: stats.completedCount >= 10,
    },
    {
      key: "powerhaus",
      icon: "🚀",
      title: "50 Aufgaben erledigt",
      earned: stats.completedCount >= 50,
    },
    {
      key: "perfektionist",
      icon: "⭐",
      title: "5x gut bewertet, ohne Ausrutscher",
      earned: stats.goodRatings >= 5 && stats.badRatings === 0,
    },
    {
      key: "punktejaeger",
      icon: "🏆",
      title: "50 Punkte gesammelt",
      earned: stats.points >= 50,
    },
    {
      key: "serientaeter",
      icon: "🔥",
      title: "3 Tage Erledigungs-Serie",
      earned: stats.streak >= 3,
    },
  ];
}
