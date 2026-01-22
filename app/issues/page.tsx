
import { getGlobalRecentActivities } from "@/lib/db";
import { getConfig } from "@/lib/config";
import type { Metadata } from "next";
import IssuesView from "@/components/Issues/IssuesView";

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  return {
    title: `Issues Activity - ${config.meta.title}`,
    description: `Recent issue activity across ${config.org.name}.`,
  };
}

export default async function IssuesPage() {
  const activities = await getGlobalRecentActivities("Issue");
  
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-12 text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Issue <span className="text-primary italic">Tracker</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time feed of community contributions through issues, bug reports, and features.
        </p>
      </div>

      <IssuesView initialActivities={activities} />
    </div>
  );
}
