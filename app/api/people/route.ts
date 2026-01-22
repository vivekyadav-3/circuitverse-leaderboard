import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { coreTeamMembers, alumniMembers } from "@/lib/team-data";
import { calculateStreaks, DailyActivity } from "@/lib/streak-utils";

interface ContributorEntry {
  username: string;
  name: string | null;
  avatar_url: string;
  role: string;
  total_points: number;
  activity_breakdown: Record<string, { count: number; points: number }>;
  daily_activity: DailyActivity[];
  current_streak?: number;
  longest_streak?: number;
  distribution?: {
    prs: number;
    issues: number;
    others: number;
    total: number;
  };
  top_repos?: string[];
  activities?: any[];
  raw_activities?: Array<{ type: string; occured_at: string; title: string; link: string; points: number }>;
}

/**
 * Extracts repository name from a GitHub link
 */
function getRepoName(link: string): string | undefined {
  if (!link) return undefined;
  const match = link.match(/github\.com\/CircuitVerse\/([^/]+)/);
  return match ? match[1] : undefined;
}

/**
 * Categorizes activity names into Pull Requests, Issues, or Others
 */
function getActivityCategory(activityName: string): 'prs' | 'issues' | 'others' {
  const name = activityName.toLowerCase();
  if (name.includes('pr') || name.includes('pull request')) return 'prs';
  if (name.includes('issue')) return 'issues';
  return 'others';
}

interface LeaderboardData {
  period: string;
  updatedAt: number;
  entries: ContributorEntry[];
}

export async function GET() {
  try {
    const publicPath = path.join(process.cwd(), 'public', 'leaderboard');
    
    const files = fs.readdirSync(publicPath).filter(file => file.endsWith('.json') && file !== 'recent-activities.json');
    
    const allContributors = new Map<string, ContributorEntry>();
    let latestUpdatedAt = 0;

    for (const file of files) {
      try {
        const filePath = path.join(publicPath, file);
        const data: LeaderboardData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        if (data.updatedAt > latestUpdatedAt) {
          latestUpdatedAt = data.updatedAt;
        }

        for (const entry of data.entries || []) {
          const username = entry.username.toLowerCase();

          const isBot = username.endsWith('[bot]') || 
                       username.endsWith('-bot') || 
                       username.endsWith('_bot') ||
                       username === 'dependabot' ||
                       username === 'renovate' ||
                       username === 'github-actions' ||
                       username.startsWith('renovate[') ||
                       username.startsWith('dependabot[');
          
          if (isBot) continue;

          // Calculate streaks server-side
          const streaks = calculateStreaks(entry.daily_activity);
          
          // Calculate activity distribution
          const distribution = { prs: 0, issues: 0, others: 0, total: 0 };
          Object.entries(entry.activity_breakdown || {}).forEach(([name, data]) => {
            const category = getActivityCategory(name);
            const count = (data as { count: number; points: number }).count;
            distribution[category] += count;
            distribution.total += count;
          });

          // Calculate top repositories
          const repoCounts = new Map<string, number>();
          const rawActivities = entry.activities || entry.raw_activities || [];
          rawActivities.forEach((activity) => {
            const repo = getRepoName(activity.link);
            if (repo) {
              repoCounts.set(repo, (repoCounts.get(repo) || 0) + 1);
            }
          });

          const topRepos = Array.from(repoCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name]) => name);

          const entryWithStats = {
            ...entry,
            activities: rawActivities,
            current_streak: streaks.current,
            longest_streak: streaks.longest,
            distribution,
            top_repos: topRepos
          };

          const existing = allContributors.get(entry.username);
          if (!existing || entry.total_points > existing.total_points) {
            allContributors.set(entry.username, entryWithStats);
          }
        }
      } catch (error) {
        console.error(`Error reading ${file}:`, error);
      }
    }

    const people = Array.from(allContributors.values())
      .sort((a, b) => b.total_points - a.total_points);

    return NextResponse.json({
      updatedAt: latestUpdatedAt,
      people,
      coreTeam: coreTeamMembers,
      alumni: alumniMembers
    });
  } catch (error) {
    console.error('Error fetching people:', error);
    return NextResponse.json(
      { error: 'Failed to fetch people' },
      { status: 500 }
    );
  }
}
