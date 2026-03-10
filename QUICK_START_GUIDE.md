# 🚀 CircuitVerse Contribution - Quick Start Guide

**Date:** December 29, 2025

---

## ✅ TODAY'S ACTION PLAN

### **Session 1: Setup & First Contribution** (Now - 2:00 PM)

#### **Step 1: Clone Main Repository** (10 min)

```bash
cd C:\Users\KIIT\.gemini\antigravity\scratch
git clone https://github.com/CircuitVerse/CircuitVerse.git
cd CircuitVerse
```

#### **Step 2: Read Documentation** (15 min)

- [ ] Read CONTRIBUTING.md
- [ ] Read CODE_OF_CONDUCT.md
- [ ] Understand project structure

#### **Step 3: Setup Development Environment** (30-45 min)

Follow the setup guide in CONTRIBUTING.md:

- [ ] Install Ruby (version specified in .ruby-version)
- [ ] Install Rails
- [ ] Install PostgreSQL
- [ ] Install dependencies: `bundle install`
- [ ] Setup database: `rails db:setup`
- [ ] Run server: `rails server`

#### **Step 4: Pick Your First Issue** (5 min)

**Recommended:** Issue #5442 - Spacing issue between CAPTCHA and login button

**Why this one?**

- Very easy (CSS only)
- Quick win (30 min - 1 hour)
- Builds confidence
- Shows you can follow contribution process

#### **Step 5: Claim the Issue** (2 min)

Comment on the issue:

```
Hi! I'd like to work on this issue. I'll fix the spacing between the CAPTCHA
and login button. Expected to submit a PR within 24 hours.
```

#### **Step 6: Create Branch & Fix** (30-60 min)

```bash
git checkout -b fix/captcha-login-spacing
# Make your changes
git add .
git commit -m "fix: improve spacing between CAPTCHA and login button

Fixes #5442"
git push origin fix/captcha-login-spacing
```

#### **Step 7: Create Pull Request** (10 min)

- Clear title
- Reference issue number
- Add screenshots (before/after)
- Follow PR template

---

## 📋 PRIORITY ISSUES TO TACKLE (In Order)

### **Week 1: Quick Wins**

1. ✅ #5442 - CAPTCHA spacing (30 min)
2. ✅ #6002 - Arabic translation (1-2 hours)
3. ✅ #5541 - Assignment UI alignment (1-2 hours)

### **Week 2: Mobile App**

4. ✅ #263 - Boolean to Yes/No (30 min)
5. ✅ #261 - Open link in browser (1 hour)
6. ✅ #260 - Contribute page links (1 hour)

### **Week 3: Medium Issues**

7. ✅ #5984 - Welcome email UI (2-3 hours)
8. ✅ #4535 - Footer movement (2 hours)
9. ✅ #5369 - Group page layout (3-4 hours)

---

## 🔧 Development Environment Setup

### **Prerequisites:**

- Ruby (check `.ruby-version` file)
- Rails
- PostgreSQL
- Node.js & npm
- Git

### **Installation Commands (Windows):**

#### **Install Ruby:**

```powershell
# Download RubyInstaller from https://rubyinstaller.org/
# Install with DevKit
```

#### **Install PostgreSQL:**

```powershell
# Download from https://www.postgresql.org/download/windows/
# Install and remember your password
```

#### **Install Dependencies:**

```bash
cd CircuitVerse
bundle install
npm install
```

#### **Setup Database:**

```bash
rails db:create
rails db:migrate
rails db:seed
```

#### **Run Server:**

```bash
rails server
# Visit http://localhost:3000
```

---

## 💬 Community Engagement

### **Join Slack:**

1. Visit https://circuitverse.org/slack
2. Join relevant channels:
   - #general
   - #gsoc
   - #development
   - #help

### **Introduce Yourself:**

```
Hi everyone! 👋

I'm Vivek, a web developer interested in contributing to CircuitVerse
for GSoC 2026. I've already contributed to the CircuitVerse Leaderboard
project (fixed TypeScript errors, improved type safety).

I'm looking forward to contributing to the main repository and mobile app.
Currently working on issue #5442 as my first contribution.

Tech stack I'm comfortable with: JavaScript, TypeScript, React, Next.js,
Node.js. Learning Ruby on Rails for CircuitVerse contributions.

Looking forward to being part of this community!
```

---

## 📝 Commit Message Format

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### **Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### **Examples:**

```bash
fix: improve spacing between CAPTCHA and login button

Added margin-top to improve visual spacing and user experience.

Fixes #5442

---

feat: add Arabic translation for "Member since"

Added missing translation key for Arabic language support.

Fixes #6002

---

style: fix UI alignment in Assignment section

Adjusted flex properties to ensure proper alignment of elements.

Fixes #5541
```

---

## 🎯 Success Checklist

### **Before Submitting PR:**

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] No linting errors
- [ ] Commit messages follow convention
- [ ] PR description is clear
- [ ] Screenshots added (for UI changes)
- [ ] Issue number referenced
- [ ] Self-reviewed the code

### **After Submitting PR:**

- [ ] Monitor for review comments
- [ ] Respond to feedback within 24 hours
- [ ] Make requested changes promptly
- [ ] Thank reviewers
- [ ] Update PR if needed

---

## 📚 Learning Resources

### **Ruby on Rails:**

- Official Guide: https://guides.rubyonrails.org/
- Rails Tutorial: https://www.railstutorial.org/
- Ruby Docs: https://ruby-doc.org/

### **CircuitVerse Specific:**

- Docs: https://docs.circuitverse.org/
- Simulator Guide: https://docs.circuitverse.org/chapter1/
- API Docs: https://docs.circuitverse.org/api/

### **Git & GitHub:**

- Git Handbook: https://guides.github.com/introduction/git-handbook/
- GitHub Flow: https://guides.github.com/introduction/flow/

---

## 🐛 Troubleshooting

### **Common Issues:**

#### **Bundle Install Fails:**

```bash
# Update bundler
gem install bundler
bundle update --bundler
```

#### **Database Connection Error:**

```bash
# Check PostgreSQL is running
# Update config/database.yml with correct credentials
```

#### **Rails Server Won't Start:**

```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9
# Or on Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📊 Progress Tracking

### **Contributions Made:**

- [ ] Issue #5442 - CAPTCHA spacing
- [ ] Issue #6002 - Arabic translation
- [ ] Issue #5541 - Assignment UI
- [ ] Issue #263 - Boolean to Yes/No (Mobile)
- [ ] Issue #261 - Open link (Mobile)
- [ ] Issue #260 - Contribute links (Mobile)

### **PRs Status:**

- Submitted: 0
- Under Review: 0
- Merged: 0
- Total: 0

---

## 🎉 Motivation

**Remember:**

- Every merged PR brings you closer to GSoC
- Small contributions matter
- Community engagement is key
- Consistency beats intensity
- Learn from feedback
- Help others when you can

**You've got this! 🚀**

---

_Last Updated: December 29, 2025_
