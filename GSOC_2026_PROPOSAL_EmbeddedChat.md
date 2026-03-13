GSoC 2026 Proposal: Making EmbeddedChat More Reliable
Vivek Yadav
Rocket.Chat — EmbeddedChat Reliability & UX Improvements

Why I Started Working on EmbeddedChat
I want to improve EmbeddedChat so it feels more stable, reliable, and comfortable to use when embedded on real websites.
While contributing to the codebase, I noticed that EmbeddedChat is powerful but still has some rough edges. Message input can break when quoting, authentication sometimes gets stuck, and the UI feels less polished compared to the main Rocket.Chat client.
My goal is to focus on fixing these core problems so EmbeddedChat feels solid, predictable, and production-ready.

Issues I Ran Into While Using EmbeddedChat
1. Message Input Is Fragile
The current ChatInput.js relies heavily on string manipulation to handle quoting and editing. This breaks easily when formatting is involved or when users edit quoted messages.
I ran into this firsthand while fixing the quote duplication bug in PR #1100. Right now, quoting works by pasting text into the input field, which is fragile and hard to maintain.

2. Authentication Can Get Stuck
The useRCAuth hook uses basic boolean flags to track login state. It does not fully handle token expiration, reconnects, or network interruptions.
I’ve seen scenarios where users get stuck on “Connecting…” with no clear recovery path unless they refresh the page.
This feels like a reliability issue that should be handled more gracefully.

3. UX Feels Less Polished Than Core Client
Compared to the main Rocket.Chat web app, EmbeddedChat feels less refined. Some loading states are unclear, spacing is inconsistent, and the UI can feel jumpy when messages load.
Since EmbeddedChat lives inside other people’s websites, these issues can reflect poorly on the host product as well.

Why This Matters
EmbeddedChat is often someone’s first experience with Rocket.Chat. If it feels buggy or unreliable, that hurts trust in both Rocket.Chat and the product embedding it.
Improving reliability and UX will:
Make EmbeddedChat more stable in real-world use
Reduce frustration for users and developers
Make it easier for teams to confidently embed Rocket.Chat
I want to focus on making EmbeddedChat feel dependable, not just adding new features.

What I Plan to Improve (Small, Practical Changes)

1. Refactor Chat Input (Structured State Instead of Strings)
Instead of handling quotes through raw string edits like:
setInputText(`[ ](${msg.url}) ${msg.msg}`);

I plan to store structured input state, keeping quote metadata separate from message text:
interface InputState {
  text: string;
  attachments: Attachment[];
  quoting: {
    messageId: string;
    author: string;
    contentSnippet: string;
  } | null;
}
This will make quoting, editing, and formatting more stable and predictable.
2. Improve Authentication Flow
Rather than boolean flags, I want to treat authentication as a state machine, which makes reconnect and token handling easier to manage:
type AuthState =
  | "IDLE"
  | "CHECKING_TOKEN"
  | "AUTHENTICATED"
  | "ANONYMOUS"
  | "ERROR";

This will help prevent stuck states and improve recovery from network issues.


3. UX & Polish Improvements
I also plan to:
Fix quoting behavior more thoroughly
Improve reactions and attachment handling
Add clearer loading and feedback states
Reduce scroll jumps and UI jitter
Bring EmbeddedChat’s feel closer to the main Rocket.Chat client
How EmbeddedChat Works (Architecture)
This diagram shows how EmbeddedChat communicates with Rocket.Chat:
Auth Flow: Managed through useRCAuth
Input Flow: Controlled by ChatInput logic
State Management: Zustand store
Real-time Updates: DDP/REST streams
My work focuses mainly on improving Auth and Input, which directly impact reliability.
Timeline (12 Weeks)
Community Bonding (May 1 – May 26)
Study Rocket.Chat SDK internals
Review EmbeddedChat issues
Identify key problem areas
Set up and refine testing workflow
Phase 1 — Input System (May 27 – June 30)
Refactor ChatInput to use structured state
Improve quoting behavior
Add tests for tricky edge cases
Fix formatting inconsistencies
Phase 2 — Auth & Stability (July 1 – July 28)
Improve token resume logic
Fix reconnect behavior
Add clearer error handling
Improve loading and connection feedback
Phase 3 — UX Polish (July 29 – August 25)
Accessibility improvements
UI consistency and polish
Documentation and migration notes
Demo playground to showcase improvements
What I’ve Already Done
I’ve already been working in the EmbeddedChat codebase and contributing fixes.
PR #1100 — Quote Logic Fix
Fixed duplicated URLs and formatting issues in message quoting. This helped reveal deeper input state problems.
PR #1108 — Stability & Performance
Shipped 17 improvements, including:
Fixing memory leaks in TypingUsers and Media Recorder
Optimizing message rendering and permissions
Improving scroll behavior
Fixing emoji parsing issues
Auth Error Flow Improvements
Improved how login and connection errors are shown so users get clearer feedback instead of silent failures.
Why I Want to Work on This
I started using EmbeddedChat for a demo project and kept running into issues, especially with authentication getting stuck on “Connecting…”. At first, I thought it was my mistake, but after checking the code, I realized the problem was in the widget itself.
That’s why I began contributing. I fixed the quote duplication bug in PR #1100 and worked on multiple stability and performance issues in PR #1108. But I can see there’s still more to improve.
I’m not focused on adding flashy features. I want to make EmbeddedChat more reliable and stable, so developers can trust it in real-world projects.

I’ve already set up the Rocket.Chat dev environment, contributed real fixes, and tested EmbeddedChat in realistic scenarios. This project feels like a natural extension of the work I’m already doing.
My goal is simple:
Make EmbeddedChat more reliable, easier to maintain, and nicer to use.

Other Contributions
I’ve also contributed to CircuitVerse:
PR #55 — Contribution Streak Feature
PR #5442 — CAPTCHA spacing fix
PR #6438 — Notification Badge UI update

LINKS
Prototype Repo: https://github.com/vivekyadav-3/EmbeddedChat-Prototype
EmbeddedChat Repo: https://github.com/RocketChat/EmbeddedChat
GitHub: https://github.com/vivekyadav-3



