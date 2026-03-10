// types/contributor.ts

export interface Contributor {
  username: string;
  name: string | null;
  avatar_url: string | null;
  role?: string | null;
  total_points?: number;
  activity_breakdown?: Record<
    string,
    {
      count: number;
      points: number;
    }
  >;
  activities?: Activity[];
  raw_activities?: RawActivity[];
  daily_activity?: DailyActivity[];
}

export interface Activity {
  type: string;
  title?: string | null;
  link?: string | null;
  occured_at: string;
  points?: number;
}

export interface RawActivity {
  type: string;
  title?: string | null;
  link?: string | null;
  occured_at: string;
  points?: number;
}

export interface DailyActivity {
  date: string; // ISO string
  points: number;
  count: number;
}

export interface ContributorWithAvatar {
  username: string;
  avatar_url: string | null;
}

export interface ActivityItem {
  slug: string;
  contributor: string;
  contributor_name: string | null;
  contributor_avatar_url: string | null;
  contributor_role: string | null;
  occured_at: string;
  closed_at: string;
  title?: string | null;
  text?: string | null;
  link?: string | null;
  points: number | null;
}

export interface GlobalActivity {
  type: string;
  title?: string | null;
  link?: string | null;
  occured_at: string;
  points?: number;
  username: string;
  avatar_url: string | null;
  slug?: string;
}

