import Image from "next/image";
import Link from "next/link";
import { getConfig } from "@/lib/config";
import type { Metadata } from "next";
import { getAllContributorsWithAvatars, getLeaderboard } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  const people = await getAllContributorsWithAvatars();
  return {
    title: `People - ${config.meta.title}`,
    description: `Meet the ${people.length} contributors who make ${config.org.name} possible.`,
    openGraph: {
      title: `People - ${config.meta.title}`,
      description: `Meet the ${people.length} contributors who make ${config.org.name} possible.`,
      url: `${config.meta.site_url}/people`,
      siteName: config.meta.title,
      images: [config.meta.image_url],
    },
  };
}

export default async function PeoplePage() {
  const config = getConfig();
  const people = await getAllContributorsWithAvatars();
  // Get updatedAt from one of the leaderboard files, or just use current time if not critical
  const leaderboard = await getLeaderboard(); 
  // We can't easily get global updated time from just avatars, so maybe getLeaderboard() is better to get full data then map.
  // Actually, getAllContributorsWithAvatars calls getLeaderboard internally.
  // Let's just use the length for now and skip exact updated time for simplicity, or assume relatively fresh.
  
  return (
    <div className="mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Our People</h1>
        <p className="text-lg text-muted-foreground">
          Meet the {people.length} amazing contributors who make {config.org.name} possible
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
        {people.map((p: any) => (
          <Link key={p.username} href={`/${p.username}`} className="group block">
            <div className="flex flex-col items-center gap-2 p-4 hover:bg-muted/50 rounded-lg transition-colors">
              <Image 
                src={p.avatar_url} 
                alt={p.username} 
                width={96} 
                height={96} 
                className="rounded-full border-2 border-transparent group-hover:border-primary transition-all" 
              />
              <div className="text-sm text-center">
                <div className="font-medium group-hover:text-primary transition-colors">{p.username}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {people.length === 0 && (
        <p className="text-center text-sm text-muted-foreground mt-8">
          No contributors found yet. Try again in a bit.
        </p>
      )}
    </div>
  );
}
