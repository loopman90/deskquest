# Regen

Regen is an Obsidian Community Plugin starter for a local, gamified work-rhythm HUD.

**Work. Recover. Continue.**

Regen helps you balance focus sessions with recovery, hydration, meals, movement and eye breaks. It is intentionally advisory: it never blocks work, never removes XP, never removes levels and never shames missed days.

> Regen is a gamified productivity and work-rhythm tool. Health, Stamina, Hydration and Food are fictional game indicators based on configured routines and activity. Regen does not provide medical advice.

## Features

- Health, Stamina, Hydration and Food game bars
- XP and progressive levels
- Daily quests and weekly goals
- Work sessions with idle and sleep-gap handling
- Microbreaks, recovery breaks, long breaks and movement quests
- Hydration, meal and snack check-ins with cooldowns
- Statusbar HUD: full, compact and minimal
- Regen dashboard view
- Settings tab with safe defaults
- 25 presentation-only skins
- JSON and CSV export commands
- First-run onboarding
- Snoozeable reminders
- Combined recovery reminder objectives
- Daily, weekly and monthly dashboard statistics
- JSON import and reset commands
- Dark mode, light mode and reduced-motion friendly CSS
- Local-only data storage

## Installation

Regen is not listed in the Obsidian Community Plugin browser yet. Until it is accepted there, use one of the testing installation methods below.

### Option 1: Install With BRAT

BRAT is the easiest way to install and update beta Obsidian plugins from GitHub.

1. In Obsidian, open **Settings -> Community plugins**.
2. Turn off **Restricted mode** if it is still enabled.
3. Click **Browse** and install **BRAT**.
4. Enable **BRAT**.
5. Open the command palette.
6. Run **BRAT: Add a beta plugin for testing**.
7. Paste this repository URL:

   ```text
   https://github.com/loopman90/regen
   ```

8. Confirm the installation.
9. Go back to **Settings -> Community plugins**.
10. Enable **Regen**.
11. Run **Regen: Open** from the command palette.

### Option 2: Manual Install From GitHub Release

Use this if you do not want to use BRAT.

1. Download the latest release:

   [github.com/loopman90/regen/releases/latest](https://github.com/loopman90/regen/releases/latest)

2. Download these three files from the release assets:

   ```text
   main.js
   manifest.json
   styles.css
   ```

3. Open your Obsidian vault folder on your computer.
4. Inside the vault, create this folder if it does not already exist:

   ```text
   .obsidian/plugins/regen/
   ```

5. Put the three downloaded files into that folder:

   ```text
   .obsidian/plugins/regen/main.js
   .obsidian/plugins/regen/manifest.json
   .obsidian/plugins/regen/styles.css
   ```

6. Restart Obsidian, or reload plugins from **Settings -> Community plugins**.
7. Enable **Regen**.
8. Run **Regen: Open** from the command palette.

### Option 3: Build From Source

Use this if you want to develop Regen locally.

1. Clone the repository:

   ```bash
   git clone https://github.com/loopman90/regen.git
   cd regen
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the plugin:

   ```bash
   npm run build
   ```

4. Copy the built plugin files into your vault:

   ```text
   .obsidian/plugins/regen/
   ```

   Required files:

   ```text
   main.js
   manifest.json
   styles.css
   ```

5. Enable **Regen** in Obsidian.

### Updating

If you installed with BRAT, use **BRAT: Check for updates to all beta plugins**.

If you installed manually, download the latest release assets again and replace the old files in:

```text
.obsidian/plugins/regen/
```

### Troubleshooting

- If Regen does not appear, make sure the folder name is exactly `regen`.
- If Obsidian says the plugin failed to load, confirm that `main.js`, `manifest.json` and `styles.css` are all in the same folder.
- If Obsidian reports a version mismatch, use a release tag that exactly matches `manifest.json`, such as `0.3.0` rather than `v0.3.0`.
- If the dashboard does not open, run **Regen: Open Regen** from the command palette.

## Usage

Open the command palette and run **Regen: Open**.

Common commands:

- Start Work Session
- Start Focus Session
- Start Microbreak
- Start Recovery Break
- Register Drink
- Register Breakfast, Lunch or Dinner
- Register Snack
- Start Movement Quest
- End Workday
- Export Data as JSON
- Export Stats as CSV

## Presets

The default mode is **Balanced**:

- Eye break every 20 minutes
- Micro movement around 30 minutes
- Focus nudge around 50 minutes
- Recovery prompt around 60 minutes
- Stronger recovery nudge around 75 minutes
- Hydration around 75 minutes, with randomization
- Breakfast, lunch and dinner windows

Other modes included in the settings model:

- Relaxed
- Pomodoro
- Deep Work
- Hardcore
- Custom

## Skins

Regen includes 25 presentation-only skins. Skins can change color, spacing and HUD feel, but never game logic.

## Privacy

Regen is built to work completely locally:

- No account required
- No AI required
- No cloud backend
- No advertising
- No telemetry by default
- No reading content from other applications

The **Track activity outside Obsidian** setting is off by default. The current implementation falls back to Obsidian activity.

## Development

```bash
npm install
npm run dev
```

Run a production build:

```bash
npm run build
```

## Versioning And Releases

Regen uses semver-style versions such as `0.4.0`.

For every release, update these files to the same version:

- `manifest.json`
- `package.json`
- `versions.json`
- `RELEASE_NOTES.md`
- `CHANGELOG.md`

Then create and push a matching tag. Obsidian expects the tag to match `manifest.json` exactly, without a leading `v`.

```bash
git tag 0.4.0
git push origin main --tags
```

GitHub Actions will build the plugin and publish a release with the Obsidian plugin assets:

- `main.js`
- `manifest.json`
- `styles.css`

## Tests

Run the local test suite:

```bash
npm test
```

The release workflow runs tests before publishing Obsidian assets.

## Roadmap

V1 foundation:

- Richer reminders and snooze escalation
- Onboarding flow
- Weekly and monthly statistics views
- Import with overwrite confirmation
- Safer file overwrite handling for exports

V1.1+ ideas:

- Focus Boss
- Mood check-ins
- Local pattern recognition
- Daily Notes integration
- Tasks integration
- Random events
- Community skins

## FAQ

### Is this a medical app?

No. Regen uses fictional game indicators and does not provide medical advice.

### Does Health measure my real health?

No. Health is a game value based on configured routines and work rhythm.

### Can Regen stop me from working?

No. Regen never blocks work. It only suggests recovery.

### Does Regen need internet?

No. The plugin is designed to run locally.
