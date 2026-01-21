"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { Medal, Trophy, Filter, X, GitMerge, GitPullRequest, AlertCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";
import { sortEntries, type SortBy } from "@/lib/leaderboard";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ActivityTrendChart from "../../components/Leaderboard/ActivityTrendChart";
import { Input } from "@/components/ui/input";

export type LeaderboardEntry = {
  username: string;
  name: string | null;
  avatar_url: string | null;
  role?: string | null;
  total_points: number;
  activity_breakdown: Record<
    string,
    {
      count: number;
      points: number;
    }
  >;
  daily_activity?: Array<{
    date: string;
    points: number;
    count: number;
  }>;
};

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  period: "week" | "month" | "year";
  startDate: Date;
  endDate: Date;
  topByActivity: Record<
    string,
    Array<{
      username: string;
      name: string | null;
      avatar_url: string | null;
      points: number;
      count: number;
    }>
  >;
  hiddenRoles: string[];
}

// Activity type styling configuration
const activityStyles: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  "PR merged": {
    icon: GitMerge,
    bgColor: "bg-purple-500/10 dark:bg-purple-500/15",
    textColor: "text-purple-700 dark:text-purple-400",
    borderColor: "border-l-purple-500"
  },
  "PR opened": {
    icon: GitPullRequest,
    bgColor: "bg-blue-500/10 dark:bg-blue-500/15",
    textColor: "text-blue-700 dark:text-blue-400",
    borderColor: "border-l-blue-500"
  },
  "Issue opened": {
    icon: AlertCircle,
    bgColor: "bg-orange-500/10 dark:bg-orange-500/15",
    textColor: "text-orange-700 dark:text-orange-400",
    borderColor: "border-l-orange-500"
  }
};

const getActivityStyle = (activityName: string) => {
  return activityStyles[activityName] || {
    icon: () => null,
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    borderColor: "border-l-gray-400"
  };
};

export default function LeaderboardView({
  entries,
  period,
  startDate,
  endDate,
  topByActivity,
  hiddenRoles,
}: LeaderboardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  // sorting
  const [sortBy, setSortBy] = useState<SortBy>(() => {
    const s = searchParams.get('sort');
    if(s === 'pr_opened' || s === 'pr_merged' || s === 'issues')
      return s as SortBy;
    return 'points';
  });

  useEffect(() => {
    const s = searchParams.get('sort');
    setSortBy(s === 'pr_opened' || s === 'pr_merged' || s === 'issues' ? (s as SortBy) : 'points');
  }, [searchParams]);

  const [popoverOpen, setPopoverOpen] = useState(false);

  // Get selected roles from query params
  const selectedRoles = useMemo(() => {
    const rolesParam = searchParams.get("roles");
    if (rolesParam) {
      return new Set(rolesParam.split(","));
    }
    const allRoles = new Set<string>();
    entries.forEach((entry) => {
      if (entry.role && !hiddenRoles.includes(entry.role)) {
        allRoles.add(entry.role);
      }
    });
    return allRoles;
  }, [searchParams, entries, hiddenRoles]);

  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    entries.forEach((entry) => {
      if (entry.role) {
        roles.add(entry.role);
      }
    });
    return Array.from(roles).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    if (selectedRoles.size > 0) {
      filtered = filtered.filter(
        (entry) => entry.role && selectedRoles.has(entry.role)
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((entry) => {
        const name = (entry.name || entry.username).toLowerCase();
        const username = entry.username.toLowerCase();
        return name.includes(query) || username.includes(query);
      });
    }

    // applying sorting
    try{
      filtered = sortEntries(filtered, sortBy);
    } 
    catch(e){
      console.error('Error sorting entries:', e);
    }

    return filtered;
  }, [entries, selectedRoles, searchQuery, sortBy]);

  const toggleRole = (role: string) => {
    const newSelected = new Set(selectedRoles);
    if (newSelected.has(role)) {
      newSelected.delete(role);
    } else {
      newSelected.add(role);
    }
    updateRolesParam(newSelected);
  };

  const clearFilters = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const params = new URLSearchParams(searchParams.toString());
    if(isMobile){
      setSearchQuery("");
      setSortBy("points");
      return;
    }
    params.delete("roles");
    params.delete("sort");
    params.delete("order");

    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
    setSearchQuery("");
    setSortBy("points");
  };

  const updateRolesParam = (roles: Set<string>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (roles.size > 0) {
      params.set("roles", Array.from(roles).join(","));
    } else {
      params.delete("roles");
    }
    if(typeof window !== 'undefined') window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
  };

  const filteredTopByActivity = useMemo(() => {
    if (selectedRoles.size === 0) {
      return topByActivity;
    }

    const filtered: typeof topByActivity = {};

    for (const [activityName, contributors] of Object.entries(topByActivity)) {
      const filteredContributors = contributors.filter((contributor) => {
        const entry = entries.find((e) => e.username === contributor.username);
        return entry?.role && selectedRoles.has(entry.role);
      });

      if (filteredContributors.length > 0) {
        filtered[activityName] = filteredContributors;
      }
    }

    return filtered;
  }, [topByActivity, selectedRoles, entries]);

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return (
        <Trophy className="h-6 w-6 text-[#FFD700]" aria-label="1st place" />
      );
    if (rank === 2)
      return (
        <Medal className="h-6 w-6 text-[#C0C0C0]" aria-label="2nd place" />
      );
    if (rank === 3)
      return (
        <Medal className="h-6 w-6 text-[#CD7F32]/70" aria-label="3rd place" />
      );
    return null;
  };

  const periodLabels = {
    week: "Weekly",
    month: "Monthly",
    year: "Yearly",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-4xl text-[#50B78B] font-bold mb-2">
                  {periodLabels[period]} Leaderboard
                </h1>
                <p className="text-muted-foreground">
                  {filteredEntries.length} of {entries.length} contributors
                  {(selectedRoles.size > 0 || searchQuery) && " (filtered)"}
                </p>
              </div>

              {/* Filters & Search */}
              <div className="w-full md:w-auto md:ml-auto flex flex-col md:items-end lg:flex-row lg:items-center gap-2">
                <div className="flex items-center gap-2 w-full md:justify-end">
                  <div className="relative w-full md:w-[16rem]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search contributors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 w-full bg-white dark:bg-[#07170f] border border-[#50B78B]/60 dark:border-[#50B78B]/40 focus-visible:ring-2 focus-visible:ring-[#50B78B] shadow-sm"
                    />
                  </div>

                  <div className="hidden sm:flex">
                    <button
                      type="button"
                      className="h-9 px-4 rounded-md bg-[#50B78B] text-white text-sm font-medium flex items-center justify-center gap-2"
                      onClick={() => setPopoverOpen(true)}
                    >
                      <span>
                        {sortBy === "points"
                          ? "Total Points"
                          : sortBy === "pr_opened"
                          ? "PR Opened"
                          : sortBy === "pr_merged"
                          ? "PR Merged"
                          : "Issue Opened"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  {(selectedRoles.size > 0 || searchQuery || sortBy !== "points") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-9 hover:bg-[#50B78B]/20 cursor-pointer"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}

                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 border border-[#50B78B]/30 hover:bg-[#50B78B]/20 cursor-pointer"
                      >
                        <Filter className="h-4 w-4 mr-1.5" />
                        Filter
                        {selectedRoles.size > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[#50B78B] text-white">
                            {selectedRoles.size}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 bg-white dark:bg-[#07170f]">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Sort By</h4>
                          <div className="space-y-1">
                            {[
                              { key: 'points' as SortBy, label: 'Total Points' },
                              { key: 'pr_opened' as SortBy, label: 'PRs Opened' },
                              { key: 'pr_merged' as SortBy, label: 'PRs Merged' },
                              { key: 'issues' as SortBy, label: 'Issue Opened' },
                            ].map((opt) => {
                              const active = sortBy === opt.key;
                              return (
                                <button
                                  key={opt.key}
                                  onClick={() => {
                                    setPopoverOpen(false);
                                    setSortBy(opt.key);
                                    const params = new URLSearchParams(searchParams.toString());
                                    if(opt.key === 'points'){
                                      params.delete('sort');
                                      params.delete('order');
                                    }else{
                                      params.set('sort', opt.key);
                                      params.set('order', 'desc');
                                    }
                                    window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
                                  }}
                                  className={cn('w-full text-left px-3 py-1.5 cursor-pointer rounded-md text-sm transition-colors', active ? 'bg-[#50B78B] text-white font-semibold' : 'hover:bg-muted')}
                                >
                                  {opt.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Roles</h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {availableRoles.map((role) => (
                              <div key={role} className="flex items-center space-x-2">
                                <Checkbox
                                  id={role}
                                  checked={selectedRoles.has(role)}
                                  onCheckedChange={() => toggleRole(role)}
                                />
                                <label
                                  htmlFor={role}
                                  className="text-sm font-medium leading-none cursor-pointer"
                                >
                                  {role}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 mb-8 border-b">
            {(["week", "month", "year"] as const).map((p) => (
              <Link
                key={p}
                href={`/leaderboard/${p}`}
                className={cn(
                  "px-4 py-2 font-medium transition-colors border-b-2 relative outline-none",
                  period === p
                    ? "border-[#50B78B] text-[#50B78B] bg-linear-to-t from-[#50B78B]/10 to-transparent"
                    : "border-transparent text-muted-foreground hover:text-[#50B78B]"
                )}
              >
                {periodLabels[p]}
              </Link>
            ))}
          </div>

          {/* Leaderboard Entries */}
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {entries.length === 0
                  ? "No contributors with points in this period"
                  : "No contributors match the selected filters"}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;

                return (
                  <Card
                    key={entry.username}
                    className={cn(
                      "transition-all hover:shadow-md overflow-hidden",
                      isTopThree && "border-[#50B78B]/50"
                    )}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                        {/* Rank and Identity */}
                        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                          <div className="flex items-center justify-center size-10 sm:size-12 shrink-0">
                            {getRankIcon(rank) || (
                              <span className="text-xl sm:text-2xl font-bold text-[#50B78B]">
                                {rank}
                              </span>
                            )}
                          </div>

                          <Avatar className="size-12 sm:size-14 shrink-0 border-2 border-background shadow-sm">
                            <AvatarImage
                              src={entry.avatar_url || undefined}
                              alt={entry.name || entry.username}
                            />
                            <AvatarFallback className="bg-[#50B78B]/5 text-[#50B78B]">
                              {(entry.name || entry.username)
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* Mobile-only Points */}
                          <div className="flex flex-col ml-auto sm:hidden items-end">
                            <div className="text-2xl font-bold text-[#50B78B] leading-none">
                              {entry.total_points}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">
                              pts
                            </div>
                          </div>
                        </div>

                        {/* Info & Breakdown */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-base sm:text-lg font-bold truncate">
                               <Link href={`/${entry.username}`} className="hover:text-[#50B78B] transition-colors">
                                {entry.name || entry.username}
                               </Link>
                            </h3>
                            {entry.role && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#50B78B]/10 text-[#50B78B] font-medium border border-[#50B78B]/20 lowercase italic">
                                {entry.role}
                              </span>
                            )}
                          </div>

                          <a
                            href={`https://github.com/${entry.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-muted-foreground hover:text-[#50B78B] transition-colors flex items-center gap-1 mb-3"
                          >
                            @{entry.username}
                          </a>

                          <div className="flex flex-wrap gap-2">
                            {Object.entries(entry.activity_breakdown)
                              .sort((a, b) => {
                                const activityPriority: Record<string, number> = {
                                  "PR merged": 1,
                                  "PR opened": 2,
                                  "Issue opened": 3,
                                };
                                return (activityPriority[a[0]] ?? 99) - (activityPriority[b[0]] ?? 99);
                              })
                              .map(([activityName, data]) => {
                                const style = getActivityStyle(activityName);
                                const IconComponent = style.icon;
                                
                                return (
                                  <div
                                    key={activityName}
                                    className={cn(
                                      "text-[10px] sm:text-xs px-2.5 py-1 rounded-md border-l-2 flex items-center gap-1.5 transition-all",
                                      style.bgColor,
                                      style.borderColor
                                    )}
                                  >
                                    {IconComponent && (
                                      <IconComponent className={cn("w-3 h-3", style.textColor)} />
                                    )}
                                    <span className={cn("font-semibold", style.textColor)}>
                                      {activityName}
                                    </span>
                                    <span className="text-muted-foreground font-medium">
                                      {data.count}
                                    </span>
                                    {data.points > 0 && (
                                      <span className={cn("font-bold", style.textColor)}>
                                        (+{data.points})
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Chart & Desktop Points */}
                        <div className="hidden sm:flex items-center gap-6 shrink-0 border-l pl-6 border-border/50">
                          {entry.daily_activity && entry.daily_activity.length > 0 && (
                            <div className="opacity-80 hover:opacity-100 transition-opacity">
                              <ActivityTrendChart
                                dailyActivity={entry.daily_activity}
                                startDate={startDate}
                                endDate={endDate}
                                mode="points"
                              />
                            </div>
                          )}
                          
                          <div className="text-right min-w-[60px]">
                            <div className="text-3xl font-black text-[#50B78B] tracking-tight">
                              {entry.total_points}
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold leading-none mt-1">
                              points
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar - Top Contributors */}
        {Object.keys(filteredTopByActivity).length > 0 && (
          <div className="hidden xl:block w-80 shrink-0">
            <h2 className="text-xl font-bold mb-6">Top Performers</h2>
            <div className="space-y-4 sticky top-8">
              {Object.entries(filteredTopByActivity).map(([activityName, contributors]) => {
                  const style = getActivityStyle(activityName);
                  return (
                    <Card key={activityName} className="overflow-hidden p-0 border-[#50B78B]/10">
                      <CardContent className="p-0">
                        <div className={cn("px-4 py-2 border-b border-l-4", style.bgColor, style.borderColor)}>
                          <h3 className={cn("font-bold text-xs uppercase tracking-wider", style.textColor)}>
                            {activityName}
                          </h3>
                        </div>
                        <div className="p-2 space-y-1">
                          {contributors.slice(0, 3).map((contributor, index) => (
                            <Link
                              key={contributor.username}
                              href={`/${contributor.username}`}
                              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group"
                            >
                              <div className="flex items-center justify-center w-4 h-4 shrink-0">
                                {index === 0 ? <Trophy className="h-4 w-4 text-yellow-500" /> : <div className="text-xs font-bold text-muted-foreground">#{index + 1}</div>}
                              </div>
                              <Avatar className="h-8 w-8 shrink-0 border border-background shadow-xs">
                                <AvatarImage src={contributor.avatar_url || undefined} />
                                <AvatarFallback className="text-[10px]">
                                  {contributor.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate group-hover:text-[#50B78B] transition-colors leading-none mb-1">
                                  {contributor.name || contributor.username}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                  <span>{contributor.count} {contributor.count === 1 ? 'act' : 'acts'}</span>
                                  <span className="text-[#50B78B]">·</span>
                                  <span>{contributor.points} pts</span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}