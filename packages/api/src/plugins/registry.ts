import { BaseScraper, ScrapingContext } from "../types/scraper";

export interface Plugin {
  name: string;
  version: string;
  setup: (ctx: ScrapingContext) => Promise<void>;
  scrape: (ctx: ScrapingContext) => Promise<any[]>;
}

export class PluginRegistry {
  private plugins: Plugin[] = [];

  constructor(private ctx: ScrapingContext) {}

  register(plugin: Plugin) {
    this.plugins.push(plugin);
    this.ctx.logger.info(`Loaded plugin: ${plugin.name} v${plugin.version}`);
  }

  async initialize() {
    this.ctx.logger.info("Initializing Plugins...");
    for (const plugin of this.plugins) {
      this.ctx.logger.info(`Running setup for ${plugin.name}...`);
      await plugin.setup(this.ctx);
    }
    this.ctx.logger.info("Ready.");
  }

  async scrapeAll(): Promise<any[]> {
    const results: any[][] = await Promise.all(
      this.plugins.map(async (plugin) => {
        try {
          this.ctx.logger.info(`Scraping from ${plugin.name}...`);
          return await plugin.scrape(this.ctx);
        } catch (error) {
          this.ctx.logger.error(`Plugin ${plugin.name} failed:`, error);
          return [];
        }
      })
    );
    return results.flat();
  }
}
