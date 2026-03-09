"use client";

import { useMemo, useState } from "react";
import type { DailyActivity } from "@/types/contributor";

interface ActivityHeatmapProps {
  dailyActivity: DailyActivity[];
  username: string;
}

interface HeatmapCell {
  date: string;
  count: number;
  points: number;
  level: number;
}

interface TooltipData {
  date: string;
  count: number;
  points: number;
  x: number;
  y: number;
}

export default function ActivityHeatmap({ dailyActivity }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Generate heatmap data for the last 365 days
  const heatmapData = useMemo(() => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 364); // 365 days including today

    // Create a map of date -> activity
    const activityMap = new Map<string, DailyActivity>();
    dailyActivity.forEach((activity) => {
      const dateKey = activity.date?.split("T")[0] || activity.date; // Get YYYY-MM-DD
      if (dateKey) {
        activityMap.set(dateKey, activity);
      }
    });

    // Generate all days for the past year
    const cells: HeatmapCell[] = [];
    const currentDate = new Date(oneYearAgo);

    while (currentDate <= today) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      const activity = activityMap.get(dateKey);

      const count = activity?.count || 0;
      const points = activity?.points || 0;

      // Calculate intensity level (0-4)
      let level = 0;
      if (count > 0) {
        if (count >= 10) level = 4;
        else if (count >= 7) level = 3;
        else if (count >= 4) level = 2;
        else level = 1;
      }

      cells.push({
        date: dateKey,
        count,
        points,
        level,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return cells;
  }, [dailyActivity]);

  // Group cells by week
  const weeks = useMemo(() => {
    const result: HeatmapCell[][] = [];
    let currentWeek: HeatmapCell[] = [];

    // Find the first Sunday (or start of week)
    const firstDate = new Date(heatmapData[0]?.date || new Date());
    const dayOfWeek = firstDate.getDay();

    // Add empty cells for days before the first date
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({ date: "", count: 0, points: 0, level: 0 });
    }

    heatmapData.forEach((cell) => {
      currentWeek.push(cell);

      // Start a new week on Sunday (day 6) or at the end
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add remaining cells
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: "", count: 0, points: 0, level: 0 });
      }
      result.push(currentWeek);
    }

    return result;
  }, [heatmapData]);

  // Get color based on level
  const getColor = (level: number): string => {
    const colors = {
      0: "bg-muted/30 dark:bg-muted/20", // No activity
      1: "bg-green-200 dark:bg-green-900/40", // Low
      2: "bg-green-400 dark:bg-green-700/60", // Medium
      3: "bg-green-600 dark:bg-green-500/80", // High
      4: "bg-green-700 dark:bg-green-400", // Very high
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  const handleMouseEnter = (cell: HeatmapCell, event: React.MouseEvent<HTMLDivElement>) => {
    if (!cell.date) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      date: cell.date,
      count: cell.count,
      points: cell.points,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // Calculate streaks
  const streaks = useMemo(() => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // We iterate backwards from today to find the current streak
    const sortedData = [...heatmapData].reverse();
    
    // For longest streak, we need chronological order
    const chronoData = [...heatmapData];

    // Longest streak
    chronoData.forEach((cell) => {
      if (cell.count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    // Current streak
    for (const cell of sortedData) {
      if (cell.count > 0) {
        currentStreak++;
      } else if (cell.date !== new Date().toISOString().split('T')[0]) {
        // If we hit a gap and it's not today (allow for today not being finished yet)
        break;
      }
    }

    return { currentStreak, longestStreak };
  }, [heatmapData]);

  const totalContributions = useMemo(() => heatmapData.reduce((acc, cell) => acc + cell.count, 0), [heatmapData]);
  
  const monthLabels = useMemo(() => {
    const labels: { month: string; offset: number }[] = [];
    let currentMonth = -1;
    weeks.forEach((week, index) => {
      const firstDay = week.find((day) => day.date);
      if (firstDay) {
        const date = new Date(firstDay.date + 'T00:00:00');
        if (date.getMonth() !== currentMonth) {
          currentMonth = date.getMonth();
          labels.push({ 
            month: date.toLocaleString('default', { month: 'short' }), 
            offset: index 
          });
        }
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="w-full">
      <div className="flex gap-8 mb-6">
        <div>
          <div className="text-2xl font-bold text-primary">{totalContributions}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Contributions in 2025</div>
        </div>
        <div className="border-l pl-8">
          <div className="text-2xl font-bold text-orange-500">{streaks.currentStreak} days</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Current Streak</div>
        </div>
        <div className="border-l pl-8">
          <div className="text-2xl font-bold text-blue-500">{streaks.longestStreak} days</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Longest Streak</div>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
        {/* Month labels */}
        <div className="flex mb-3 ml-10">
          {monthLabels.map((label, index) => (
            <div
              key={index}
              className="text-[10px] text-muted-foreground uppercase tracking-tighter"
              style={{
                position: "absolute",
                left: `${label.offset * 16 + 40}px`,
              }}
            >
              {label.month}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-2">
          {/* Day labels */}
          <div className="flex flex-col gap-1 text-[10px] text-muted-foreground justify-around pr-2 uppercase font-medium">
            <div className="h-3 flex items-center">Mon</div>
            <div className="h-3 flex items-center">Wed</div>
            <div className="h-3 flex items-center">Fri</div>
          </div>

          {/* Weeks */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((cell, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-sm transition-all duration-200 hover:ring-2 hover:ring-primary hover:scale-110 cursor-pointer ${
                      cell.date ? getColor(cell.level) : "bg-transparent"
                    }`}
                    onMouseEnter={(e) => handleMouseEnter(cell, e)}
                    onMouseLeave={handleMouseLeave}
                    title={cell.date ? `${cell.count} contributions on ${cell.date}` : ""}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-popover text-popover-foreground border rounded-md shadow-lg px-3 py-2 text-sm pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="font-semibold">
            {new Date(tooltip.date + 'T00:00:00').toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="text-muted-foreground">
            {tooltip.count} {tooltip.count === 1 ? "contribution" : "contributions"}
          </div>
          <div className="text-primary font-mono text-xs">
            +{tooltip.points} points
          </div>
        </div>
      )}
    </div>
  );
}
