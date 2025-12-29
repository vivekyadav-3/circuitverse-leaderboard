
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContributorProfile, getAllContributorUsernames } from "@/lib/db";
import { getConfig } from "@/lib/config";
import ActivityHeatmap from "@/components/Leaderboard/ActivityHeatmap";
import type { Metadata } from "next";
import type { ActivityItem } from "@/types/contributor";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateStaticParams() {
  const usernames = await getAllContributorUsernames();
  return usernames.map((username: string) => ({
    username,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getContributorProfile(username);
  const config = getConfig();

  if (!profile) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${profile.contributor.name || username} - ${config.meta.title}`,
    description: `Contributor profile for ${username} on ${config.org.name} Leaderboard.`,
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getContributorProfile(username);

  if (!profile) {
    notFound();
  }

  const { contributor, activities, dailyActivity, totalPoints, stats } = profile;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/people" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <span className="mr-2">←</span> Back to People
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR: Profile & Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Image
                  src={contributor.avatar_url || '/default-avatar.png'}
                  alt={username}
                  width={140}
                  height={140}
                  className="rounded-2xl border-4 border-background shadow-lg"
                />
                {stats && stats.currentStreak > 0 && (
                  <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2 rounded-lg shadow-md animate-pulse-slow">
                    🔥 {stats.currentStreak}
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{contributor.name || username}</h1>
                <a 
                  href={`https://github.com/${username}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  @{username}
                </a>
              </div>

              {contributor.role && (
                <div className="bg-secondary text-secondary-foreground text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                  {contributor.role}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t">
              <div className="text-center">
                <div className="text-xl font-bold">{totalPoints}</div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-widest">Points</div>
              </div>
              <div className="text-center border-l">
                <div className="text-xl font-bold">{activities.length}</div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-widest">Activities</div>
              </div>
            </div>
            
            {stats && (
               <div className="mt-4 p-3 bg-secondary/30 rounded-lg text-center">
                  <div className="text-sm font-medium text-blue-600 flex items-center justify-center gap-1">
                    <span className="text-lg">🏆</span> Best Streak: {stats.longestStreak} days
                  </div>
               </div>
            )}
          </div>

          {/* Activity Distribution Breakdown */}
          {stats?.distribution && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Activity Distribution</h3>
              <div className="space-y-4">
                <DistributionBar label="Pull Requests" count={stats.distribution.prs} total={activities.length} color="bg-green-500" />
                <DistributionBar label="Issues" count={stats.distribution.issues} total={activities.length} color="bg-blue-500" />
                <DistributionBar label="Reviews & Others" count={stats.distribution.others} total={activities.length} color="bg-purple-500" />
              </div>
            </div>
          )}
        </div>

        {/* MAIN CONTENT: Heatmap & Timeline */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Heatmap Section */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-lg">Contribution History</h3>
               <div className="text-xs text-muted-foreground">in the last year</div>
            </div>
            <ActivityHeatmap dailyActivity={dailyActivity || []} username={username} />
          </div>

          {/* Activity Timeline */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl px-2">Recent Timeline</h3>
            <div className="space-y-4">
              {activities.map((act: ActivityItem, i: number) => (
                <TimelineItem key={`${act.slug}-${i}`} activity={act} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DistributionBar({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span>{label}</span>
        <span className="text-muted-foreground">{count} ({Math.round(percentage)}%)</span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  )
}

function TimelineItem({ activity }: { activity: ActivityItem }) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-all group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="font-semibold group-hover:text-primary transition-colors underline-offset-4 decoration-primary/30">
            {activity.link ? (
              <a href={activity.link} target="_blank" rel="noopener noreferrer">{activity.title || "Untitled Activity"}</a>
            ) : (
              activity.title || "Untitled Activity"
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground gap-2">
            <span className="px-1.5 py-0.5 rounded bg-secondary uppercase font-bold text-[8px] tracking-widest">
              {activity.slug.split('-')[1]?.replace('_', ' ')}
            </span>
            <span>•</span>
            <span>{new Date(activity.occured_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
        {activity.points && activity.points > 0 ? (
          <div className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
            +{activity.points} pts
          </div>
        ) : null}
      </div>
    </div>
  )
}
