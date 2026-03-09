// lib/db.ts — temporary stub (no DB)

import { UserEntry, RepoStats } from "@/scripts/generateLeaderboard";
import fs from "fs";
import path from "path";
import { differenceInDays } from "date-fns";
import { calculateStreaks, DailyActivity } from "./streak-utils";
import type { Contributor, ContributorWithAvatar, Activity, GlobalActivity } from "@/types/contributor";

type ActivityItem = {
  slug: string;
  contributor: string;
  contributor_name: string | null;
  contributor_avatar_url: string | null;
  contributor_role: string | null;
  occured_at: string;
  title?: string | null;
  text?: string | null;
  link?: string | null;
  repo?: string | null;
  points: number | null;
};

export type ActivityGroup = {
  activity_definition: string;
  activity_name: string;
  activity_description?: string | null;
  activities: ActivityItem[];
};

export type MonthBuckets = {
  w1: number;
  w2: number;
  w3: number;
  w4: number;
};


// Helper function to extract repository name from GitHub URL
function extractRepoFromUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const match = url.match(/github\.com\/[^/]+\/([^/]+)/);
  return match && match[1] !== undefined ? match[1] : null;
}

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
  valid: "week" | "month" | "2month" | "year"
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
      contributor_role: (user.role ?? null) as string | null,
      occured_at: act.occured_at,
      title: act.title ?? null,
      link: act.link ?? null,
      repo: extractRepoFromUrl(act.link ?? null),
      points: act.points ?? 0,
    });
  }
}

  for (const group of groups.values()) {
    group.activities.sort(
      (a, b) =>
        new Date(b.occured_at).getTime() -
        new Date(a.occured_at).getTime()
    );
  }

  return [...groups.values()];
}

export async function getUpdatedTime() {
  const publicPath = path.join(process.cwd(), "public", "leaderboard");
  if(!fs.existsSync(publicPath)) return null;
  const files = fs.readdirSync(publicPath).filter(
    (file) => file.endsWith(".json") && file !== "recent-activities.json"
  );

  let latestUpdatedAt = 0;
  for(const file of files){
    try{
      const filePath = path.join(publicPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (data.updatedAt && data.updatedAt > latestUpdatedAt) {
        latestUpdatedAt = data.updatedAt;
      }
    } catch (error) {
      // Skip files that can't be parsed
      continue;
    }
  }
  return latestUpdatedAt > 0 ? new Date(latestUpdatedAt) : null;
}

export async function getLeaderboard(): Promise<UserEntry[]> {
  const filePath = path.join(process.cwd(), "public", "leaderboard", "year.json");
  if (!fs.existsSync(filePath)) return [];

  const file = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(file);
  
  if (!data?.entries) return [];

  return data.entries.sort((a: UserEntry, b: UserEntry) => b.total_points - a.total_points);
}

export async function getTopContributorsByActivity() {
  const filePath = path.join(process.cwd(), "public", "leaderboard", "year.json");
  if (!fs.existsSync(filePath)) return {};
  const file = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(file);
  return data.topByActivity || {};
}

export async function getAllContributorsWithAvatars(): Promise<ContributorWithAvatar[]> {
   const entries = await getLeaderboard();
   return entries.map((e: UserEntry) => ({
      username: e.username,
      avatar_url: e.avatar_url,
      name: e.name
   }));
}

export async function getAllContributorUsernames(): Promise<string[]> {
  const entries = await getLeaderboard();
  return entries.map((e: UserEntry) => e.username);
}

export async function getContributor(username: string): Promise<UserEntry | null> {
  const entries = await getLeaderboard();
  return entries.find((e: UserEntry) => e.username.toLowerCase() === username.toLowerCase()) || null;
}

/**
 * Calculates contributor profile and stats
 */
export async function getContributorProfile(username: string) {
  const contributor = await getContributor(username);
  if (!contributor) return null;

  type ParsedActivity = Omit<Activity, 'occured_at'> & { occured_at: Date };
  const activities = (contributor.activities || contributor.raw_activities || []).map((a: Activity) => ({
    ...a,
    occured_at: new Date(a.occured_at),
  })) as ParsedActivity[];

  const dailyActivityMap = new Map();
  activities.forEach((activity: ParsedActivity) => {
    const d = new Date(activity.occured_at);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!dailyActivityMap.has(date)) {
      dailyActivityMap.set(date, { count: 0, points: 0 });
    }
    const dayData = dailyActivityMap.get(date);
    dayData.count += 1;
    dayData.points += (activity.points || 0);
  });

  const dailyActivity: DailyActivity[] = Array.from(dailyActivityMap.entries()).map(([date, stats]: [string, { count: number; points: number }]) => ({
    date,
    ...stats
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const streaks = calculateStreaks(dailyActivity);

  // Calculate Distribution
  const distribution = {
    prs: activities.filter(a => a.type.toLowerCase().includes('pr')).length,
    issues: activities.filter(a => a.type.toLowerCase().includes('issue')).length,
    others: activities.filter(a => !a.type.toLowerCase().includes('pr') && !a.type.toLowerCase().includes('issue')).length,
    total: activities.length
  };

  // Calculate PR Turn-around Time
  const prOpenedMap = new Map<string, Date>();
  const turnAroundTimes: number[] = [];
  const sortedActivities = [...activities].sort((a, b) => a.occured_at.getTime() - b.occured_at.getTime());

  sortedActivities.forEach(activity => {
    if (activity.type === "PR opened" && activity.link) {
      prOpenedMap.set(activity.link, activity.occured_at);
    } else if (activity.type === "PR merged" && activity.link) {
      const openedAt = prOpenedMap.get(activity.link);
      if (openedAt) {
        const diff = activity.occured_at.getTime() - openedAt.getTime();
        turnAroundTimes.push(diff);
      }
    }
  });

  const avgTurnAroundMs = turnAroundTimes.length > 0 
    ? turnAroundTimes.reduce((a, b) => a + b, 0) / turnAroundTimes.length 
    : 0;

  // Calculate Top Repos
  const repoCounts = new Map<string, number>();
  activities.forEach((activity: ParsedActivity) => {
    if (activity.link) {
      const match = activity.link.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (match) {
        const repo = match[2];
        if (repo) {
          repoCounts.set(repo, (repoCounts.get(repo) || 0) + 1);
        }
      }
    }
  });

  const top_repos = Array.from(repoCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  return {
    contributor,
    activities: sortedActivities.reverse(), // newest first
    totalPoints: contributor.total_points,
    activityByDate: dailyActivityMap,
    dailyActivity,
    stats: {
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      avgTurnAroundMs,
      distribution,
      top_repos
    }
  };
}

export async function getRepositories() {
  const entries = await getLeaderboard();
  const repoStats = new Map<string, { name: string; prs: number; issues: number; contributors: Set<string> }>();

  for (const entry of entries) {
    const rawActivities = entry.activities || entry.raw_activities || [];
    for (const act of rawActivities) {
      if (!act.link) continue;
      const match = act.link.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (match) {
        const repoName = match[2];
        const fullRepo = `${match[1]}/${repoName}`;

        if (!repoStats.has(fullRepo)) {
          repoStats.set(fullRepo, { name: fullRepo, prs: 0, issues: 0, contributors: new Set() });
        }

        const stats = repoStats.get(fullRepo)!;
        stats.contributors.add(entry.username);
        if (act.type.includes("PR")) stats.prs++;
        if (act.type.includes("Issue")) stats.issues++;
      }
    }
  }

  return Array.from(repoStats.values()).map(r => ({
    ...r,
    contributorCount: r.contributors.size,
    contributors: undefined
  })).sort((a, b) => (b.prs + b.issues) - (a.prs + a.issues));
}

export async function getGlobalRecentActivities(typeFilter?: string) {
  const entries = await getLeaderboard();
  const allActivities: GlobalActivity[] = [];

  for (const entry of entries) {
    const rawActivities = entry.activities || entry.raw_activities || [];
    for (const act of rawActivities) {
        if (typeFilter && !act.type.toLowerCase().includes(typeFilter.toLowerCase())) continue;
        allActivities.push({
            ...act,
            username: entry.username,
            avatar_url: entry.avatar_url
        });
    }
  }

  return allActivities.sort((a, b) => new Date(b.occured_at).getTime() - new Date(a.occured_at).getTime());
}

export async function getMonthlyActivityBuckets(): Promise<MonthBuckets> {
  const month = await getRecentActivitiesGroupedByType("month");
  const activities = month.flatMap(g => g.activities);
  const now = new Date();
  
  const buckets: MonthBuckets = { w1: 0, w2: 0, w3: 0, w4: 0 };
  
  for (const activity of activities) {
    const activityDate = new Date(activity.occured_at);
    const daysAgo = differenceInDays(now, activityDate);
    
    if (daysAgo < 7) buckets.w1++;
    else if (daysAgo < 14) buckets.w2++;
    else if (daysAgo < 21) buckets.w3++;
    else if (daysAgo < 28) buckets.w4++;
  }
  
  return buckets;
}

export async function getPreviousMonthActivityCount(): Promise<number> {
  const filePath = path.join(process.cwd(), "public", "leaderboard", "month.json");
  if (!fs.existsSync(filePath)) return 0;

  const file = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(file);
  
  if (!data?.entries?.length) return 0;
  
  const activities = data.entries.flatMap((entry: UserEntry) => entry.activities || entry.raw_activities || []);
  const now = new Date();

  let count = 0;
  for (const activity of activities) {
    const activityDate = new Date(activity.occured_at);
    const daysAgo = differenceInDays(now, activityDate);

    if (daysAgo >= 30 && daysAgo < 60) {
      count++;
    }
  }

  return count;
}

export async function getReposOverview(): Promise<RepoStats[]> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "leaderboard",
    `overview.json`
  );

  if (!fs.existsSync(filePath)) return [];
  
  try {
    const file = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(file);
    if (!data?.repos?.length) return [];
    return data.repos;
  } catch (error) {
    console.error("Failed to parse overview.json:", error);
    return [];
  }
}



