import {
  ActivityGroup,
  getMonthlyActivityBuckets,
  getPreviousMonthActivityCount,
  getRecentActivitiesGroupedByType,
  getReposOverview,
} from "@/lib/db";
import { getConfig } from "@/lib/config";
import HomeDashboard from "@/components/home-dashboard";

export default async function Home() {
  const config = getConfig();

  const totalCount = (groups: ActivityGroup[]) =>
    groups.reduce((sum, g) => sum + g.activities.length, 0);

  const week = await getRecentActivitiesGroupedByType("week");
  const month = await getRecentActivitiesGroupedByType("month");
  const previousMonthCount = await getPreviousMonthActivityCount();
  const bucketData = await getMonthlyActivityBuckets();

  const reposOverview = await getReposOverview();

  const overviewData = {
    totalMonth: totalCount(month),
    week,
    month,
    previousMonthCount,
    bucketData,
    config,
    reposData: {
      reposOverview
    }
  };

<<<<<<< HEAD
        <section className="space-y-6 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#50B78B]">
              Recent Activities
            </h2>
            <div className="flex items-center gap-4">
               <Link
                href="/people"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                Active People
                </Link>
                <Link
                href="/leaderboard"
                className="flex items-center gap-2 text-sm font-medium text-[#50B78B]"
                >
                View Leaderboard
                <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
          </div>

          {week.length === 0 ? (
            <div className="rounded-2xl border p-10 text-center text-zinc-500">
              No activity in this period
            </div>
          ) : (
            <div className="space-y-8">
              {week.map((group) => (
                <PaginatedActivitySection
                  key={group.activity_definition}
                  group={group}
                  itemsPerPage={10}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
=======
  // 3. Pass data to the interactive dashboard
  return <HomeDashboard overviewData={overviewData} />;
}
>>>>>>> upstream/main
