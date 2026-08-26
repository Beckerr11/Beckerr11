# GitHub Portfolio Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Beckerr11 GitHub account into a recruiter-ready engineering portfolio in which every public repository has a clear purpose, verifiable quality signals, safe visibility, and a coherent relationship with the profile README.

**Architecture:** Treat the account as a portfolio product with three layers: the profile README as the navigation surface, flagship repositories as deep technical case studies, and secondary/learning repositories as curated supporting evidence. Visibility decisions for private repositories must pass a security and IP gate before any public exposure.

**Tech Stack:** GitHub profile README, GitHub Actions, Dependabot, repository metadata, Node.js/React/Vite, Python, Docker, project-specific stacks already present in each repository.

**Spec:** User request in the 2026-08-26 GitHub portfolio review conversation.

## Global Constraints

- Do not make a private repository public before checking for credentials, tokens, private keys, internal URLs, customer/business data, proprietary assets, licensed third-party code, and environment files.
- Do not claim tests, deployment, authentication, security, realtime behavior, observability, or production readiness unless the repository proves it.
- Prefer six high-signal pinned/public projects over a large undifferentiated list.
- Keep README language concise, technical, recruiter-readable, and explicit about limitations.
- Every flagship JavaScript/TypeScript repository should have a deterministic install path and CI for its relevant tests/build where practical.
- Every flagship Python repository should declare dependencies and run tests/lint or an equivalent verification gate where practical.
- Generated dependencies, build artifacts, local environment files, credentials, and machine-specific files must not be committed.
- Private commercial or game-control repositories remain private unless their publication is clearly safe and strategically useful.
- Use `main` as the preferred branch name for new/modernized public portfolio repositories when migration is safe; do not rename branches solely for aesthetics when it risks deployments or automation.

---

### Task 1: Establish the account-level portfolio baseline

**Files:**
- Modify: `Beckerr11/README.md` only after downstream repository decisions are verified.
- Create: `docs/GITHUB_PORTFOLIO_AUDIT.md`

**Interfaces:**
- Consumes: authenticated repository inventory.
- Produces: the canonical keep/improve/archive/private/public-candidate classification used by every later task.

- [ ] Record all 39 repositories with visibility, default branch, size, portfolio role, and current recommendation.
- [ ] Separate repositories into flagship, supporting, learning/archive, private-publication-candidate, and private-keep-private groups.
- [ ] Reconcile public-repository counts used by generated profile analytics so the README never presents contradictory totals.
- [ ] Commit the audit as a durable account-level record.

### Task 2: Finish the React Kanban recovery

**Files:**
- Existing PR: `Beckerr11/react-kanban-board#1`

**Interfaces:**
- Consumes: passing CI covering tests, production build, dependency audit, and Docker build.
- Produces: a clean, runnable repository suitable for later visibility review.

- [ ] Confirm the latest PR head has successful CI.
- [ ] Confirm automated review feedback is either obsolete or addressed.
- [ ] Merge the PR using a clean merge method supported by repository settings.
- [ ] Re-check the default branch README and CI after merge.
- [ ] Run a publication-safety scan before changing visibility.

### Task 3: Upgrade flagship public repositories into technical case studies

**Repositories:**
- `crm-comercial-fullstack`
- `saas-auth-dashboard-demo`
- `github-security-automation`
- `client-portal-pro`
- `fullstack-e2e-blueprint`
- `url-shortener-api`

**Interfaces:**
- Consumes: current code and CI evidence.
- Produces: recruiter-readable READMEs that describe the problem, architecture, local setup, verification commands, deployment/demo when real, and explicit limitations.

- [ ] Replace generic portfolio-template copy with project-specific technical narratives.
- [ ] Verify README claims against source code and workflows.
- [ ] Add or repair CI only where a real executable/testable path exists.
- [ ] Add Dependabot where it adds maintenance value and is not already present.
- [ ] Ensure no README exposes demo credentials that could be mistaken for production credentials without an explicit demo warning.
- [ ] Merge changes only after available CI checks pass.

### Task 4: Evaluate private repositories for publication

**Repositories:**
- `douglasdev-platform`
- `finance-tracker-api`
- `react-kanban-board`
- `url-shortener`
- `MasterScanner-Forense`
- `LDA-STORE`
- `NightCityOS`

**Interfaces:**
- Consumes: file search, commit history, README, dependency manifests, workflows, and secret/IP scan evidence.
- Produces: one of `PROMOTE_PUBLIC`, `KEEP_PRIVATE`, `KEEP_PRIVATE_CREATE_CASE_STUDY`, or `ARCHIVE/CONSOLIDATE` for each repository.

- [ ] Search for committed environment files, API tokens, OAuth secrets, private keys, database connection strings, credentials, internal domains, customer data, and proprietary assets.
- [ ] Check repository purpose and whether public exposure improves or weakens the target Full Stack/software engineering narrative.
- [ ] Check third-party code/assets and license compatibility before recommending public visibility.
- [ ] Verify README, tests, CI, deterministic installation, and repository hygiene for every `PROMOTE_PUBLIC` candidate.
- [ ] Do not change visibility on `douglasdev-platform`, `LDA-STORE`, or `NightCityOS` unless the security/IP review is unequivocally clean and publication has clear portfolio value.
- [ ] Prefer a sanitized public case-study repository when a private flagship contains valuable architecture but should not expose implementation details.

### Task 5: Reduce low-signal public noise

**Candidate repositories:**
- `calculadora-python`
- `gerador-senhas-python`
- `todo-list-javascript`
- `api-python`
- `web-scraper-python`
- `password-checker-python`
- `github-user-search`
- `weather-app`
- `portfolio-dev`
- `Larissakich`

**Interfaces:**
- Consumes: content/commit review for each candidate.
- Produces: a cleaner public repository list in which beginner exercises do not compete visually with flagship work.

- [ ] Determine whether each repository demonstrates a distinct useful skill.
- [ ] Keep public only when the repository has a coherent README and a reason to exist independently.
- [ ] Archive or make private redundant/abandoned learning projects rather than deleting history.
- [ ] Preserve any repository linked from an external portfolio until its replacement link is verified.

### Task 6: Differentiate the medium-size product/template repositories

**Repositories:**
- `saas-starter-br`
- `saas-billing-starter`
- `observability-kit-node`
- `real-time-support-center`
- `ai-lead-qualifier`
- `secure-auth-template`
- `portfolio-cms-headless`
- `bughunter`
- `deploy-doctor`
- `devpulse`
- `freelaflow`
- `interview-arena`
- `readmecraft`
- `discord-ticket-bot`
- `portfolio-landing-premium`

**Interfaces:**
- Consumes: existing README/code/CI.
- Produces: clear differentiation so the account does not look like many near-identical generated starter projects.

- [ ] Identify each repository's unique engineering claim in one sentence.
- [ ] Remove repeated boilerplate such as “part of a professional portfolio track” when it adds no technical information.
- [ ] Add verification and limitations sections where absent.
- [ ] Consolidate or archive repositories whose implementation is too thin or duplicates another stronger project.

### Task 7: Curate the final profile surface

**Files:**
- Modify: `Beckerr11/README.md`
- Modify only the local analytics workflow/cards if required by verified account data.

**Interfaces:**
- Consumes: final visibility and flagship decisions from Tasks 2–6.
- Produces: the final recruiter-facing profile.

- [ ] Keep the display name as `Douglas Silva`.
- [ ] Lead with role, location, portfolio, and target opportunity in compact language.
- [ ] Feature no more than six projects, each with a distinct reason to click.
- [ ] Ensure every featured repository is public or has a public case-study/demo destination.
- [ ] Keep GitHub analytics self-hosted/versioned in the profile repository rather than relying on fragile third-party image endpoints.
- [ ] Remove stale project claims, broken links, contradictory repository counts, and duplicate stack badges.

### Task 8: Final verification gate

**Interfaces:**
- Consumes: all completed repository changes.
- Produces: evidence that the portfolio is coherent and safe to share.

- [ ] Re-list the complete repository inventory and compare it with the audit classification.
- [ ] Check all open portfolio-related PRs and merge only those with passing required checks.
- [ ] Check every featured README and demo link.
- [ ] Confirm no private repository was exposed without completing the publication-safety gate.
- [ ] Confirm the profile README names only verified projects and uses `Douglas Silva` consistently.
- [ ] Record remaining intentional private repositories and why they remain private.
