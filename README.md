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
- JSON import and reset commands
- Dark mode, light mode and reduced-motion friendly CSS
- Local-only data storage

## Installation For Testing

### Latest Release

Download the latest release from:

[github.com/loopman90/regen/releases/latest](https://github.com/loopman90/regen/releases/latest)

Place these files in your vault:

```text
.obsidian/plugins/regen/
```

Required files:

```text
main.js
manifest.json
styles.css
```

### BRAT

For testing with the BRAT plugin, add this repository:

```text
https://github.com/loopman90/regen
```

### Manual Build

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the plugin:

   ```bash
   npm run build
   ```

3. Copy these files into your vault plugin folder:

   ```text
   .obsidian/plugins/regen/
   ```

   Required files:

   ```text
   main.js
   manifest.json
   styles.css
   ```

4. Open Obsidian, go to **Settings -> Community plugins**, reload installed plugins and enable **Regen**.

## Usage

Open the command palette and run **Regen: Open Regen**.

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
- Export Regen Data as JSON
- Export Regen Stats as CSV

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

Regen uses semver-style versions such as `0.3.0`.

For every release, update these files to the same version:

- `manifest.json`
- `package.json`
- `versions.json`
- `RELEASE_NOTES.md`
- `CHANGELOG.md`

Then create and push a matching tag. Obsidian expects the tag to match `manifest.json` exactly, without a leading `v`.

```bash
git tag 0.3.0
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
