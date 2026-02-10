---
name: git-commit
description: Generate Conventional Commit messages from git diffs and status. Use when the user asks to write commit messages, create commits, or follow Conventional Commits.
---

# Git Commit with Conventional Commits

Create standardized, semantic commits using the Conventional Commits specification.

## Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

- `feat` new feature
- `fix` bug fix
- `docs` documentation only
- `style` formatting/style (no logic)
- `refactor` refactor (no feature/fix)
- `perf` performance improvement
- `test` add/update tests
- `build` build system/dependencies
- `ci` CI/config changes
- `chore` maintenance/misc
- `revert` revert commit

## Breaking Changes

- Add `!` after type/scope: `feat!: remove deprecated endpoint`
- Or add footer:
  ```
  BREAKING CHANGE: `extends` key behavior changed
  ```

## Workflow

1. **Analyze diff**
   - If staged: `git diff --staged`
   - If nothing staged: `git diff`
   - Always check status: `git status --porcelain`

2. **Stage files (if needed)**
   - `git add path/to/file1 path/to/file2`
   - `git add *.test.*`
   - `git add src/components/*`
   - Avoid committing secrets (`.env`, credentials, private keys).

3. **Generate commit message**
   - Type: what kind of change is this?
   - Scope: what area/module is affected?
   - Description: present tense, imperative, <72 chars

4. **Create commit**
   - Single line:
     ```
     git commit -m "<type>[scope]: <description>"
     ```
   - Multi-line:
     ```
     git commit -m "$(cat <<'EOF'
     <type>[scope]: <description>

     <optional body>

     <optional footer>
     EOF
     )"
     ```

## Best Practices

- One logical change per commit
- Present tense, imperative mood
- Keep description under 72 characters
- Reference issues when applicable (`Closes #123`, `Refs #456`)

## Safety Rules

- Never update git config
- Never run destructive commands (force push, hard reset) without explicit request
- Never skip hooks (`--no-verify`) unless explicitly requested
- If hooks fail, fix and create a new commit (do not amend)
