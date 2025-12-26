
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContributorProfile, getAllContributorUsernames } from "@/lib/db";
import { getConfig } from "@/lib/config";
import type { Metadata } from "next";

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

  const { contributor, activities, totalPoints } = profile;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Link href="/people" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Back to People
        </Link>
      </div>

      <div className="bg-card border rounded-lg p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Image
            src={contributor.avatar_url}
            alt={username}
            width={128}
            height={128}
            className="rounded-full border-4 border-background shadow-md"
          />
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold">{contributor.name || username}</h1>
            <a 
              href={`https://github.com/${username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors block"
            >
              @{username}
            </a>
            {contributor.role && (
                <span className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                    {contributor.role}
                </span>
            )}
            <div className="flex gap-4 mt-2 justify-center md:justify-start">
               <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalPoints}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Points</div>
               </div>
               <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{activities.length}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Activities</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
      
      <div className="space-y-4">
        {activities.map((act: any) => (
          <div key={act.slug} className="bg-card border rounded-md p-4 flex items-start justify-between hover:border-primary/50 transition-colors">
            <div>
              <div className="font-semibold text-lg">{act.title || act.activity_name || "Untitled Activity"}</div>
              <div className="text-sm text-muted-foreground">
                <span className="capitalize">{act.slug.split('-')[1]?.replace('_', ' ')}</span> • {new Date(act.occured_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                 <div className="bg-primary/10 text-primary font-mono font-bold px-2 py-1 rounded text-sm">
                    +{act.points} pts
                 </div>
                 {act.link && (
                    <a href={act.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                        View on GitHub
                    </a>
                 )}
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
            <div className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">
                No recent activity found.
            </div>
        )}
      </div>
    </div>
  );
}
