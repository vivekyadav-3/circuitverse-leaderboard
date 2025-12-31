// lib/db.ts — temporary stub (no DB)

import { UserEntry } from "@/scripts/generateLeaderboard";
import fs from "fs";
import path from "path";

type ActivityItem = {
  slug: string;
  contributor: string;
  contributor_name: string | null;
  contributor_avatar_url: string | null;
  contributor_role: string | null;
  occured_at: string;
  closed_at: string;
  title?: string | null;
  text?: string | null;
  link?: string | null;
  points: number | null;
};

export type ActivityGroup = {
  activity_definition: string;
  activity_name: string;
  activity_description?: string | null;
  activities: ActivityItem[];
};

type RecentActivitiesJSON = {
  updatedAt: number;
  entries: UserEntry[];
  groups: ActivityGroup[];
};

// Used by app/page.tsx
// export async function getRecentActivitiesGroupedByType(valid: "week" | "month" | "year"): Promise<ActivityGroup[]> {
//   const filePath = path.join(
//     process.cwd(),
//     "public",
//     "leaderboard",
//     `${valid}.json`
//   );

//   let activityGroups: ActivityGroup[] = [];

//   if (fs.existsSync(filePath)) {
//     const file = fs.readFileSync(filePath, "utf-8");
//     const data: RecentActivitiesJSON = JSON.parse(file);
    
//     const groupsFromEntries: ActivityGroup[] =
//       Object.entries(
//         data.entries.reduce((acc, user) => {
//           for (const [type, meta] of Object.entries(
//             user.activity_breakdown
//           )) {
//             if (!acc[type]) {
//               acc[type] = {
//                 activity_definition: type,
//                 activity_name: type,
//                 activities: [],
//               };
//             }

//             acc[type].activities.push({
//               slug: `${user.username}-${type}`,
//               contributor: user.username,
//               contributor_name: user.name,
//               contributor_avatar_url: user.avatar_url,
//               occured_at: data.updatedAt,
//               points: meta.points,
//             });
//           }
//           return acc;
//         }, {} as Record<string, ActivityGroup>)
//       ).map(([, group]) => group);

//     activityGroups = groupsFromEntries;
//   }
  
//   return activityGroups;
// }

export async function getRecentActivitiesGroupedByType(
  valid: "week" | "2week" | "3week" | "month" | "2month" | "year"
): Promise<ActivityGroup[]> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "leaderboard",
    `${valid}.json`
  );

  if (!fs.existsSync(filePath)) return [];

  const file = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(file);

  if (!data?.entries?.length) return [];

  const groups = new Map<string, ActivityGroup>();

 for (const user of data.entries) {
  if (!user.activities) continue;

  for (const act of user.activities) {
    const type = act.type;

    if (!groups.has(type)) {
      groups.set(type, {
        activity_definition: type,
        activity_name: type,
        activity_description: null,
        activities: [],
      });
    }

    groups.get(type)!.activities.push({
      slug: `${user.username}-${type}-${act.occured_at}-${groups.get(type)!.activities.length}`,
      contributor: user.username,
      contributor_name: user.name,
      contributor_avatar_url: user.avatar_url,
      contributor_role: user.role ?? null,
      occured_at: act.occured_at,
      closed_at: act.occured_at,
      title: act.title ?? null,     // ✅ REAL title
      link: act.link ?? null,       // ✅ REAL GitHub link
      points: act.points ?? 0,
    });
  }
}


  // newest first
  for (const group of groups.values()) {
    group.activities.sort(
      (a, b) =>
        new Date(b.occured_at).getTime() -
        new Date(a.occured_at).getTime()
    );
  }

  return [...groups.values()];
}



// (Optional) stubs for other imports; add as you see “module not found” errors:

export async function getUpdatedTime() {
  // get last updated time from any of the JSON files
  const filePath = path.join(
    process.cwd(),
    "public",
    "leaderboard",
    `week.json`
  );
  if (!fs.existsSync(filePath)) return null;

  const file = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(file);
  return data.updatedAt ? new Date(data.updatedAt) : null;
}

export async function getLeaderboard() {
  return [];
}

export async function getTopContributorsByActivity() {
  return {};
}

export async function getAllContributorsWithAvatars() {
  return [];
}

export async function getAllContributorUsernames() {
  return [];
}

export async function getContributor(_username: string) {
  return null;
}

/**
 * Calculates current and longest contribution streaks
 */
function calculateStreaks(dailyActivity: any[]) {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Streak logic depends on chronological order
  const sortedDays = [...dailyActivity].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate Longest Streak
  sortedDays.forEach((day) => {
    if (day.count > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  });

  // Calculate Current Streak (working backwards from today/yesterday)
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const reverseDays = [...sortedDays].reverse();
  let lastActiveIndex = -1;

  for (let i = 0; i < reverseDays.length; i++) {
    const day = reverseDays[i];
    if (day.count > 0 && (day.date === today || day.date === yesterday)) {
      lastActiveIndex = i;
      break;
    }
  }

  if (lastActiveIndex !== -1) {
    currentStreak = 1;
    for (let i = lastActiveIndex; i < reverseDays.length - 1; i++) {
      const d1 = new Date(reverseDays[i].date);
      const d2 = new Date(reverseDays[i + 1].date);
      const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1 && reverseDays[i + 1].count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { current: currentStreak, longest: longestStreak };
}

export async function getContributorProfile(username: string) {
  // Original logic to fetch contributor and activity
  const filePath = path.join(process.cwd(), "public", "leaderboard", "year.json");
  if (!fs.existsSync(filePath)) return { contributor: null, activities: [], totalPoints: 0, activityByDate: {} };

  const file = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(file);
  const contributor = data.entries.find((e: any) => e.user.login === username);

  if (!contributor) return { contributor: null, activities: [], totalPoints: 0, activityByDate: {} };

  const activities = (contributor.raw_activities || []).map((a: any) => ({
    ...a,
    occured_at: new Date(a.occured_at),
  }));

  // Aggregate for heatmap
  const dailyActivityMap = new Map();
  activities.forEach((activity: any) => {
    const date = new Date(activity.occured_at).toISOString().split("T")[0];
    if (!dailyActivityMap.has(date)) {
      dailyActivityMap.set(date, { count: 0, points: 0 });
    }
    const dayData = dailyActivityMap.get(date);
    dayData.count += 1;
    dayData.points += (activity.points || 0);
  });

  const dailyActivity = Array.from(dailyActivityMap.entries()).map(([date, stats]: [string, any]) => ({
    date,
    ...stats
  }));

  const streaks = calculateStreaks(dailyActivity);

  return {
    contributor,
    activities,
    totalPoints: contributor.total_points,
    activityByDate: dailyActivityMap,
    dailyActivity,
    stats: {
      currentStreak: streaks.current,
      longestStreak: streaks.longest
    }
  };
}
