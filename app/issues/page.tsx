
import { getGlobalRecentActivities } from "@/lib/db";
import { getConfig } from "@/lib/config";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  return {
    title: `Issues Activity - ${config.meta.title}`,
    description: `Recent issue activity across ${config.org.name}.`,
  };
}

export default async function IssuesPage() {
  const activities = await getGlobalRecentActivities("Issue");
  
  // Filter for unique "Issue opened" events essentially, though listing all is fine.
  // The data structure returns "Issue opened" etc.

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Issue Tracker</h1>
        <p className="text-lg text-muted-foreground">
          Recent issue activity from our contributors
        </p>
      </div>

      <div className="space-y-4">
        {activities.map((act: any, idx: number) => (
          <div key={`${act.slug}-${idx}`} className="bg-card border rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-4">
                 <Link href={`/${act.username}`}>
                    <Image
                        src={act.avatar_url}
                        alt={act.username}
                        width={40}
                        height={40}
                        className="rounded-full border shadow-sm"
                    />
                 </Link>
                 <div>
                    <div className="font-semibold text-lg line-clamp-1">
                        <a href={act.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                         {act.title || "Untitled Issue"}
                        </a>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{act.username}</span> opened an issue on {new Date(act.occured_at).toLocaleDateString()}
                    </div>
                 </div>
            </div>
            
            <div className="flex-shrink-0">
                 <div className="bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono font-bold px-2 py-1 rounded text-sm whitespace-nowrap">
                   Issue Opened (+{act.points})
                 </div>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
            <div className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">
                No issue activity found recently.
            </div>
        )}
      </div>
    </div>
  );
}
