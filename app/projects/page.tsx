
import { getRepositories } from "@/lib/db";
import { getConfig } from "@/lib/config";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  return {
    title: `Projects - ${config.meta.title}`,
    description: `Active repositories on ${config.org.name} Leaderboard.`,
  };
}

export default async function ProjectsPage() {
  const repos = await getRepositories();

  return (
    <div className="mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Projects</h1>
        <p className="text-lg text-muted-foreground">
          Repositories with the most activity this year
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => (
          <div key={repo.name} className="bg-card border rounded-lg p-6 shadow-sm hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-bold mb-4 break-words">
              <a 
                href={`https://github.com/${repo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-primary transition-colors"
                title={repo.name}
              >
               {repo.name.split('/')[1]}
              </a>
            </h2>
            <div className="text-sm text-muted-foreground mb-4">
              {repo.name.split('/')[0]}
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-t pt-4">
               <div className="text-center">
                 <div className="text-xl font-bold">{repo.prs}</div>
                 <div className="text-xs uppercase text-muted-foreground">PRs</div>
               </div>
               <div className="text-center">
                 <div className="text-xl font-bold">{repo.issues}</div>
                 <div className="text-xs uppercase text-muted-foreground">Issues</div>
               </div>
               <div className="text-center">
                 <div className="text-xl font-bold">{repo.contributorCount}</div>
                 <div className="text-xs uppercase text-muted-foreground">Devs</div>
               </div>
            </div>
          </div>
        ))}
      </div>
      
      {repos.length === 0 && (
         <p className="text-center text-muted-foreground mt-12">No project activity found yet.</p>
      )}
    </div>
  );
}
