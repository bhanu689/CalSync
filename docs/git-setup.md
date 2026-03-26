# Git Setup — Personal GitHub on Work Laptop

Your work laptop uses Bitbucket globally. This sets up **repo-local** GitHub access without affecting work config.

## 1. Create the GitHub Repo

Go to [github.com/new](https://github.com/new), create a repo (e.g., `calsync`). Don't initialize with README.

## 2. Setup Git

```bash
cd /Users/mugunthan/Desktop/personal/calendar

# Initialize repo
git init

# Set LOCAL user config (only this repo — won't touch your work Bitbucket)
git config user.name "Your Name"
git config user.email "your-personal-email@gmail.com"

# Add remote
git remote add origin https://github.com/<your-github-username>/calsync.git
```

## 3. First Push

```bash
git add .
git commit -m "Initial commit: CalSync scheduling platform"
git branch -M main
git push -u origin main
```

When you push, Git will open a **browser window** to login to your GitHub account. Sign in once and it gets cached by macOS Keychain.

> **Note:** If your work Bitbucket credentials interfere, use this remote URL format instead:
> ```
> git remote set-url origin https://<your-github-username>@github.com/<your-github-username>/calsync.git
> ```
> This forces Git to prompt for your GitHub credentials specifically.

## How It Works

| Scope | Identity | How |
|-------|----------|-----|
| Global (all repos) | Work Bitbucket | Your existing `~/.gitconfig` — untouched |
| This repo only | Personal GitHub | `git config --local` + HTTPS remote |
