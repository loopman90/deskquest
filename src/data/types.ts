export type BarKey = "health" | "stamina" | "hydration" | "food";

export type BreakType = "micro" | "eye" | "movement" | "recovery" | "long";

export type DifficultyMode = "relaxed" | "balanced" | "pomodoro" | "deep-work" | "hardcore" | "custom";

export type ReminderLevel = "passive" | "nudge" | "prompt";

export type DayProfile = "workday" | "light-day" | "day-off" | "custom";

export type MealKind = "breakfast" | "lunch" | "dinner" | "snack" | "custom";

export interface GameBars {
  health: number;
  stamina: number;
  hydration: number;
  food: number;
}

export interface XpState {
  total: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
}

export interface WorkSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  activeMs: number;
  idleMs: number;
  breakMs: number;
  longestContinuousMs: number;
  status: "active" | "paused" | "ended";
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: "break" | "hydration" | "food" | "movement" | "focus" | "custom";
  completed: boolean;
  rewardXp: number;
  rewardHealth?: number;
  rewardStamina?: number;
}

export interface ReminderState {
  id: string;
  title: string;
  message: string;
  level: ReminderLevel;
  category: "stamina" | "hydration" | "food" | "movement" | "eyes" | "recovery";
  objectives: ReminderObjective[];
  createdAt: number;
  snoozedUntil?: number;
  snoozeCount: number;
}

export interface ReminderObjective {
  id: string;
  label: string;
  category: "break" | "hydration" | "movement" | "eyes" | "food";
  completed: boolean;
}

export interface DailyStats {
  date: string;
  activeWorkMs: number;
  breakMs: number;
  longestSessionMs: number;
  hydrationCheckins: number;
  mealCheckins: number;
  snackCheckins: number;
  movementQuests: number;
  eyeBreaks: number;
  healthStart: number;
  healthEnd: number;
  lowestStamina: number;
  xpEarned: number;
  workdayScore: number;
}

export interface MealWindow {
  enabled: boolean;
  start: string;
  end: string;
  value: number;
}

export interface WorkdayConfig {
  profile: DayProfile;
  start: string;
  end: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface RegenSettings {
  enabled: boolean;
  startAutomatically: boolean;
  trackOutsideObsidian: boolean;
  idleTimeoutMinutes: number;
  difficulty: DifficultyMode;
  lowStaminaThreshold: number;
  hydrationEnabled: boolean;
  hydrationIntervalMinutes: number;
  hydrationRandomizationMinutes: number;
  foodEnabled: boolean;
  snacksEnabled: boolean;
  caffeineMode: boolean;
  movementEnabled: boolean;
  eyeBreaksEnabled: boolean;
  animationsEnabled: boolean;
  soundsEnabled: boolean;
  randomEventsEnabled: boolean;
  remindersEnabled: boolean;
  microbreakIntervalMinutes: number;
  movementQuestIntervalMinutes: number;
  eyeBreakIntervalMinutes: number;
  recoveryPromptMinutes: number;
  strongRecoveryNudgeMinutes: number;
  quietHudOnly: boolean;
  patternRecognition: boolean;
  dailyNotesIntegration: boolean;
  tasksIntegration: boolean;
  skin: string;
  hudMode: "full" | "compact" | "minimal";
  mealWindows: Record<"breakfast" | "lunch" | "dinner", MealWindow>;
  workdays: Record<string, WorkdayConfig>;
}

export interface RegenData {
  settings: RegenSettings;
  bars: GameBars;
  xp: XpState;
  activeSession?: WorkSession;
  dailyQuests: Quest[];
  weeklyGoals: Quest[];
  stats: Record<string, DailyStats>;
  completedQuestIds: string[];
  lastQuestDate: string;
  activeReminder?: ReminderState;
  reminderHistory: ReminderState[];
  lastHydrationAt?: number;
  lastMealAt?: Partial<Record<MealKind, number>>;
  lastMovementAt?: number;
  lastEyeBreakAt?: number;
  onboarded: boolean;
  schemaVersion: number;
}
