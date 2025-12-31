# Enhancement: Add Contribution Streaks to User Profiles

## 🎯 Overview

Add GitHub-style contribution streak tracking to individual contributor profile pages, showing both current and longest streaks to gamify and motivate consistent contributions.

## 💡 Motivation

Contribution streaks are a proven engagement mechanism (popularized by GitHub's contribution graph). They:

- **Motivate consistency**: Encourages daily/regular contributions
- **Provide recognition**: Highlights dedicated contributors
- **Add gamification**: Makes contributing more engaging
- **Show commitment**: Helps identify highly active community members

## ✨ Proposed Feature

### Current Streak 🔥

- Tracks **consecutive days** with at least one contribution
- Displays with fire emoji (🔥)
- Shows subtle pulse animation when active
- Resets when a day is missed

### Longest Streak 🏆

- Tracks **all-time best** consecutive contribution streak
- Displays with trophy emoji (🏆)
- Serves as a personal record/achievement

### Visual Design

```
┌─────────────────────────┐
│  👤 User Card           │
│  69 Points | 34 Acts   │
│  🔥 0 Days (Current)    │  ← Animated pulse
│  🏆 22 Days (Best)      │
└─────────────────────────┘
```

## 🛠️ Technical Implementation

### Backend Changes (`lib/db.ts`)

```typescript
// Add streak calculation helper
function calculateStreaks(dailyActivity: DailyActivity[]) {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const sortedDays = dailyActivity
    .filter((d) => d.count > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate current streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDays.length; i++) {
    const dayDate = new Date(sortedDays[i].date);
    dayDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (dayDate.getTime() === expectedDate.getTime()) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  // ... (similar logic for all-time longest)

  return { current: currentStreak, longest: longestStreak };
}

// Update getContributorProfile
export async function getContributorProfile(username: string) {
  // ... existing code ...

  const streaks = calculateStreaks(dailyActivity);

  return {
    // ... existing fields ...
    stats: {
      // ... existing stats ...
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
    },
  };
}
```

### Frontend Changes (`app/[username]/page.tsx`)

```tsx
// Display streaks in user card
<div className="flex items-center gap-2">
  <span className={currentStreak > 0 ? "animate-pulse-slow" : ""}>
    🔥 {currentStreak} Days
  </span>
  <span className="text-muted-foreground text-sm">Current</span>
</div>

<div className="flex items-center gap-2">
  <span>🏆 {longestStreak} Days</span>
  <span className="text-muted-foreground text-sm">Best</span>
</div>
```

### Styling (`app/globals.css`)

```css
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## 📸 Screenshots

_(Will add after approval)_

## ✅ Acceptance Criteria

- [ ] Current streak calculates correctly (consecutive days)
- [ ] Longest streak tracks all-time best
- [ ] Streak resets properly when days are missed
- [ ] Animation works on active streaks
- [ ] No TypeScript errors
- [ ] Null-safe date handling
- [ ] Works in both Light/Dark mode
- [ ] Responsive on mobile

## 🧪 Testing Plan

### Manual Tests

1. User with active streak (today + yesterday)
2. User with broken streak (gap in contributions)
3. User with no contributions
4. User with longest streak in the past

### Edge Cases

- Timezone handling
- Leap years
- Month boundaries
- New users (no history)

## 📝 Implementation Notes

- Uses existing `dailyActivity` data (no new API calls)
- Purely additive (no breaking changes)
- Backward compatible with current JSON format
- Performance: O(n) where n = days in activity history

## 🔗 Related

- Part of Profile Enhancement series
- Builds on PR #26 by @Supreeth-C
- Inspired by GitHub's contribution streak

---

**Ready to implement!** This will be submitted as a focused PR once approved.

cc: @Naman-Chhabra @Aboobacker-MK @Supreeth-C
