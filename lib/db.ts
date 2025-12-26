// lib/db.ts — temporary stub (no DB)

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

export async function getLeaderboard() {
  const filePath = path.join(process.cwd(), "public", "leaderboard", "year.json");
  if (!fs.existsSync(filePath)) return [];
  const file = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(file);
  return data.entries || [];
}

export async function getTopContributorsByActivity() {
  const filePath = path.join(process.cwd(), "public", "leaderboard", "year.json");
  if (!fs.existsSync(filePath)) return {};
  const file = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(file);
  return data.topByActivity || {};
}

export async function getAllContributorsWithAvatars() {
   const entries = await getLeaderboard();
   return entries.map((e: any) => ({
      username: e.username,
      avatar_url: e.avatar_url
   }));
}

export async function getAllContributorUsernames() {
  const entries = await getLeaderboard();
  return entries.map((e: any) => e.username);
}

export async function getContributor(username: string) {
  const entries = await getLeaderboard();
  return entries.find((e: any) => e.username.toLowerCase() === username.toLowerCase()) || null;
}

export async function getContributorProfile(username: string) {
  const contributor = await getContributor(username);
  if (!contributor) return null;

  // Transform raw_activities to ActivityItem[]
  const activities: ActivityItem[] = (contributor.raw_activities || []).map((act: any) => ({
    slug: `${username}-${act.type}-${act.occured_at}`,
    contributor: username,
    contributor_name: contributor.name,
    contributor_avatar_url: contributor.avatar_url,
    contributor_role: contributor.role,
    occured_at: act.occured_at,
    closed_at: act.occured_at,
    title: act.title,
    link: act.link,
    points: act.points
  }));

  // Sort activities by date desc
  activities.sort((a, b) => new Date(b.occured_at).getTime() - new Date(a.occured_at).getTime());

  // Group by date for "activityByDate" if needed, or just return as is.
  // The UI likely expects a specific format. Let's return a structure helpful for the profile page.
  
  return {
    contributor,
    activities,
    totalPoints: contributor.total_points,
    // Add other aggregates if needed
  };
}

export async function getRepositories() {
  const entries = await getLeaderboard();
  const repoStats = new Map<string, { name: string; prs: number; issues: number; contributors: Set<string> }>();

  for (const entry of entries) {
    if (!entry.activities) continue;
    for (const act of entry.activities) {
      if (!act.link) continue;
      
      // Extract repo name from GitHub URL
      // Expected format: https://github.com/Org/Repo/...
      const match = act.link.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (match) {
        const repoName = match[2]; // just the repo name, or match[1]+"/"+match[2] for full slug
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
    contributors: undefined // remove Set from final output
  })).sort((a, b) => (b.prs + b.issues) - (a.prs + a.issues));
}

export async function getGlobalRecentActivities(typeFilter?: string) {
  const entries = await getLeaderboard();
  let allActivities: any[] = [];

  for (const entry of entries) {
    if (!entry.activities) continue;
    for (const act of entry.activities) {
        if (typeFilter && !act.type.includes(typeFilter)) continue;
        
        allActivities.push({
            ...act,
            username: entry.username,
            avatar_url: entry.avatar_url
        });
    }
  }

  return allActivities.sort((a, b) => new Date(b.occured_at).getTime() - new Date(a.occured_at).getTime());
}
