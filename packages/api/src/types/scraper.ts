export interface Activity {
  slug: string;
  contributor: string;
  activity_definition: string;
  title: string;
  occured_at: string;
  link: string;
  points: number;
  meta: Record<string, any>;
}

export interface Contributor {
  username: string;
  name: string;
  avatar_url: string;
  role: "core" | "contributor" | "alumni";
  last_active: string;
}

export interface ScrapingContext {
  token: string;
  organization: string;
  repositories: string[];
  logger: {
    info: (msg: string) => void;
    error: (msg: string, err?: any) => void;
  };
}

export abstract class BaseScraper {
  abstract name: string;
  abstract scrape(ctx: ScrapingContext): Promise<Activity[]>;
}
