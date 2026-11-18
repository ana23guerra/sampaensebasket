# CI/CD improvements to the statistics pipeline

This document explains what changed in the automation that keeps
`estatisticas.json` (player averages) up to date, and why each change was made.

## Background

The site is deployed by Vercel on every push to `main`. A scheduled GitHub
Actions workflow (`.github/workflows/atualizar-estatisticas.yml`) checks the FPB
page for finished games, runs the tugabasket scraper (`api/player_scraping.py`)
and commits the new stats, which triggers a deploy.

The original design was already sound: it only scraped when a game had ended,
ignored timestamp-only changes, kept state in `.github/estado-estatisticas.json`,
used a concurrency group, minimal permissions and GitHub Secrets. Its gaps
were in what happens when something goes wrong:

| # | Gap | Risk |
|---|-----|------|
| 1 | No validation before commit | Broken scraped data goes straight to the live site |
| 2 | No CI (tests on push / PR) | Parser bugs are only found in production |
| 3 | Unpinned Python dependencies | A new library release can break runs with no code change |
| 4 | No timeouts | A stalled server can hang the job for up to 6 hours and block later runs |
| 5 | FPB failures only produced warnings | If the FPB page changes, stats silently stop updating |
| 6 | Actions pinned by tag | A moved tag could run untrusted code with write access and secrets |
| 7 | Season IDs hardcoded | Each new season needs a code change |
| 8 | Scheduled workflows disabled after 60 days of inactivity | The pipeline can switch itself off during the off-season |

## Changes

### 1. Data validation before commit

**Files:** `.github/scripts/validar_estatisticas.py` (new), `atualizar-estatisticas.yml`

**What:** a "Validate stats" step runs after the scraper and before the commit.
It checks that `estatisticas.json` has:

- at least 8 players;
- no summary row ("Total" / "Totais") read as a player;
- the columns the site uses (`Jg`, `Min`, `Pts`, `RT`, `AS`, `%2P`, `%3P`, `%TL`);
- numeric values in those columns.

If any check fails, it prints `::error::` lines and exits with code 1. The job
fails, nothing is committed, and the site keeps the last good data.

**Why:** every push to `main` is a production deploy. Without a quality gate, a
change on tugabasket's side (renamed column, empty table, login failure that
still returns HTML) would publish broken stats. Overwriting the file is
idempotent, but re-running a bad scrape just reproduces the bad file, so
idempotency does not protect against wrong data.

### 2. Continuous integration

**Files:** `test/jogos.test.js` (new), `test/fixtures/fpb-equipa.html` (new),
`.github/workflows/ci.yml` (new), `package.json` (`"test": "node --test"`)

**What:**

- Five tests for the FPB parser (`processarJogos` in `api/jogos.js`), using
  Node's built-in test runner, so no extra dependency is needed. They check that
  games are found, every game has a valid date, status, opponent, home/away flag
  and URL, finished games have scores and scheduled ones don't, there are no
  duplicates, and empty HTML doesn't crash.
- The tests read a saved copy of the FPB team page (a *fixture*), not the live
  site. This makes them deterministic, fast and offline: a failure means the
  parser broke, not that FPB was slow or the calendar changed.
- A `CI` workflow runs the tests and the data validation on every push to `main`
  and every pull request.

**Why:** previously nothing ran when code changed, so the only test was
production. CI turns "the site broke" into "the check went red before merging".

**Limitation:** the fixture never changes, so it cannot detect an FPB redesign.
Change 5 covers that. When FPB does change its HTML, refresh the fixture with the
command at the top of `test/jogos.test.js` and fix the parser until tests pass.

### 3. Pinned Python dependencies

**Files:** `requirements.txt` (new), `atualizar-estatisticas.yml`

**What:** exact versions (`requests==2.34.2`, `pandas==3.1.1`,
`beautifulsoup4==4.15.0`, `lxml==6.1.3`, `python-dotenv==1.2.4`) installed with
`pip install -r requirements.txt`, with `cache: pip` on `setup-python`. These are
the versions the unpinned workflow was already installing.

**Why:** reproducible builds. The same code should produce the same result on
every run; updates should be deliberate (via Dependabot, tested by CI), not
whatever was released that morning. Caching also makes installs faster.

### 4. Timeouts

**Files:** `atualizar-estatisticas.yml`, `api/player_scraping.py`

**What:** `timeout-minutes: 10` on the job, and `timeout=30` (seconds) on every
`requests` call in the scraper. The FPB check already had a 15 s timeout.

**Why:** `requests` waits forever by default, and a job without a limit can run
for 6 hours. Because of the concurrency group, one hung run would also block
every run queued behind it.

### 5. Failing loudly on persistent FPB problems

**File:** `.github/scripts/verificar-jogo.js`

**What:**

- If the FPB page loads but the parser finds zero games, this is now treated as
  an error (the team page always lists the season's calendar, so zero games means
  the HTML changed).
- Hourly weekend runs still only log a warning on any FPB error: a one-off
  outage fixes itself next hour.
- The daily run (06:45 UTC) now exits with code 1 on an FPB error, so a
  persistent problem shows as a failed run and GitHub sends an email.

**Why:** before, a redesigned FPB page produced green runs forever while the
stats quietly stopped updating. Good automation tolerates blips but surfaces
lasting failures.

### 6. Supply-chain hardening

**Files:** both workflows, `.github/dependabot.yml` (new)

**What:**

- `actions/checkout`, `actions/setup-node` and `actions/setup-python` are pinned
  to full commit SHAs, with the version in a comment (e.g. `# v5`).
- Dependabot opens monthly pull requests for GitHub Actions, pip and npm
  updates; CI tests each one.
- The new CI workflow only has `contents: read`.

**Why:** tags can be moved to point at different code; a commit SHA cannot. The
statistics job has write access to the repository and the tugabasket
credentials, so it should only run code that was reviewed.

### 7. Season settings as configuration

**Files:** `api/player_scraping.py`, `atualizar-estatisticas.yml`

**What:** the competition and team IDs come from the `COMPETICAO_ID` and
`EQUIPA_ID` environment variables, filled from GitHub repository variables
(`vars.*`). If unset, they default to `11441` and `63077`, so nothing breaks
before they are configured, and local runs still work.

**Why:** configuration that changes every season belongs outside the code.
A new season now means editing two variables in the GitHub UI, with no commit.

### 8. Off-season checklist

**File:** `README.md` (new "Testes e CI" section)

**What:** a start-of-season checklist: update the two repository variables, and
confirm the "Atualizar estatisticas" workflow is still enabled
(`gh workflow enable atualizar-estatisticas.yml` if not).

**Why:** GitHub disables scheduled workflows in public repositories after 60
days without activity. With no games over the summer there are no commits, so
the workflow may be off when the new season starts. A yearly check is simpler
and more transparent than a keep-alive hack.

## Supporting changes

- **`.vercelignore` (new):** excludes `requirements.txt`, `test/` and `docs/`
  from the Vercel deploy. Without it, Vercel would see the root
  `requirements.txt` and install pandas and lxml for `api/player_scraping.py`
  (which it treats as a Python function) on every deploy, and it would publicly
  serve the test fixture.
- **`.gitignore`:** ignores `__pycache__/`.

## How the pipeline works now

```
Code change ──► CI: parser tests + data validation ──► merge to main ──► Vercel deploy
                                                            ▲
Schedule ──► check FPB ──► scrape ──► validate ──► commit ──┘
               │          (pinned     │
               │           deps,      └─ invalid data: run fails, nothing pushed
               │           timeouts)
               └─ daily run fails (and emails) if FPB can't be read
```

## How to verify

```bash
npm test
python .github/scripts/validar_estatisticas.py
```

On GitHub: trigger "Atualizar estatisticas" manually from the Actions tab with
"forcar" ticked, and check that the CI workflow runs on the next push.

## Still to do manually

- Turn on branch protection for `main` and require the `CI` check to pass.
- Optionally set the `COMPETICAO_ID` and `EQUIPA_ID` repository variables.
