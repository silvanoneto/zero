Pre-commit hook: generated-files updater
=====================================

This folder contains the small pre-commit helper used to keep generated artifacts up-to-date
before commits. The hook runs the full export pipeline and auto-commits changes to generated
files so the repository contains the evolution logs.

Files
- `update_generated.py` - runs `python3 scripts/export_file.py all`, stages changed generated
  files and creates an automatic commit with a message that includes file names, count, total
  size and a UTC timestamp. The commit includes `[ci skip]`.

Why this exists
- The project produces generated artifacts (EPUB, PDF, XML, JSONL, and the rizoma files).
- We want commits to always contain the latest generated outputs so downstream users (and CI)
  can rely on files inside `docs/`.

Flow
1. `pre-commit` invokes the local hook which runs `update_generated.py`.
2. `update_generated.py` runs the exporter (`scripts/export_file.py all`).
3. If generated files differ, the script stages them and creates an automatic commit
   `chore: update generated files (...) — TIMESTAMP — AUTHOR [ci skip]`.
4. The original commit proceeds with the work tree unchanged (the generated files are already
   committed).

How to disable for a single commit
- Use `git commit --no-verify` to bypass pre-commit hooks for one commit.

How to undo or amend the auto-commit
- To amend the auto-generated commit message:

  git rebase -i HEAD~2

  or (simpler, if the auto-commit is the last commit):

  git commit --amend --no-edit

- To remove the auto-commit entirely (and keep the generated files staged/untracked):

  git reset --soft HEAD~1

Recommendations
- Install pre-commit in your environment and run `pre-commit install` in the repo root.
- If you find the full export slow on your machine, consider switching the hook to generate only
  the rizoma files; open an issue/PR and we can change the behavior.
