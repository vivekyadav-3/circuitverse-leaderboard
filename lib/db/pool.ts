export interface DbConfig {
  url: string;
  authToken?: string;
  maxSessions?: number;
}

export class ConnectionPool {
  private static instance: ConnectionPool;
  private pool: any[] = [];
  private maxSessions: number = 20;

  private constructor(private config: DbConfig) {
    this.maxSessions = config.maxSessions || 20;
    this.initializePool();
  }

  public static getInstance(config: DbConfig): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool(config);
    }
    return ConnectionPool.instance;
  }

  private async initializePool() {
    process.stdout.write(`Initializing LibSQL connection pool with ${this.maxSessions} sessions...\n`);
    for (let i = 0; i < 5; i++) {
      this.pool.push(this.createConnection());
    }
  }

  private createConnection(): any {
    return {
      execute: async (sql: string, params?: any[]) => {
        console.log(`[DB Pool] Executing query: ${sql.substring(0, 50)}...`);
        return { rows: [] };
      },
      close: async () => {
        console.log("[DB Pool] Connection closed.");
      },
    };
  }

  public async acquire(): Promise<any> {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createConnection();
  }

  public async release(conn: any) {
    if (this.pool.length < this.maxSessions) {
      this.pool.push(conn);
    }
  }
}
