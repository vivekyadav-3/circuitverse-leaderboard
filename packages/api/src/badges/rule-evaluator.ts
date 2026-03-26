import { Activity } from "../types/scraper";

export type BadgeRuleType = "count" | "total_points" | "streak";

export interface BadgeRule {
  type: BadgeRuleType;
  min: number;
  filter?: {
    activity_definitions?: string[];
    role?: string;
    date_from?: string;
    date_to?: string;
  };
}

export interface BadgeDefinition {
  slug: string;
  name: string;
  description: string;
  rule: BadgeRule;
  icon: string;
}

export class BadgeEvaluator {
  evaluate(
    activities: Activity[],
    definitions: BadgeDefinition[]
  ): string[] {
    const earnedBadges: string[] = [];

    for (const def of definitions) {
      if (this.meetsRule(activities, def.rule)) {
        earnedBadges.push(def.slug);
      }
    }

    return earnedBadges;
  }

  private meetsRule(activities: Activity[], rule: BadgeRule): boolean {
    const filtered = this.filterActivities(activities, rule.filter);

    switch (rule.type) {
      case "count":
        return filtered.length >= rule.min;
      case "total_points":
        const total = filtered.reduce((acc, act) => acc + act.points, 0);
        return total >= rule.min;
      case "streak":
        return this.calculateMaxStreak(filtered) >= rule.min;
      default:
        return false;
    }
  }

  private filterActivities(
    activities: Activity[],
    filter?: BadgeRule["filter"]
  ): Activity[] {
    if (!filter) return activities;

    return activities.filter((act) => {
      if (
        filter.activity_definitions &&
        !filter.activity_definitions.some((pattern) =>
          new RegExp(pattern).test(act.activity_definition)
        )
      ) {
        return false;
      }

      if (filter.date_from && act.occured_at < filter.date_from) return false;
      if (filter.date_to && act.occured_at > filter.date_to) return false;

      return true;
    });
  }

  private calculateMaxStreak(activities: Activity[]): number {
    if (activities.length === 0) return 0;

    const dates = new Set(
      activities.map((a) => new Date(a.occured_at).toISOString().split("T")[0])
    );
    const sortedDates = Array.from(dates).sort();

    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr);
      if (lastDate) {
        const diff =
          (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      maxStreak = Math.max(maxStreak, currentStreak);
      lastDate = currentDate;
    }

    return maxStreak;
  }
}
