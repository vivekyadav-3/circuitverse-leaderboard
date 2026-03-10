# 🎯 GSoC 2026 Contribution Plan - CircuitVerse Leaderboard

**Contributor:** Vivek Yadav  
**Project:** CircuitVerse Leaderboard  
**Date:** December 29, 2025  
**Demo:** https://circuitverse-leaderboard.vercel.app/

---

## 📋 Overview

This document outlines my contribution plan for the CircuitVerse Leaderboard project as part of my GSoC 2026 preparation. The goal is to enhance the leaderboard system with better visualizations, improved code quality, and new features that benefit the CircuitVerse community.

---

## 🎯 Contribution Goals

### **Phase 1: Code Quality & Bug Fixes** ✅ **COMPLETED**

#### 1.1 Fix TypeScript Lint Errors

- **Status:** ✅ Complete
- **Priority:** High
- **Tasks:**
  - [x] Fix `any` type usage in `app/people/page.tsx`
  - [x] Add proper TypeScript interfaces for contributor data
  - [x] Remove unused variables and imports
  - [x] Ensure all components have proper type definitions

#### 1.2 Improve Activity Line Card Component

- **Status:** ✅ Complete
- **Priority:** High
- **Tasks:**
  - [x] Add loading states for better UX
  - [x] Implement error boundaries
  - [x] Add accessibility attributes (ARIA labels)
  - [x] Optimize chart rendering performance
  - [x] Add unit tests for the component

---

### **Phase 2: Feature Enhancements** 🚀 **IN PROGRESS**

#### 2.1 Enhanced Activity Visualization ✅ **COMPLETED**

- **Status:** ✅ Complete
- **Priority:** High
- **Tasks:**
  - [x] Add daily activity heatmap (GitHub-style contribution graph)
  - [x] Implement activity streak tracking (Current 🔥 & Longest 🏆)
  - [x] Add Activity Distribution analytics (PRs vs Issues breakdown)
  - [x] Create modern 2-column dashboard layout for user profiles
  - [x] Fix duplicate key warnings in timeline iteration

**Completed Feature:**

- ✅ **Profile V2 Dashboard** - Professional Contributor Overhaul
  - **Social Streaks:** Implemented Current and Longest streak calculation logic.
  - **Activity Distribution:** Visual progress bars for contribution types.
  - **Refined Heatmap:** month-labels navigation and data-rich tooltips.
  - **Timeline UI:** Grouped activity logs with distinct status badges.
  - **Light/Dark Mode:** 100% theme compatibility and accessibility verified.
  - **Type Safety:** 100% TypeScript coverage for all data aggregation.

#### 2.2 Contributor Profile Enhancements

- **Status:** Planned
- **Priority:** Medium
- **Tasks:**
  - [x] Add individual contributor profile pages (Already exists)
  - [x] Display contribution history and trends (Heatmap added)
  - [ ] Show badges and achievements
  - [ ] Add "Currently Working On" section
  - [ ] Implement stale PR warnings

#### 2.3 Leaderboard Features

- **Status:** Planned
- **Priority:** High
- **Tasks:**
  - [ ] Add filtering by activity type
  - [ ] Implement search functionality
  - [ ] Add role-based filtering (maintainer, contributor, etc.)
  - [ ] Create custom date range selection
  - [ ] Add export functionality (CSV, JSON)

---

### **Phase 3: Advanced Features** 🌟

#### 3.1 Gamification & Badges

- **Status:** Planned
- **Priority:** Medium
- **Tasks:**
  - [ ] Implement badge system (EOD streak, PR master, etc.)
  - [ ] Add achievement milestones
  - [ ] Create leaderboard tiers (Bronze, Silver, Gold)
  - [ ] Add progress tracking towards next tier

#### 3.2 Analytics Dashboard

- **Status:** Planned
- **Priority:** Low
- **Tasks:**
  - [ ] Add project-wide analytics
  - [ ] Implement PR turn-around time tracking
  - [ ] Create issue resolution metrics
  - [ ] Add team collaboration insights

#### 3.3 Notifications & Alerts

- **Status:** Planned
- **Priority:** Low
- **Tasks:**
  - [ ] Add email notifications for achievements
  - [ ] Implement weekly digest emails
  - [ ] Create Slack/Discord integration
  - [ ] Add RSS feed for leaderboard updates

---

## 🤝 Community Collaboration & Feedback

Actively engaging with the CircuitVerse community to ensure features align with organization needs.

- **Status:** 🔄 Ongoing
- **Interactions:**
  - **Feedback Iteration:** Refactored Profile UI from V1 to V2 based on design mockups provided by community members (**Utpal Sen**).
  - **Conflict Resolution:** Proactively discussing overlapping PRs with other contributors (**Atharva Raut**) to coordinate efforts and maximize project value.
  - **Feature Validation:** Demonstrated new components (Heatmap, Streaks) via video walkthroughs in both Light and Dark modes for review. Acknowledged feedback on correct maintainer roles and communication channels.
  - **Community Protocol:** Aligned communication strategy to use project-specific channels (e.g., `#leaderboard`) for technical updates, ensuring proper visibility for core maintainers (**Aboobacker MK**).
  - **Bug Responsiveness:** Immediately identified and resolved technical debt (Duplicate key warnings) reported during community testing.

---

## 📝 Active Issues & PRs

### **Issue #49: Contribution Streaks** 🔥

- **Status:** 📋 Created (Dec 30, 2025)
- **Link:** https://github.com/CircuitVerse/community-dashboard/issues/49
- **Description:** Add GitHub-style streak tracking to user profiles
- **Next Step:** Awaiting assignment, then submit PR

### **Issue #50: Activity Distribution** 📊

- **Status:** ✅ **COMPLETED** (Jan 29, 2026)
- **Description:** Implemented PR vs Issue breakdown with dynamic progress bars on user profiles.

### **Issue #51: Profile Dashboard V2** 🎨

- **Status:** ✅ **COMPLETED** (Jan 29, 2026)
- **Description:** 2-column layout, enhanced heatmap integration, and "Project Focus" repository badges.

---

## 🛠️ Technical Improvements

### Code Quality

- [ ] Achieve 100% TypeScript strict mode compliance
- [ ] Add comprehensive unit tests (target: 80% coverage)
- [ ] Implement E2E tests with Playwright
- [ ] Set up pre-commit hooks for linting and formatting
- [ ] Add Prettier configuration

### Performance

- [ ] Optimize chart rendering with React.memo
- [ ] Implement virtual scrolling for large contributor lists
- [ ] Add image optimization for avatars
- [ ] Implement caching strategies for API calls
- [ ] Add loading skeletons for better perceived performance

### Accessibility

- [ ] Ensure WCAG 2.1 AA compliance
- [ ] Add keyboard navigation support
- [ ] Implement screen reader compatibility
- [ ] Add high contrast mode support
- [ ] Test with accessibility tools (axe, Lighthouse)

### Documentation

- [ ] Add comprehensive API documentation
- [ ] Create component documentation with Storybook
- [ ] Write contribution guidelines
- [ ] Add architecture decision records (ADRs)
- [ ] Create video tutorials for setup

---

## 📊 Current Progress

### Completed ✅

- Initial project setup and exploration
- Understanding of codebase architecture
- Identification of improvement areas

### In Progress 🔄

- Fixing TypeScript lint errors
- Improving Activity Line Card component
- Adding proper type definitions

### Planned 📅

- All Phase 2 and Phase 3 features
- Comprehensive testing suite
- Documentation improvements

---

## 🎓 Learning Objectives

Through this project, I aim to:

1. Master Next.js 15 App Router and React 19
2. Gain expertise in data visualization with Recharts
3. Learn GitHub API integration best practices
4. Improve TypeScript skills with complex type systems
5. Understand open-source contribution workflows
6. Practice writing maintainable, scalable code

---

## 📝 Notes

- All contributions will follow the project's coding standards
- Each feature will include tests and documentation
- Regular communication with maintainers via Slack
- Small, focused PRs for easier review
- Conventional commit messages for clarity
- **Channel Specificity:** Post technical updates for the Leaderboard in the `#leaderboard` Slack channel rather than general GSoC/Community channels.
- **Maintainer Respect:** Direct specific technical queries to project-leads (e.g., Aboobacker MK) and allow community members to engage without pinning "Maintainer" expectations on them (e.g., Radhika Chauhan).

---

## 🔗 Related Links

- **Repository:** https://github.com/vivekyadav-3/circuitverse-leaderboard
- **Demo Site:** https://circuitverse-leaderboard.vercel.app/
- **CircuitVerse:** https://circuitverse.org/
- **GSoC 2026:** https://summerofcode.withgoogle.com/

---

### **Phase 4: Bug Fixes & Stability** 🛠️ **COMPLETED**

#### 4.1 Activity Heatmap Accuracy

- **Status:** ✅ Complete
- **Date:** Jan 29, 2026
- **Tasks:**
  - [x] Fix horizontal drift in month labels (pixel-perfect alignment)
  - [x] Resolve "Off-by-One" date bug in tooltips
  - [x] Fix UTC vs Local timezone shift in daily activity aggregation

#### 4.2 UX & Filter Consistency

- **Status:** ✅ Complete
- **Date:** Jan 29, 2026
- **Tasks:**
  - [x] Fix "Clear Filters" inconsistency on mobile devices
  - [x] Ensure all state resets correctly across breakpoints

#### 4.3 Data Integrity & Visual Polish

- **Status:** ✅ Complete
- **Date:** Jan 29, 2026
- **Tasks:**
  - [x] Fix **Data Loss Bug** in Issue Triaging (implemented API pagination)
  - [x] Fix **Gradient Crosstalk Bug** in Trend Charts (unique SVG IDs)
  - [x] Fix **Month Label Shift** (local timezone-safe date parsing)
  - [x] Synchronize **Activity Styling** (teal/emerald consistency)
  - [x] Resolve **Wrong Day Cell Mapping** in Heatmap grid
  - [x] Fix **Local-Date Drift** in GitHub Search API queries

### **Phase 5: March 2026 Refresh & Architectural Refactor** 🏗️ **IN PROGRESS**

#### 5.1 EmbeddedChat: ChatInput Architectural Overhaul

- **Status:** 🛠️ In Progress
- **Date:** March 3, 2026
- **Tasks:**
  - [x] Implement `useChatInputState` hook to centralize input logic.
  - [x] Decouple "Logical State" (quotes, metadata) from "UI State" (textarea value).
  - [x] Refactor `ChatInput.js` to move away from fragile string manipulation.
  - [x] Enhance `ChatInput` styling with premium glassmorphism and smooth transitions.

#### 5.2 Leaderboard: Advanced Heatmap Analytics

- **Status:** ✅ Complete
- **Date:** March 3, 2026
- **Tasks:**
  - [x] Implement **Streak Tracking** (Current 🔥 and Longest 🏆).
  - [x] Enhance Heatmap header with real-time contribution analytics.
  - [x] Refine Heatmap grid for better performance and visual clarity.

---

### **Phase 6: JSON Schema - Documentation & Tooling** 🌐 **IN PROGRESS**

#### 6.1 Interactive JSON Editor Enhancements

- **Status:** ✅ Complete
- **Date:** March 9, 2026
- **Tasks:**
  - [x] Analyze `JsonEditor.tsx` for performance bottlenecks in Slate.js.
  - [x] Implement basic syntax highlighting for partial schemas (JSONC).
  - [x] Add real-time validation feedback using `ajv` inside the editor.
  - [x] Implement breadcrumb navigation for deeply nested schemas.

#### 6.2 "Getting Started" Tutorial Polish

- **Status:** 🛠️ In Progress
- **Date:** March 3, 2026
- **Tasks:**
  - [x] Audit the `getting-started-step-by-step.md` for clarity.
  - [x] Synchronize editor examples with the latest draft (2020-12).
  - [ ] Add interactive checklists for tutorial milestones.

---

### **Phase 7: EmbeddedChat - Foundation Modernization & Compatibility (Ahmad's Feedback)** 🏗️ **COMPLETED**

#### 7.1 Core Stack Upgrade

- **Status:** ✅ Complete
- **Date:** March 9, 2026
- **Tasks:**
  - [x] Audit `package.json` for all outdated dependencies (Node 16 → 20+, React 17 → 18/19).
  - [x] Plan the migration from legacy `Rocket.Chat.js.SDK` to modern modular SDKs (@rocket.chat/rest-client, @rocket.chat/ddp-client).
  - [x] Research Rocket.Chat 7.0+ breaking changes relevant to EmbeddedChat.

#### 7.2 API Refactor & Hardening

- **Status:** ✅ Complete
- **Date:** March 9, 2026
- **Tasks:**
  - [x] Replace manual `fetch` calls in `EmbeddedChatApi.ts` with standardized SDK methods.
  - [x] Implement robust error handling and retry mechanisms for the "resume" token flow (as discussed with Ahmad).
  - [x] Verify compatibility with latest Rocket.Chat server releases.

#### 7.3 Roadmap Alignment (Federation & AI)

- **Status:** ✅ Complete
- **Date:** March 9, 2026
- **Tasks:**
  - [x] Research Federation API support in modern Rocket.Chat SDKs.
  - [x] Design the abstraction layer for the pluggable AI Adapter.
  - [x] Prototype a basic AI greeting or moderation response via the adapter.

---

**Last Updated:** March 4, 2026
