import * as fs from "fs";
import * as path from "path";
import { coreTeamMembers, alumniMembers } from "../lib/team-data";

// Create sets for fast lookup
const CORE_TEAM_USERNAMES = new Set(coreTeamMembers.map(m => m.username.toLowerCase()));
const ALUMNI_USERNAMES = new Set(alumniMembers.map(m => m.username.toLowerCase()));

/* -------------------------------------------------------
   CONSTANTS & CONFIG
------------------------------------------------------- */

const TOKEN = process.env.GITHUB_TOKEN;
const ORG = "CircuitVerse";
const GITHUB_API = "https://api.github.com";

const POINTS: Record<string, number> = {
  PR_OPENED: 5,
  PR_MERGED: 10,
  ISSUE_OPENED: 2,
  "PR opened": 5,
  "PR merged": 10,
  "Issue opened": 2,
  "Review submitted": 15,
  "Issue labeled": 1,
  "Issue assigned": 1,
  "Issue closed": 1,
  "commit": 1,
  "star": 1
};

/* -------------------------------------------------------
   TYPES
------------------------------------------------------- */

export type DailyActivity = {
  date: string;
  count: number;
  points: number;
};

export type UserEntry = {
  username: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
  total_points: number;
  activity_breakdown: Record<string, { count: number; points: number }>;
  daily_activity: DailyActivity[];
  raw_activities: {
    type: string;
    occured_at: string;
    title: string | null;
    link: string | null;
    points: number;
  }[];
  activities?: {
    type: string;
    occured_at: string;
    title: string | null;
    link: string | null;
    points: number;
  }[];
};

export type Contributor = UserEntry;

export type RepoStats = {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  html_url: string;
  avatar_url: string;
  current: {
    issue_created: number;
    pr_opened: number;
    pr_merged: number;
    currentTotalContribution: number;
  };
  growth: {
    pr_merged: number;
  };
};




interface GitHubSearchItem {
  user: { login: string; name?: string | null; avatar_url?: string | null; type?: string };
  title: string;
  html_url: string;
  created_at: string;
  closed_at?: string | null;
}

interface YearData {
  period: string;
  updatedAt: number;
  lastFetchedAt?: number;
  startDate?: string;
  endDate?: string;
  entries: UserEntry[];
}

interface RecentActivityItem {
  username: string;
  name: string | null;
  title: string | null;
  link: string | null;
  avatar_url: string | null;
  points: number;
}

interface ExistingYearData extends YearData {
  lastFetchedAt: number;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  html_url: string;
  owner: {
    avatar_url: string;
  };
}

interface GitHubPR {
  number: number;
  title: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: {
    login: string;
  };
}

interface GitHubReview {
  state: string;
  submitted_at: string;
  html_url: string;
  user: {
    login: string;
    type?: string;
  };
}

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

function iso(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function isBotUser(user: { login?: string; type?: string } | null | undefined): boolean {
  if (!user?.login) return true;
  if (user.type && user.type !== "User") return true;
  return user.login.endsWith("[bot]");
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/* -------------------------------------------------------
   GITHUB API HELPERS
------------------------------------------------------- */

async function smartSleep(res: Response, defaultMs: number = 2500): Promise<void> {
  const remaining = res.headers.get("x-ratelimit-remaining");
  if (remaining) {
    const remainingCount = parseInt(remaining, 10);
    if (remainingCount > 500) await sleep(200);
    else if (remainingCount > 100) await sleep(500);
    else await sleep(1500);
  } else {
    await sleep(defaultMs);
  }
}

interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubSearchItem[];
}

async function ghSearchRaw(url: string): Promise<GitHubSearchResponse> {
  if (!TOKEN) throw new Error("GITHUB_TOKEN is not set.");
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (res.status === 403 || res.status === 429) {
    const wait = 60000;
    console.log(`⚠️ Rate limit hit. Waiting ${wait / 1000}s...`);
    await sleep(wait);
    return ghSearchRaw(url);
  }

  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }

  await smartSleep(res);
  return res.json();
}

async function searchByDateChunks(
  baseQuery: string,
  start: Date,
  end: Date,
  stepDays = 30,
  dateField = "created"
): Promise<GitHubSearchItem[]> {
  const all: GitHubSearchItem[] = [];
  let cursor = new Date(start);

  while (cursor < end) {
    const from = iso(cursor);
    const next = new Date(cursor);
    next.setDate(next.getDate() + stepDays);
    const to = next > end ? end : next;

    console.log(`   → ${from} .. ${iso(to)}`);

    let page = 1;
    while (true) {
      const res = await ghSearchRaw(
        `${GITHUB_API}/search/issues?q=${baseQuery}+${dateField}:${from}..${iso(to)}&per_page=100&page=${page}`
      );

      all.push(...(res.items ?? []));
      if (!res.items || res.items.length < 100) break;
      page++;
    }
    cursor = to;
  }
  return all;
}

/* -------------------------------------------------------
   CORE HELPERS
------------------------------------------------------- */

function ensureUser(
  map: Map<string, Contributor>,
  user: { login: string; name?: string | null; avatar_url?: string | null }
): Contributor {
  if (!map.has(user.login)) {
    const usernameLower = user.login.toLowerCase();
    let role = "Contributor";
    if (CORE_TEAM_USERNAMES.has(usernameLower)) role = "Maintainer";
    else if (ALUMNI_USERNAMES.has(usernameLower)) role = "Alumni";

    map.set(user.login, {
      username: user.login,
      name: user.name ?? null,
      avatar_url: user.avatar_url ?? "https://github.com/identicons/default.png",
      role,
      total_points: 0,
      activity_breakdown: {},
      daily_activity: [],
      raw_activities: [],
    });
  }
  return map.get(user.login)!;
}

function addActivity(
  entry: Contributor,
  type: string,
  date: string,
  points: number,
  meta?: { title?: string | null; link?: string | null }
) {
  entry.raw_activities.push({
    type,
    occured_at: date,
    title: sanitizeTitle(meta?.title),
    link: meta?.link ?? null,
    points,
  });
}

function deduplicateAndRecalculate(users: Map<string, Contributor>) {
  for (const user of users.values()) {
    const seen = new Set<string>();
    user.raw_activities = user.raw_activities.filter((act) => {
      const key = `${act.type}:${act.occured_at}:${act.link ?? act.title ?? "no-title"}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    user.total_points = 0;
    user.activity_breakdown = {};
    const dailyMap = new Map<string, { count: number; points: number }>();

    for (const act of user.raw_activities) {
      user.total_points += act.points;
      user.activity_breakdown[act.type] ??= { count: 0, points: 0 };
      user.activity_breakdown[act.type]!.count++;
      user.activity_breakdown[act.type]!.points += act.points;

      const day = act.occured_at.slice(0, 10);
      dailyMap.set(day, dailyMap.get(day) || { count: 0, points: 0 });
      const d = dailyMap.get(day)!;
      d.count++;
      d.points += act.points;
    }

    user.daily_activity = Array.from(dailyMap.entries())
      .map(([date, d]) => ({ date, count: d.count, points: d.points }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }
}

/* -------------------------------------------------------
   FETCHERS
------------------------------------------------------- */

async function fetchOrgRepos(): Promise<string[]> {
  const repos: string[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${GITHUB_API}/orgs/${ORG}/repos?per_page=100&page=${page}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" },
    });
    if (!res.ok) break;
    const data: GitHubRepo[] = await res.json();
    if (data.length === 0) break;
    repos.push(...data.map((r) => r.name));
    page++;
    await sleep(500);
  }
  return repos;
}

async function fetchRepoPRs(repo: string, since: Date): Promise<GitHubPR[]> {
  const prs: GitHubPR[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${GITHUB_API}/repos/${ORG}/${repo}/pulls?state=all&sort=updated&direction=desc&per_page=100&page=${page}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" },
    });
    if (!res.ok) break;
    const data: GitHubPR[] = await res.json();
    if (data.length === 0) break;
    const filtered = data.filter((pr) => new Date(pr.updated_at) >= since);
    prs.push(...filtered);
    if (filtered.length < data.length) break;
    page++;
    await sleep(500);
  }
  return prs;
}

async function fetchPRReviews(repo: string, prNumber: number): Promise<GitHubReview[]> {
  const res = await fetch(`${GITHUB_API}/repos/${ORG}/${repo}/pulls/${prNumber}/reviews`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) return [];
  return res.json();
}

async function fetchAllReviews(users: Map<string, Contributor>, since: Date, now: Date) {
  console.log("🔍 Fetching Reviews submitted...");
  const allRepos = await fetchOrgRepos();
  const reviewSeen = new Set<string>();
  const BATCH_SIZE = 5;

  for (const repoName of allRepos) {
    const prs = await fetchRepoPRs(repoName, since);
    const prBatches = chunk(prs, BATCH_SIZE);
    for (const batch of prBatches) {
      const results = await Promise.all(
        batch.map((pr) => fetchPRReviews(repoName, pr.number).then((r) => ({ pr, reviews: r })))
      );
      for (const { pr, reviews } of results) {
        for (const review of reviews) {
          if (!review.user?.login || isBotUser(review.user) || review.user.login === pr.user.login) continue;
          if (!["APPROVED", "CHANGES_REQUESTED"].includes(review.state)) continue;
          const date = new Date(review.submitted_at);
          if (date < since || date > now) continue;
          const key = `${review.user.login}:${repoName}:${pr.number}`;
          if (reviewSeen.has(key)) continue;
          reviewSeen.add(key);
          addActivity(ensureUser(users, review.user), "Review submitted", review.submitted_at, POINTS["Review submitted"]!, {
            title: `Review on ${repoName}#${pr.number}`,
            link: review.html_url,
          });
        }
      }
    }
  }
}

async function fetchIssueTriagingActivities(users: Map<string, Contributor>, since: Date, now: Date) {
  console.log("🔍 Fetching Issue Triaging...");
  const allRepos = await fetchOrgRepos();
  for (const repoName of allRepos) {
    let page = 1;
    while (page <= 5) { // Fetch up to 500 events per repo for safety
      const res = await fetch(`${GITHUB_API}/repos/${ORG}/${repoName}/issues/events?per_page=100&page=${page}`, {
        headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" },
      });
      if (!res.ok) break;
      const events = await res.json();
      if (!events || events.length === 0) break;

      for (const event of events) {
        if (!event.actor || isBotUser(event.actor)) continue;
        const date = new Date(event.created_at);
        if (date < since || date > now) continue;

        if (event.event === "labeled") {
          addActivity(ensureUser(users, event.actor), "Issue labeled", event.created_at, POINTS["Issue labeled"]!, {
            title: `Labeled issue in ${repoName}`,
          });
        } else if (event.event === "assigned") {
          addActivity(ensureUser(users, event.actor), "Issue assigned", event.created_at, POINTS["Issue assigned"]!, {
            title: `Assigned issue in ${repoName}`,
          });
        } else if (event.event === "closed") {
          addActivity(ensureUser(users, event.actor), "Issue closed", event.created_at, POINTS["Issue closed"]!, {
            title: `Closed issue in ${repoName}`,
          });
        }
      }
      if (events.length < 100) break;
      page++;
      await sleep(1000);
    }
  }
}

async function generateRepoOverview(users: Map<string, Contributor>) {
  console.log("🔍 Generating Repo Overview...");
  const allRepos = await fetchOrgRepos();
  const overview: RepoStats[] = [];

  const now = new Date();
  const thirtyDaysAgo = daysAgo(30);
  const sixtyDaysAgo = daysAgo(60);

  for (const repoName of allRepos) {
    const res = await fetch(`${GITHUB_API}/repos/${ORG}/${repoName}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" },
    });
    if (!res.ok) continue;
    const r = await res.json();

    const currentStats = {
      issue_created: 0,
      pr_opened: 0,
      pr_merged: 0,
      currentTotalContribution: 0,
    };

    const previousStats = {
      pr_merged: 0,
    };

    for (const user of users.values()) {
      for (const act of user.raw_activities) {
        if (!act.link) continue;
        if (act.link.includes(`/${ORG}/${repoName}`)) {
          const date = new Date(act.occured_at);
          if (date >= thirtyDaysAgo && date <= now) {
            if (act.type === "Issue opened") currentStats.issue_created++;
            else if (act.type === "PR opened") currentStats.pr_opened++;
            else if (act.type === "PR merged") currentStats.pr_merged++;
            currentStats.currentTotalContribution++;
          } else if (date >= sixtyDaysAgo && date < thirtyDaysAgo) {
            if (act.type === "PR merged") previousStats.pr_merged++;
          }
        }
      }
    }

    overview.push({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      html_url: r.html_url,
      avatar_url: r.owner.avatar_url,
      current: currentStats,
      growth: {
        pr_merged: currentStats.pr_merged - previousStats.pr_merged,
      },
    });
    await sleep(200);
  }

  const outDir = path.join(process.cwd(), "public", "leaderboard");
  fs.writeFileSync(path.join(outDir, "overview.json"), JSON.stringify({ repos: overview }, null, 2));
  fs.writeFileSync(path.join(outDir, "repos.json"), JSON.stringify(overview, null, 2));
}


function loadExistingYearData(): ExistingYearData | null {
  try {
    const p = path.join(process.cwd(), "public", "leaderboard", "year.json");
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {}
  return null;
}

function mergeExistingActivities(users: Map<string, Contributor>, existing: ExistingYearData) {
  for (const entry of existing.entries) {
    const user = ensureUser(users, { login: entry.username, name: entry.name, avatar_url: entry.avatar_url });
    user.raw_activities.push(...(entry.raw_activities || []));
  }
}

function derivePeriod(source: YearData, days: number, period: string) {
  const cutoff = daysAgo(days);
  const entries = source.entries
    .map((entry: UserEntry) => {
      const acts = entry.raw_activities.filter((a) => new Date(a.occured_at) >= cutoff);
      if (acts.length === 0) return null;
      const breakdown: Record<string, { count: number; points: number }> = {};
      const daily: Record<string, DailyActivity> = {};
      let total = 0;
      for (const a of acts) {
        const day = a.occured_at.split("T")[0]!;
        total += a.points;
        breakdown[a.type] ??= { count: 0, points: 0 };
        breakdown[a.type]!.count++;
        breakdown[a.type]!.points += a.points;
        daily[day] ??= { date: day, count: 0, points: 0 };
        daily[day]!.count++;
        daily[day]!.points += a.points;
      }
      return {
        ...entry,
        total_points: total,
        activity_breakdown: breakdown,
        daily_activity: Object.values(daily),
        activities: acts.slice(0, 50),
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b as UserEntry).total_points - (a as UserEntry).total_points);

  fs.writeFileSync(
    path.join(process.cwd(), "public", "leaderboard", `${period}.json`),
    JSON.stringify(
      {
        period,
        updatedAt: Date.now(),
        startDate: iso(cutoff),
        endDate: iso(new Date()),
        entries,
      },
      null,
      2
    )
  );
}

function generateRecentActivities(source: YearData, days = 14) {
  const cutoff = daysAgo(days);
  const groups = new Map<string, RecentActivityItem[]>();
  for (const entry of source.entries) {
    for (const act of entry.raw_activities) {
      const day = act.occured_at.split("T")[0]!;
      if (new Date(day) < cutoff) continue;
      groups.set(day, groups.get(day) ?? []);
      groups.get(day)!.push({
        username: entry.username,
        name: entry.name,
        title: act.title ?? null,
        link: act.link ?? null,
        avatar_url: entry.avatar_url,
        points: act.points,
      });
    }
  }
  fs.writeFileSync(
    path.join(process.cwd(), "public", "leaderboard", "recent-activities.json"),
    JSON.stringify({ updatedAt: Date.now(), groups: Array.from(groups.entries()) }, null, 2)
  );
}

async function generateYear() {
  const now = new Date();
  const users = new Map<string, Contributor>();
  const existing = loadExistingYearData();
  const isIncremental = existing?.lastFetchedAt != null;
  const since = isIncremental ? new Date(existing!.lastFetchedAt) : daysAgo(365);

  console.log(`🚀 Starting Leaderboard Generation (${isIncremental ? "Incremental" : "Full"})`);

  for (const pr of await searchByDateChunks(`org:${ORG}+is:pr`, since, now)) {
    if (!isBotUser(pr.user))
      addActivity(ensureUser(users, pr.user), "PR opened", pr.created_at, POINTS["PR opened"]!, {
        title: pr.title,
        link: pr.html_url,
      });
  }
  for (const pr of await searchByDateChunks(`org:${ORG}+is:pr+is:merged`, since, now, 30, "merged")) {
    if (!isBotUser(pr.user))
      addActivity(ensureUser(users, pr.user), "PR merged", pr.closed_at!, POINTS["PR merged"]!, {
        title: pr.title,
        link: pr.html_url,
      });
  }
  for (const issue of await searchByDateChunks(`org:${ORG}+is:issue`, since, now)) {
    if (!isBotUser(issue.user))
      addActivity(ensureUser(users, issue.user), "Issue opened", issue.created_at, POINTS["Issue opened"]!, {
        title: issue.title,
        link: issue.html_url,
      });
  }

  await fetchAllReviews(users, since, now);
  await fetchIssueTriagingActivities(users, since, now);
  if (isIncremental) mergeExistingActivities(users, existing!);
  deduplicateAndRecalculate(users);

  const entries = Array.from(users.values())
    .filter((u) => u.total_points > 0)
    .sort((a, b) => b.total_points - a.total_points);
  const outDir = path.join(process.cwd(), "public", "leaderboard");
  fs.mkdirSync(outDir, { recursive: true });

  const yearData = {
    period: "year",
    updatedAt: Date.now(),
    lastFetchedAt: Date.now(),
    startDate: iso(daysAgo(365)),
    endDate: iso(now),
    entries,
  };
  fs.writeFileSync(path.join(outDir, "year.json"), JSON.stringify(yearData, null, 2));

  derivePeriod(yearData, 7, "week");
  derivePeriod(yearData, 30, "month");
  generateRecentActivities(yearData);
  await generateRepoOverview(users);
}


async function run() {
  if (!TOKEN) {
    console.error("⛔ GITHUB_TOKEN not set");
    process.exit(1);
  }
  await generateYear();
}

run();
