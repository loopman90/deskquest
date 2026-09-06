import { DeskQuestData, DeskQuestSettings, Quest } from "./types";
import { getLevelState } from "../game/level-engine";

export const DISCLAIMER =
  "DeskQuest is a gamified productivity and work-rhythm tool. Health, Stamina, Hydration and Food are fictional game indicators based on configured routines and activity. DeskQuest does not provide medical advice.";

export const DEFAULT_SETTINGS: DeskQuestSettings = {
  enabled: true,
  startAutomatically: false,
  trackOutsideObsidian: false,
  idleTimeoutMinutes: 5,
  difficulty: "balanced",
  lowStaminaThreshold: 25,
  hydrationEnabled: true,
  hydrationIntervalMinutes: 75,
  hydrationRandomizationMinutes: 10,
  foodEnabled: true,
  snacksEnabled: true,
  caffeineMode: false,
  movementEnabled: true,
  eyeBreaksEnabled: true,
  animationsEnabled: true,
  soundsEnabled: false,
  randomEventsEnabled: false,
  remindersEnabled: true,
  microbreakIntervalMinutes: 30,
  movementQuestIntervalMinutes: 60,
  eyeBreakIntervalMinutes: 20,
  recoveryPromptMinutes: 60,
  strongRecoveryNudgeMinutes: 75,
  quietHudOnly: false,
  patternRecognition: false,
  dailyNotesIntegration: false,
  tasksIntegration: false,
  skin: "obsidian-native",
  hudMode: "full",
  mealWindows: {
    breakfast: { enabled: true, start: "07:00", end: "10:00", value: 50 },
    lunch: { enabled: true, start: "11:30", end: "14:00", value: 60 },
    dinner: { enabled: true, start: "17:00", end: "20:00", value: 70 }
  },
  workdays: {
    monday: { profile: "workday", start: "08:30", end: "17:30" },
    tuesday: { profile: "workday", start: "08:30", end: "17:30" },
    wednesday: { profile: "workday", start: "08:30", end: "17:30" },
    thursday: { profile: "workday", start: "08:30", end: "17:30" },
    friday: { profile: "workday", start: "08:30", end: "17:30" },
    saturday: { profile: "day-off", start: "10:00", end: "14:00" },
    sunday: { profile: "day-off", start: "10:00", end: "14:00" }
  }
};

export function createDailyQuests(): Quest[] {
  return [
    {
      id: "daily-balanced-session",
      title: "Balanced Session",
      description: "Complete a focus session and a recovery break.",
      category: "focus",
      completed: false,
      rewardXp: 25,
      rewardHealth: 3
    },
    {
      id: "daily-hydration",
      title: "Hydration Check",
      description: "Register a drink during your workday.",
      category: "hydration",
      completed: false,
      rewardXp: 5
    },
    {
      id: "daily-movement",
      title: "Movement Quest",
      description: "Step away and move for a few minutes.",
      category: "movement",
      completed: false,
      rewardXp: 15,
      rewardHealth: 5,
      rewardStamina: 10
    }
  ];
}

export function createDefaultData(): DeskQuestData {
  return {
    settings: DEFAULT_SETTINGS,
    bars: {
      health: 100,
      stamina: 100,
      hydration: 75,
      food: 75
    },
    xp: getLevelState(0),
    dailyQuests: createDailyQuests(),
    weeklyGoals: [
      {
        id: "weekly-balanced-days",
        title: "Balanced Days",
        description: "End five workdays with a Workday Score of 75 or higher.",
        category: "focus",
        completed: false,
        rewardXp: 250
      }
    ],
    stats: {},
    completedQuestIds: [],
    reminderHistory: [],
    onboarded: false,
    schemaVersion: 1
  };
}
