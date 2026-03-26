import { Activity, BaseScraper, ScrapingContext } from "../types/scraper";

export class ScraperPipeline {
  private scrapers: BaseScraper[] = [];

  constructor(private ctx: ScrapingContext) {}

  register(scraper: BaseScraper) {
    this.scrapers.push(scraper);
    this.ctx.logger.info(`Registered scraper: ${scraper.name}`);
  }

  async run(): Promise<Activity[]> {
    this.ctx.logger.info("Starting Scraper Pipeline...");

    const allActivities: Activity[][] = await Promise.all(
      this.scrapers.map(async (scraper) => {
        try {
          this.ctx.logger.info(`Running scraper: ${scraper.name}`);
          return await scraper.scrape(this.ctx);
        } catch (error) {
          this.ctx.logger.error(`Error in scraper ${scraper.name}:`, error);
          return [];
        }
      })
    );

    const merged = allActivities.flat();
    this.ctx.logger.info(
      `Scraping complete. Total unique activities found: ${merged.length}`
    );

    return merged;
  }
}
