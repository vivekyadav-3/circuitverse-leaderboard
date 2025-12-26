import Link from "next/link";
import { getConfig } from "@/lib/config";
import Image from "next/image";

// Simple icon components
const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function Footer() {
  const config = getConfig();
  
  return (
    <footer className="border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-900/50 py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Image 
                src={config.org.logo_url} 
                alt={config.org.name} 
                width={32} 
                height={32} 
                className="rounded-md"
              />
              {config.org.name}
            </Link>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              {config.org.description}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/leaderboard" className="hover:text-primary transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/people" className="hover:text-primary transition-colors">
                  People
                </Link>
              </li>
              <li>
                <a 
                    href="https://circuitverse.org/about" 
                    target="_blank" 
                    rel="noreferrer"
                    className="hover:text-primary transition-colors"
                >
                    About CircuitVerse
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              {config.org.socials?.github && (
                <a
                  href={config.org.socials.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-[#50B78B] transition-colors"
                  aria-label="GitHub"
                >
                  <GithubIcon className="h-5 w-5" />
                </a>
              )}
               {config.org.socials?.email && (
                <a
                  href={`mailto:${config.org.socials.email}`}
                  className="text-muted-foreground hover:text-[#50B78B] transition-colors"
                  aria-label="Email"
                >
                  <MailIcon className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-zinc-200 dark:border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {config.org.name}. All rights reserved.</p>
          <p>
            Powered by <a href="https://github.com/CircuitVerse/CircuitVerse-Leaderboard-GSOC" className="hover:text-primary underline decoration-dotted">Leaderboard</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
