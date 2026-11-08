# Last Light

A complete, dependency-free browser game: spend coins to light a maze, collect a key, and escape three chambers. The playable HTML includes a structured rules sheet. See [PROMPT.md](PROMPT.md) for the detailed implementation prompt, mechanics, art direction, and acceptance criteria.

## Play locally

Open `index.html` in a modern browser. Alternatively run `python -m http.server 8000` from this folder and visit `http://localhost:8000`. No installation or build step is required.

Move with WASD/arrows, toggle the lantern with Space, and pause with P. Touch devices have a direction pad and swipe input. Collect gold (+8), avoid red spikes (−5 per entry), get the blue key, and reach the green gate. Light burns one coin per second; darkness is free. Zero coins ends the run. Clear all three chambers to win.

## Deploy on GitHub Pages

1. Create a GitHub repository with `main` as the default branch.
2. Upload this folder's **contents** to the repository root, including `.github/workflows/pages.yml`. `index.html` must be at the root.
3. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
4. Push to `main`, or open **Actions → Deploy Last Light to GitHub Pages → Run workflow**.
5. Once deployment succeeds, open the URL in the deployment job or Pages settings. It is usually `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

The included workflow publishes the repository root. No secrets, server, database, dependencies, custom domain, or build command are needed. If you use a different default branch, change the workflow's branch filter. GitHub Pages availability depends on your repository/account settings.

## Files

- `index.html`: all game code, graphics, styles, controls, and rules.
- `PROMPT.md`: reusable, detailed build specification.
- `.github/workflows/pages.yml`: automatic static deployment.

## Design notes

Mazes are random and connected, with the gate at a furthest reachable non-shortcut tile. Visibility is circular and can reveal nearby geometry across walls. Remembered geometry is dim; remembered items are hidden. There are no enemies, raycast shadows, daily seeds, or online scores. Best scores are local to the browser and difficulty. The canvas is visually navigated and does not provide a complete screen-reader mode.

## Verification

Run `node tests/verify.cjs` with Node.js, Playwright, and Chromium installed. Set `CHROMIUM_PATH` if Chromium is not at `/usr/bin/chromium`. These are development-only tools; playing the game needs no dependencies.

The suite checks 900 random mazes across all difficulties and chambers, including a spike-free detour of at least twelve steps for every shortcut, unique and reachable item placement, pickups, repeated spike damage, locked gates, chamber bonuses, fractional lantern time, pause, victory/defeat, separate best scores, and storage write failures. Chromium checks cover keyboard input, button focus, direction pad, swipes, focus-loss pause, and desktop/mobile layouts. The test run generates desktop and mobile screenshots. Testing uses a local HTTP server; this environment's browser policy blocks direct file URLs. Audible quality and physical-device touch have not been manually verified.

## Changes from the supplied prototype

- Refined brass-and-slate interface, lantern emblem, persistent map legend, and responsive controls.
- Keyboard focus returns to the maze after lantern and sound clicks.
- Most recently pressed directions take precedence; inactive overlays cannot queue held movement.
- Pending swipes clear on pause, game end, and chamber transitions.
- Player animation stops while paused; audio resume failures are handled.
- Included repeatable browser and gameplay tests.


## Chamber update

- **The Threshold:** 15% wider lantern, up to two spiked shortcuts.
- **The Crossroads:** normal lantern, up to four spiked shortcuts.
- **The Last Passage:** 15% narrower lantern, up to two spiked shortcuts.
- Shortcuts open loops in the maze. Each costs one spike entry (5 coins), with a longer spike-free detour available between its endpoints. Other parts of a route can still contain spikes.
- Spike counts are capped by difficulty (4 / 7 / 10). Extra spikes are omitted if they would block protected detours. Coins, key, and gate remain distinct and reachable.
- Pickup text, a persistent key indicator, and a steady warning at 8 coins or fewer clarify the economy.
- Mobile uses an 11 × 11 tile camera that follows the player, with sticky 44px direction buttons. Desktop retains the full board.
- Existing scores remain saved; the new chamber layouts change the challenge, so older and newer scores are not strictly comparable.

## Relics and run recap

One optional violet star relic appears in each chamber, placed to maximize the extra walking beyond the shortest spawn → key → exit journey. Pick it up and carry it through that chamber’s unlocked gate to secure **25 bonus points**. Relics never add spendable coins or unlock gates. A relic held at death is lost; relics already secured in earlier chambers still score.

Final score is **remaining coins + 20 × cleared chambers + 25 × secured relics**. This scoring version uses separate per-difficulty best-score keys (`last-light-best-relics-v1-*`). Older scores remain in storage, but are not displayed or compared against relic scores.

At victory or defeat, choose **View run recap**. Review coins spent on light, actual coins lost to spikes, coins collected, and successful movement steps. Select any visited chamber to see its explored geometry, route, final position and discovered landmarks. Unknown tiles remain hidden. The recap is available until the next run and is not saved across reloads. Costs and labels freeze while paused; new runs reset all metrics.

The browser suite covers relic detours in 900 mazes, locked-gate behavior, banking exactly once, unbanked relic loss, three-relic victory, cost counters, map snapshots, reset behavior and recap layouts on desktop and mobile.
