# Last Light — complete build prompt

Build a polished, playable browser game called **Last Light**. Deliver a self-contained `index.html` with embedded CSS and vanilla JavaScript, a README, and a GitHub Pages deployment workflow. The HTML must run directly from disk and from a static host without a build process, account, server, API keys, external assets, or network requests. Treat the following as the implementation specification, with the chamber update below taking precedence where it changes the original rules.

## 1. Concept and player experience

A lone explorer must escape three underground chambers. Their lantern consumes the very coins that determine their score. The central decision is when to pay for visibility and when to navigate from memory. Convey quiet tension through darkness and resource decisions, without jump scares, combat, enemies, gore, or mandatory audio.

The core loop is: inspect nearby corridors → choose a route → spend light or navigate in darkness → collect coins → locate a key → unlock the exit → enter the next chamber. A complete run should take roughly 3–8 minutes, depending on navigation and lantern use. This is a design target, not a guaranteed time limit.

## 2. Deliverable and page structure

Use semantic HTML with a responsive, centered layout, approximately 1060px maximum width. Include:

1. Product title, short atmospheric tagline, and one-sentence objective.
2. Difficulty selector, New run, Pause/Resume, and optional sound control.
3. Persistent HUD: coins, chamber out of three, key status, lantern state, personal best.
4. Responsive Canvas game board with a logical resolution of 920 × 600.
5. Initial, paused, victory, and defeat overlays with contextual action buttons.
6. A concise live status line for collection, damage, key, gate, and chamber events.
7. Lantern toggle, keyboard instructions, touch direction pad, and swipe controls.
8. Expandable rules explaining costs, scoring, difficulty, fairness, and accessibility.
9. A short privacy/offline note.

The delivered HTML page is both the playable game and its structured rules sheet. Keep the full implementation prompt in `PROMPT.md` for future changes.

## 3. Dungeon generation

- Each chamber is a 23-column by 15-row tile grid; each logical tile is 40px square.
- Outer borders are walls. Player movement is orthogonal, one tile at a time.
- Generate a connected maze using randomized depth-first search. Carve between odd-coordinate cells, beginning at tile (1, 1).
- Use breadth-first search from the spawn to locate a furthest reachable tile for the gate.
- Choose a key tile randomly from reachable floor cells excluding spawn and gate.
- Place twelve coin piles on distinct remaining floor cells.
- Place difficulty-dependent spike tiles on distinct remaining floor cells.
- Never overlap coins, spikes, key, gate, or spawn. Every item and exit must be reachable without passing through a wall.
- Generate a new random maze for each chamber and each run. Do not promise seeded or daily challenges.
- Hazards may sit on the necessary route; connected geometry does not guarantee survival with poor resource choices.

## 4. Economy and difficulty

| Setting | Starting coins | Lit visibility radius | Spike tiles per chamber |
| --- | ---: | ---: | ---: |
| Explorer | 36 | 6 tiles | 4 |
| Standard | 24 | 4.5 tiles | 7 |
| Desperate | 18 | 3.3 tiles | 10 |

- Default to Standard. A difficulty change applies on the next new run.
- Lit lantern: subtract exactly one coin per accumulated second of active play.
- Unlit lantern: no passive coin consumption; visibility radius is 1.45 tiles.
- Toggling the lantern is immediate and free. Preserve fractional burn time when toggling or entering a new chamber, preventing repeated toggles from avoiding payment.
- Coin pile: add 8 coins, then permanently remove that pile from the current chamber.
- Spike entry: subtract 5 coins, clamped at zero. Spikes remain active, including on revisits. Standing still on spikes does not repeatedly damage the player.
- Coins carry over across chambers. Entry to chambers two and three awards 10 coins each.
- Keys reset on chamber transitions. The lantern starts on in each new chamber.
- Immediately end a run at zero coins, regardless of lantern state. An extinguished lantern does not protect against spike damage.
- No maximum coin cap, regeneration, lives, inventory capacity, upgrades, purchases, or hidden costs.

## 5. Movement and controls

- WASD and arrow keys move up, left, down, and right.
- Limit all movement attempts to one every 130ms. Held directions repeat. When several directions are held, prefer the most recently pressed.
- Walls block movement without coin damage; passive lantern consumption continues.
- Space toggles the lantern. P toggles pause.
- Do not intercept keyboard events from native controls such as buttons or selects.
- Add four labeled touch buttons. Holding one repeats; pointer cancellation or release stops movement.
- Swipes over 15 CSS pixels move one tile in their dominant axis.
- Prevent accidental browser scrolling while interacting with the game board.
- Clear held input on pause, lost window focus, and chamber transitions.

## 6. Game states and progression

Implement explicit ready, playing, paused, won, and lost states.

- Ready: show instructions and Enter the dark; do not consume coins.
- Playing: update movement and the lantern economy.
- Locked gate: entering without a key announces that the key is required; no transition or additional gate penalty.
- Unlocked gate in chambers one/two: increment cleared count, award 10 coins, generate the next maze, reset player/key/lantern, retain purse and partial burn time.
- Unlocked gate in chamber three: increment cleared count and show victory.
- Defeat: show cleared chambers, remaining coins, score, best, and Play again.
- Pause: freeze movement and burn time. Resume explicitly via button or P.
- Automatically pause when the tab becomes hidden or window loses focus. Never resume automatically or charge for background time.
- New run: immediately discard the current run and reset everything except saved best scores and sound preference for the current page session.
- No timer runs behind an overlay.

## 7. Score and persistence

Final score = remaining coins + 20 × number of cleared chambers. Apply the same formula on victory and defeat. Update the best only at the end of a run. Maintain independent best scores per difficulty using localStorage keys such as `last-light-best-standard`. If storage is unavailable, play must continue without throwing errors. Do not add an online leaderboard or collect player data.

## 8. Art direction and visual grammar

Use a restrained dungeon aesthetic: blue-black background, slate walls and floors, warm amber light, ivory player, pale blue key, muted red spikes, and green gate. Pair a large serif title with readable system sans-serif interface text. Favor generous spacing, thin borders, rounded controls, and compact HUD numerals.

Draw all game objects procedurally on Canvas:

- Player: small ivory circle with amber outline and soft radial glow.
- Walls: separated slate rectangular tiles.
- Floors: darker rectangular tiles with narrow gutters.
- Coins: amber circles with a darker center mark.
- Key: blue diamond.
- Spikes: three red outlined triangles.
- Gate: green door rectangle with a locked cross or unlocked upward arrow.

Visibility uses circular distance around the player. Previously seen geometry remains at approximately 13% opacity outside the current radius; hide objects outside current visibility. Unexplored areas remain black. Radial visibility intentionally does not raycast against walls: nearby tiles can be sensed across walls. This is a memory-and-resource maze, not a physically accurate lighting simulation.

Use only a subtle player pulse. Respect `prefers-reduced-motion`. Do not use flashing lights, camera shake, large particles, or motion essential to understanding the game.

## 9. Audio and accessibility

Sound is off by default. If enabled by the player, generate short, quiet Web Audio tones for pickups, lantern toggles, and damage; no external files. Handle unavailable or suspended audio gracefully.

Use visible keyboard focus rings, native buttons and select labels, descriptive touch-button names, an accessible canvas label, and a polite live event region. Distinguish objects by shape as well as color. Explain the game with visible text. Do not claim full screen-reader accessibility: the spatial canvas requires visual navigation in this version.

## 10. Technical requirements

Use requestAnimationFrame, accumulated elapsed time, and a shared movement cooldown. Clamp anomalously long frame deltas to avoid sudden resource loss. Pause on visibility/focus changes. Scale the canvas proportionally with CSS; retain its logical coordinate system. Keep state transitions explicit and generation, movement, HUD, audio, and rendering functions separate enough to inspect. Catch storage/audio failures. No frameworks, packages, CDN fonts, analytics, cookies, or remote services.

## 11. Acceptance checks

- Open the HTML directly and begin a run with the selected starting balance.
- Confirm every generated floor, key, and gate is reachable from spawn across many generated mazes.
- Confirm unique placement of twelve coin piles, one key, and the configured spike count.
- Confirm walls block movement; no diagonal or out-of-bounds movement.
- Confirm coins add 8 once; spikes deduct 5 on each entry; keys collect once.
- Confirm a locked gate does not transition; a key unlocks that chamber only.
- Confirm lit time spends one coin per second; unlit and paused time spend none.
- Confirm partial burn time persists through toggles and chamber changes.
- Confirm zero coins ends the run immediately.
- Confirm chamber bonuses, three-chamber victory, and final score arithmetic.
- Confirm best scores remain separate by difficulty and storage failures do not break play.
- Confirm keyboard, touch pad, swipe, focus behavior, tab hiding, and responsive layouts in a real browser before release.

## 12. GitHub delivery

Provide a repository-ready folder with `index.html`, `PROMPT.md`, `README.md`, and `.github/workflows/pages.yml`. The workflow deploys the repository root on pushes to `main` and manual dispatch using GitHub Pages artifact upload/deploy actions with minimal permissions. Explain that the repository owner must enable Settings → Pages → Source → GitHub Actions. No build command or environment variables are needed. Do not claim the site is published until an actual deployment succeeds.


## 13. Chamber variety update (supersedes conflicting original requirements)

Keep the 23 × 15 connected DFS foundation, then open spiked shortcuts between existing corridors. Each shortcut must bypass a spike-free detour of at least twelve orthogonal steps. Preserve these detours when placing other spikes. Exclude shortcut tiles from key, coin, spawn and gate placement. Choose a furthest reachable non-shortcut tile for the gate.

The Threshold uses 1.15 × the difficulty's lit radius and up to two shortcuts; The Crossroads uses 1.0 × and up to four; The Last Passage uses 0.85 × and up to two. Difficulty trap counts are now maxima; omit extra traps if protected detours leave insufficient space. Darkness remains 1.45 tiles. Existing economy, scoring, partial burn, pause and progression rules remain unchanged.

Show chamber name and guidance, short pickup/damage labels, explicit key status, and a steady low-coin warning at 8 coins or fewer. Freeze labels while paused and respect reduced motion. At widths up to 600px, render an 11 × 11 tile view following the player and clamped to the map, with 44px sticky direction buttons. On wider screens show the whole map. Do not erase explored geometry on resize.

Verify all nine difficulty/chamber combinations over 900 generated mazes, including safe detours, unique and reachable items, gate exclusion, feedback, warning state and camera sizing alongside the original economy and input checks.

## 14. Relics and run recap (supersedes the original scoring formula)

Place one unique, reachable violet four-point star relic per chamber, excluding spawn, gate and existing items. Prefer the tile that maximizes extra movement beyond the shortest spawn-key-gate route. A relic is optional, gives no spendable coins, and requires no additional input to collect. Award 25 points only when it is carried through that chamber's unlocked exit. Keep banked points on later death; discard unbanked relics. Reset all relic state on a new run.

Final score = coins + 20 × cleared chambers + 25 × secured relics. Store best scores under the separate `last-light-best-relics-v1-<difficulty>` keys; leave previous score data intact. Explain this scoring change in the visible rules and README.

On victory/defeat, provide a recap section with score breakdown, light coins spent, actual spike losses (clamped by remaining purse), coins picked up, and successful steps. Snapshot each chamber on exit or death, including explored geometry and route segments. Provide a labeled native chamber selector and render maps with unknown geometry hidden, gold route lines, discovered landmarks, and a final-position marker. Keep snapshots independent of later generated mazes. Freeze all metrics while paused. Clear the recap on new run. Use a keyboard-accessible button from the end overlay to focus the recap heading.

Verify one non-overlapping detour relic in each of 900 generated mazes, no scoring at pickup or locked gate, one award per escaped chamber, death and victory arithmetic, retained banked points, metric accounting, immutable snapshots, selector behavior and mobile layout. No online features, accounts, or new runtime dependencies.
