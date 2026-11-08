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

Mazes are random and connected, with the gate at a furthest reachable tile. Visibility is circular and can reveal nearby geometry across walls. Remembered geometry is dim; remembered items are hidden. There are no enemies, raycast shadows, daily seeds, or online scores. Best scores are local to the browser and difficulty. The canvas is visually navigated and does not provide a complete screen-reader mode.

## Verification

Run `node tests/verify.cjs` with Node.js, Playwright, and Chromium installed. Set `CHROMIUM_PATH` if Chromium is not at `/usr/bin/chromium`. These are development-only tools; playing the game needs no dependencies.

The suite checks 300 random mazes across all difficulties, unique and reachable item placement, pickups, repeated spike damage, locked gates, chamber bonuses, fractional lantern time, pause, victory/defeat, separate best scores, and storage write failures. Chromium checks cover keyboard input, button focus, direction pad, swipes, focus-loss pause, and desktop/mobile layouts. Screenshots are included. Testing uses a local HTTP server; this environment's browser policy blocks direct file URLs. Audible quality and physical-device touch have not been manually verified.

## Changes from the supplied prototype

- Refined brass-and-slate interface, lantern emblem, persistent map legend, and responsive controls.
- Keyboard focus returns to the maze after lantern and sound clicks.
- Most recently pressed directions take precedence; inactive overlays cannot queue held movement.
- Pending swipes clear on pause, game end, and chamber transitions.
- Player animation stops while paused; audio resume failures are handled.
- Included repeatable browser and gameplay tests.
