"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, Calendar, MessageSquare, Tag, UserPlus, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import type { GlobalActivity } from "@/types/contributor";

interface IssuesViewProps {
  initialActivities: GlobalActivity[];
}

export default function IssuesView({ initialActivities }: IssuesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const filteredActivities = useMemo(() => {
    let result = [...initialActivities];

    // Filter by type
    if (typeFilter !== "all") {
      result = result.filter(act => 
        act.type.toLowerCase().includes(typeFilter.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(act => 
        act.title?.toLowerCase().includes(query) || 
        act.username.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.occured_at).getTime();
      const dateB = new Date(b.occured_at).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [initialActivities, searchQuery, typeFilter, sortBy]);

  const activityTypes = [
    { value: "all", label: "All Activities" },
    { value: "opened", label: "Issue Opened" },
    { value: "closed", label: "Issue Closed" },
    { value: "labeled", label: "Issue Labeled" },
    { value: "assigned", label: "Issue Assigned" },
  ];

  return (
    <div className="space-y-8">
      {/* Filters Hub */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues or contributors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="w-full sm:w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Activity Type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Showing {filteredActivities.length} issue events</span>
          {searchQuery || typeFilter !== "all" ? (
            <button 
              onClick={() => { setSearchQuery(""); setTypeFilter("all"); }}
              className="text-primary hover:underline ml-2"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {filteredActivities.map((act, idx) => (
          <ActivityCard key={`${act.username}-${idx}`} activity={act} />
        ))}
        
        {filteredActivities.length === 0 && (
          <div className="text-center py-20 bg-card border border-dashed rounded-xl">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-muted-foreground">No activities found</h3>
            <p className="text-sm text-muted-foreground/60">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: GlobalActivity }) {
  const getTypeStyles = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('opened')) return { color: 'text-emerald-600 bg-emerald-500/10', icon: <MessageSquare className="h-4 w-4" />, label: 'Opened' };
    if (t.includes('closed')) return { color: 'text-purple-600 bg-purple-500/10', icon: <CheckCircle2 className="h-4 w-4" />, label: 'Closed' };
    if (t.includes('labeled')) return { color: 'text-blue-600 bg-blue-500/10', icon: <Tag className="h-4 w-4" />, label: 'Labeled' };
    if (t.includes('assigned')) return { color: 'text-orange-600 bg-orange-500/10', icon: <UserPlus className="h-4 w-4" />, label: 'Assigned' };
    return { color: 'text-zinc-600 bg-zinc-500/10', icon: <MessageSquare className="h-4 w-4" />, label: 'Issue' };
  };

  const styles = getTypeStyles(activity.type);

  return (
    <div className="bg-card border rounded-xl p-5 hover:border-primary/40 transition-all group shadow-sm">
      <div className="flex items-start gap-4">
        <Link href={`/${activity.username}`} className="shrink-0">
          <div className="relative">
            <Image
              src={activity.avatar_url || '/default-avatar.png'}
              alt={activity.username}
              width={48}
              height={48}
              className="rounded-full border-2 border-background shadow-sm group-hover:scale-105 transition-transform"
            />
          </div>
        </Link>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link href={`/${activity.username}`} className="font-bold text-sm hover:text-primary transition-colors">
                {activity.username}
              </Link>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.color}`}>
                {styles.icon}
                {styles.label}
              </span>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(activity.occured_at).toLocaleDateString(undefined, { 
                month: 'short', day: 'numeric', year: 'numeric' 
              })}
            </div>
          </div>

          <div className="text-lg font-semibold tracking-tight line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            <a href={activity.link || '#'} target="_blank" rel="noopener noreferrer">
              {activity.title || "Untitled Issue Activity"}
            </a>
          </div>

          <div className="flex items-center justify-between pt-2">
             <div className="text-xs text-muted-foreground">
                points earned: <span className="font-bold text-foreground">+{activity.points || 0}</span>
             </div>
             <a 
                href={activity.link || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View on GitHub ↗
              </a>
          </div>
        </div>
      </div>
    </div>
  );
}
