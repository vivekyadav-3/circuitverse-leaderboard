// scripts/generateLeaderboard.ts

import fs from "fs";
import path from "path";

/* -------------------------------------------------------
   CONSTANTS & CONFIG
------------------------------------------------------- */

const TOKEN = process.env.GITHUB_TOKEN;
const ORG = "CircuitVerse";
const GITHUB_API = "https://api.github.com";

const POINTS = {
  PR_OPENED: 5,
  PR_MERGED: 10,
  ISSUE_OPENED: 2,
};

/* -------------------------------------------------------
   TYPES
------------------------------------------------------- */

export type LeaderboardActivity = {
  username: string;
  name: string | null;
  avatar_url: string;
  role: string;
  type: string;
  points: number;
  occured_at: string;
  title?: string | null;
  link?: string | null;
};

export type ActivityBreakdown = Record<string, { count: number; points: number }>;

export type DailyActivity = {
  date: string;
  count: number;
  points: number;
};

export type UserEntry = {
  username: string;
  name: string | null;
  avatar_url: string;
  role: string;
  total_points: number;
  activity_breakdown: ActivityBreakdown;
  daily_activity: DailyActivity[];
  raw_activities: {
    type: string;
    occured_at: string;
    title: string | null;
    link: string | null;
    points: number;
  }[];
};

type GitHubItem = {
  user: {
    login: string;
    name?: string | null;
    avatar_url?: string | null;
    type?: string;
  };
  created_at: string;
  closed_at: string;
  title?: string | null;
  html_url?: string | null;
};

/* -------------------------------------------------------
   UTILS
------------------------------------------------------- */

function sanitizeTitle(title?: string | null) {
  if (!title) return null;
  return title
    .replace(/\[|\]/g, "")
    .replace(/:/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ghSearch(url: string): Promise<{ items?: GitHubItem[] }> {
  if (!TOKEN) throw new Error("GITHUB_TOKEN is not set.");

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }

  // GitHub Search API rate limit is strict (30 requests per minute for authenticated users)
  // We wait 2 seconds between requests to be safe.
  await sleep(2000);

  return res.json() as Promise<{ items?: GitHubItem[] }>;
}

function iso(d: Date) {
  return d.toISOString().split("T")[0];
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function isBotUser(user: { login?: string; type?: string }): boolean {
  if (!user?.login) return true;
  if (user.type && user.type !== "User") return true;
  return user.login.endsWith("[bot]");
}

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function ensureUser(
  map: Map<string, UserEntry>,
  user: { login: string; name?: string | null; avatar_url?: string | null }
) {
  if (!map.has(user.login)) {
    map.set(user.login, {
      username: user.login,
      name: user.name ?? null,
      avatar_url: user.avatar_url ?? "https://github.com/identicons/default.png",
      role: "Contributor",
      total_points: 0,
      activity_breakdown: {},
      daily_activity: [],
      raw_activities: [],
    });
  }
  return map.get(user.login)!;
}

function addActivity(
  entry: UserEntry,
  type: string,
  date: string,
  points: number,
  meta?: { title?: string | null; link?: string | null }
) {
  const day = date.split("T")[0]!;

  entry.total_points += points;
  entry.activity_breakdown[type] ??= { count: 0, points: 0 };
  entry.activity_breakdown[type].count += 1;
  entry.activity_breakdown[type].points += points;

  let existingDay = entry.daily_activity.find((d) => d.date === day);
  if (existingDay) {
    existingDay.count += 1;
    existingDay.points += points;
  } else {
    entry.daily_activity.push({ date: day, count: 1, points });
  }

  entry.raw_activities.push({
    type,
    occured_at: date,
    title: sanitizeTitle(meta?.title),
    link: meta?.link ?? null,
    points,
  });
}

/* -------------------------------------------------------
   SEARCH CHUNKER
------------------------------------------------------- */

async function searchByDateChunks(
  baseQuery: string,
  start: Date,
  end: Date,
  stepDays = 30
): Promise<GitHubItem[]> {
  const all: GitHubItem[] = [];
  let cursor = new Date(start);

  while (cursor < end) {
    const from = iso(cursor);
    const next = new Date(cursor);
    next.setDate(next.getDate() + stepDays);
    const to = next > end ? end : next;

    console.log(`Searching GitHub for ${baseQuery} from ${from} to ${iso(to)}...`);

    let page = 1;
    while (true) {
      const url = `${GITHUB_API}/search/issues?q=${baseQuery}+created:${from}..${iso(to)}&per_page=100&page=${page}`;
      const res = await ghSearch(url);

      if (!res.items || res.items.length === 0) break;
      all.push(...res.items);
      if (res.items.length < 100) break;
      page++;
    }

    cursor = to;
  }

  return all;
}

/* -------------------------------------------------------
   MAIN GENERATOR
------------------------------------------------------- */

async function main() {
  if (!TOKEN) {
    console.error("⛔ Error: GITHUB_TOKEN environment variable is not set.");
    process.exit(1);
  }

  const since = daysAgo(365);
  const now = new Date();
  const users = new Map<string, UserEntry>();

  console.log("🚀 Starting GitHub Leaderboard Generation...");

  try {
    // 1. Fetch Pull Requests Opened
    console.log("🔍 Fetching PRs opened...");
    const prsOpened = await searchByDateChunks(`org:${ORG}+is:pr`, since, now);
    for (const pr of prsOpened) {
      if (isBotUser(pr.user)) continue;
      addActivity(ensureUser(users, pr.user), "PR opened", pr.created_at, POINTS.PR_OPENED, {
        title: pr.title,
        link: pr.html_url,
      });
    }

    // 2. Fetch Pull Requests Merged
    console.log("🔍 Fetching PRs merged...");
    const prsMerged = await searchByDateChunks(`org:${ORG}+is:pr+is:merged`, since, now);
    for (const pr of prsMerged) {
      if (isBotUser(pr.user)) continue;
      const date = pr.closed_at || pr.created_at;
      addActivity(ensureUser(users, pr.user), "PR merged", date, POINTS.PR_MERGED, {
        title: pr.title,
        link: pr.html_url,
      });
    }

    // 3. Fetch Issues Opened
    console.log("🔍 Fetching Issues opened...");
    const issuesOpened = await searchByDateChunks(`org:${ORG}+is:issue`, since, now);
    for (const issue of issuesOpened) {
      if (isBotUser(issue.user)) continue;
      addActivity(ensureUser(users, issue.user), "Issue opened", issue.created_at, POINTS.ISSUE_OPENED, {
        title: issue.title,
        link: issue.html_url,
      });
    }

    const entries = [...users.values()]
      .filter((u) => u.total_points > 0)
      .sort((a, b) => b.total_points - a.total_points);

    // Save outputs
    const outDir = path.join(process.cwd(), "public", "leaderboard");
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const output = {
        updatedAt: Date.now(),
        startDate: iso(since),
        endDate: iso(now),
        entries
    };

    fs.writeFileSync(path.join(outDir, "year.json"), JSON.stringify(output, null, 2));
    
    // Generate week/month subsets for efficiency
    const generateSubset = (days: number, filename: string) => {
        const cutoff = daysAgo(days);
        const subsetEntries = entries.map(entry => {
            const filteredActivities = entry.raw_activities.filter(a => new Date(a.occured_at) >= cutoff);
            if (filteredActivities.length === 0) return null;

            const breakdown: ActivityBreakdown = {};
            filteredActivities.forEach(a => {
                breakdown[a.type] ??= { count: 0, points: 0 };
                breakdown[a.type].count++;
                breakdown[a.type].points += a.points;
            });

            return {
                ...entry,
                total_points: filteredActivities.reduce((sum, a) => sum + a.points, 0),
                activity_breakdown: breakdown,
                activities: filteredActivities,
                raw_activities: undefined // don't duplicate
            };
        }).filter(Boolean);

        fs.writeFileSync(path.join(outDir, filename), JSON.stringify({
            updatedAt: Date.now(),
            startDate: iso(cutoff),
            endDate: iso(now),
            entries: subsetEntries
        }, null, 2));
    };

    console.log("📦 Generating subsets (week, month)...");
    generateSubset(7, "week.json");
    generateSubset(30, "month.json");

    console.log("✅ Leaderboard generation complete!");
  } catch (error) {
    console.error("❌ Error generating leaderboard:", error);
    process.exit(1);
  }
}

main();
