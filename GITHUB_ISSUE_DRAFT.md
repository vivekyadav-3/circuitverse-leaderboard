# Enhancement: Add Contribution Streaks, Activity Distribution, and Profile Dashboard V2

## 🎯 Overview

This issue proposes adding enhanced analytics and visualization features to individual contributor profile pages, building on the recently merged base implementation (PR #26).

## 💡 Motivation

Currently, the leaderboard shows basic contribution metrics. These enhancements will:

- **Gamify contributions** with streak tracking (similar to GitHub)
- **Provide deeper insights** into contribution patterns
- **Improve user engagement** with visual feedback
- **Help maintainers** identify active contributors at a glance

## ✨ Proposed Features

### 1. 🔥 Contribution Streaks

Track and display contributor momentum:

- **Current Streak**: Consecutive days with at least one contribution
- **Longest Streak**: All-time best streak record
- **Visual Indicators**: Fire emoji (🔥) for current, Trophy (🏆) for longest
- **Subtle Animation**: Pulsing effect on active streaks

**Value**: Motivates consistent contributions, similar to GitHub's contribution graph psychology.

### 2. 📊 Activity Distribution Analytics

Visual breakdown of contribution types:

- **Progress Bars**: Show percentage of PRs vs Issues vs Other activities
- **Color Coding**: Green for PRs, Blue for Issues, Gray for Others
- **At-a-Glance Insights**: Quickly understand a contributor's focus area

**Value**: Helps identify specialists (PR reviewers, issue reporters, etc.) and contribution patterns.

### 3. 🎨 Profile Dashboard V2 Layout

Modern 2-column grid design:

- **Sidebar**: User card with avatar, stats, and streaks
- **Main Content**: Enhanced heatmap + activity timeline
- **Responsive**: Collapses to single column on mobile
- **Theme Support**: Full Light/Dark mode compatibility

**Value**: Professional, information-dense layout inspired by modern dashboards.

### 4. 🗓️ Enhanced Activity Heatmap

Improvements to the existing heatmap:

- **Daily Tooltips**: Show exact contribution count and points per day
- **Month Labels**: Uppercase, tracking-tight typography for modern look
- **Accessibility**: ARIA labels and keyboard navigation

**Value**: Makes the heatmap more informative and accessible.

## 🛠️ Technical Implementation

### Backend Changes (`lib/db.ts`)

```typescript
// Add to getContributorProfile function:
- Calculate currentStreak and longestStreak from dailyActivity
- Add distribution object to stats (prs, issues, others counts)
- Ensure null safety for all date operations
```

### Frontend Changes

```typescript
// app/[username]/page.tsx
- Implement 2-column grid layout
- Add DistributionBar component
- Add streak indicators with animation
- Improve TimelineItem styling

// app/globals.css
- Add @keyframes pulse-slow animation
```

### Type Safety

- ✅ 100% TypeScript coverage
- ✅ Proper null checks
- ✅ No `any` types

## 📸 Screenshots

_(Will add screenshots from local development once approved)_

## 🔗 Related Work

- Builds on PR #26 by @Supreeth-C
- Inspired by @Utpal Sen's mockup feedback
- Discussed in Slack: [link to thread]

## 🎓 GSoC Context

This work is part of my GSoC 2026 preparation. I'm focusing on:

- Code quality and type safety
- User experience enhancements
- Community collaboration

## ✅ Acceptance Criteria

- [ ] Streak calculation logic is accurate
- [ ] Activity distribution percentages are correct
- [ ] Layout is responsive on all screen sizes
- [ ] Light/Dark mode works perfectly
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Accessible (WCAG 2.1 AA)

## 🚀 Implementation Plan

1. **Phase 1**: Backend logic for streaks and distribution
2. **Phase 2**: Frontend layout and components
3. **Phase 3**: Styling and animations
4. **Phase 4**: Testing and accessibility

## 📝 Notes

- All code is already implemented in my branch: `vivek/circuitverse-pages`
- Ready to submit PR pending maintainer approval
- Open to feedback and iterations

---

**Would you like me to proceed with implementing this, or would you prefer a different approach?**

cc: @Naman-Chhabra @Aboobacker-MK @Utpal-Sen
