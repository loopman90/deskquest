# Changelog

All notable changes to Regen will be documented in this file.

## [0.3.3] - 2026-09-06

### Fixed

- Removed the deprecated settings tab `display()` method.
- Renamed the settings heading to avoid redundant plugin and settings wording.
- Changed dropdown option callbacks to avoid returning component instances.

## [0.3.2] - 2026-09-06

### Fixed

- Aligned the Obsidian development dependency with the declared minimum app version.

## [0.3.1] - 2026-09-06

### Fixed

- Removed redundant directory-context wording from the manifest description.
- Changed `authorUrl` to the author profile URL.
- Replaced a newer workspace reveal API with `setActiveLeaf`.
- Replaced deprecated destructive button and slider tooltip APIs.
- Removed the `builtin-modules` package.
- Cleaned command names and IDs so they do not repeat the plugin name.
- Added release asset artifact attestations.
- Updated the minimum app version to match the newer settings APIs used by the plugin.

## [0.3.0] - 2026-09-06

### Changed

- Renamed the plugin from DeskQuest to Regen.
- Changed plugin id and package name to `regen`.
- Updated documentation and GitHub links for `loopman90/regen`.

### Added

- Node built-in test suite for game engines and reminder due behavior.
- Release workflow now runs tests before publishing plugin assets.
- Daily quest rollover for long-running Obsidian sessions.
- Latest release installation instructions.
- BRAT installation instructions.

## [0.2.0] - 2026-09-06

### Added

- First-run onboarding flow.
- Active reminder model with reminder history.
- Snooze and dismiss reminder commands.
- Recovery, hydration, movement and eye-break reminder evaluation.
- Import JSON command with validation and migration-friendly defaults.
- Reset Today, Reset Game Progress and Reset Everything commands.
- Daily history panel in the dashboard.
- Configurable reminder intervals for movement, eyes and recovery prompts.
- Safer export filenames when a file already exists.

## [0.1.0] - 2026-09-06

### Added

- Initial Obsidian Community Plugin setup.
- Statusbar HUD and dashboard.
- Health, Stamina, Hydration and Food game bars.
- XP, levels, daily quests and weekly goal starter.
- Local persistence, idle handling and sleep-gap handling.
- Break, hydration, meal, snack and movement commands.
- Settings tab, skins and exports.
- GitHub Pages site and automated release workflow.
