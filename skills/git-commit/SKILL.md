---
name: git-commit
description: This skill should be used when the user says "commit", "create a commit", "commit changes", "done with changes", "ready to commit", or when Claude has completed implementing a feature or fix and needs to commit the work.
---

# Git Commit Skill

Automate git commits with consistent, well-formatted messages.

## When to Use

- After completing a feature, bug fix, or refactoring task
- When the user explicitly requests a commit
- When staged changes are ready to be committed

## Commit Workflow

### Step 1: Gather Context

Run these commands in parallel to understand the current state:

```
git status
git diff
git diff --staged
git log --oneline -5
```

### Step 2: Analyze Changes

Review the diff output to understand:

- What files were modified, added, or deleted
- The nature of changes (new feature, bug fix, refactor, docs, etc.)
- The scope of impact

### Step 3: Generate Commit Message and Ask for Confirmation

Write a commit message following these rules, then ask the user to confirm before committing:

- Style: simple imperative
- Start with a verb: Add, Fix, Update, Remove, Refactor, Improve
- Keep the subject line under 72 characters
- Focus on "why" not "what" (the diff shows "what")

Examples:

- Add user authentication via OAuth
- Fix null pointer in payment processing
- Update dependencies to address security vulnerabilities
- Remove deprecated API endpoints
- Refactor database queries for better performance

Message format:

```
<subject line>

- <change 1>
- <change 2>
```

Keep it concise. Only include the bullet list if there are multiple distinct changes.

### Step 4: Ask for Confirmation

Before committing, present the proposed commit message and files to the user. Use AskUserQuestion to confirm:

- Show the commit message
- List files to be committed
- Ask "Proceed with this commit?"

Only proceed if the user confirms.

### Step 5: Create Commit and Push

After user confirmation:

```
git add <relevant files>
git commit -m "<commit message>"
git push
```

### Step 6: Verify

Run `git status` to confirm the commit and push succeeded.

## Safety Rules

- Never force push (`git push --force`)
- Never skip hooks (`--no-verify`)
- Never amend commits that have been pushed
- Never commit secrets or credentials (`.env`, API keys, tokens)
- Always verify with user before committing if unsure

## Do Not Commit

- `.env` files or any file containing secrets
- `credentials.json`, API keys, tokens
- Large binary files unless explicitly requested
- Generated files that should be in `.gitignore`
