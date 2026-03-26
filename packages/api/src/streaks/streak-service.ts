import { Activity } from "../types/scraper";

export interface Streak {
  current: number;
  longest: number;
  lastActivityDate: string | null;
}

export class StreakService {
  calculateStreak(
    activities: Activity[],
    timezone: string = "UTC"
  ): Streak {
    const dates = activities.map((a) => {
      const date = new Date(a.occured_at);
      const userDate = date.toLocaleDateString("en-US", { timeZone: timezone });
      const parts = userDate.split("/");
      const m = parts[0] || "01";
      const d = parts[1] || "01";
      const y = parts[2] || "2026";
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    });

    const uniqueDates = Array.from(new Set(dates)).sort();
    if (uniqueDates.length === 0) {
      return { current: 0, longest: 0, lastActivityDate: null };
    }

    const today = new Date().toLocaleDateString("en-US", { timeZone: timezone });
    const parts1 = today.split("/");
    const m1 = parts1[0] || "01";
    const d1 = parts1[1] || "01";
    const y1 = parts1[2] || "2026";
    const todayStr = `${y1}-${m1.padStart(2, "0")}-${d1.padStart(2, "0")}`;

    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString(
      "en-US",
      { timeZone: timezone }
    );
    const parts2 = yesterday.split("/");
    const m2 = parts2[0] || "01";
    const d2 = parts2[1] || "01";
    const y2 = parts2[2] || "2026";
    const yesterdayStr = `${y2}-${m2.padStart(2, "0")}-${d2.padStart(2, "0")}`;

    let current = 0;
    let longest = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const dateStr of uniqueDates) {
      const date = new Date(dateStr);
      if (lastDate) {
        const diff = (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      longest = Math.max(longest, tempStreak);
      lastDate = date;
    }

    const lastActivity = uniqueDates[uniqueDates.length - 1];
    if (lastActivity === todayStr || lastActivity === yesterdayStr) {
      current = tempStreak;
    } else {
      current = 0;
    }

    return {
      current,
      longest,
      lastActivityDate: lastActivity ?? null,
    };
  }
}
