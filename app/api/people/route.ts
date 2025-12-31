import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { coreTeamMembers, alumniMembers } from "@/lib/team-data";

interface DailyActivity { 
  date: string; 
  count: number; 
  points: number; 
}

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

/**
 * Calculates current and longest contribution streaks
 */
function calculateStreaks(dailyActivity: DailyActivity[]) {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  if (!dailyActivity || dailyActivity.length === 0) return { current: 0, longest: 0 };

  // Sort chrono
  const sortedDays = [...dailyActivity].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Longest
  sortedDays.forEach((day) => {
    if (day.count > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  });

  // Current
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  
  const reverseDays = [...sortedDays].reverse();
  let lastActiveIndex = -1;

  for (let i = 0; i < reverseDays.length; i++) {
    const day = reverseDays[i];
    if (day && day.count > 0 && (day.date === today || day.date === yesterday)) {
      lastActiveIndex = i;
      break;
    }
  }

  if (lastActiveIndex !== -1) {
    currentStreak = 1;
    for (let i = lastActiveIndex; i < reverseDays.length - 1; i++) {
      const currentDay = reverseDays[i];
      const nextDay = reverseDays[i + 1];
      
      if (!currentDay || !nextDay) break;

      const d1 = new Date(currentDay.date);
      const d2 = new Date(nextDay.date);
      const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays === 1 && nextDay.count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { current: currentStreak, longest: longestStreak };
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

          const entryWithStats = {
            ...entry,
            current_streak: streaks.current,
            longest_streak: streaks.longest,
            distribution
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