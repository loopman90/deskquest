import { Plugin } from "obsidian";
import { createDefaultData, DEFAULT_SETTINGS } from "./defaults";
import { RegenData } from "./types";

export class RegenStore {
  private saveTimer: number | undefined;

  constructor(private readonly plugin: Plugin) {}

  async load(): Promise<RegenData> {
    const saved: unknown = await this.plugin.loadData();
    const defaults = createDefaultData();
    if (!saved || typeof saved !== "object") {
      return defaults;
    }

    const partial = saved as Partial<RegenData>;
    return {
      ...defaults,
      ...partial,
      settings: {
        ...DEFAULT_SETTINGS,
        ...partial.settings,
        mealWindows: {
          ...DEFAULT_SETTINGS.mealWindows,
          ...partial.settings?.mealWindows
        },
        workdays: {
          ...DEFAULT_SETTINGS.workdays,
          ...partial.settings?.workdays
        }
      },
      bars: {
        ...defaults.bars,
        ...partial.bars
      },
      xp: {
        ...defaults.xp,
        ...partial.xp
      },
      reminderHistory: partial.reminderHistory ?? defaults.reminderHistory,
      lastQuestDate: partial.lastQuestDate ?? defaults.lastQuestDate
    };
  }

  requestSave(data: RegenData): void {
    window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => {
      void this.plugin.saveData(data);
    }, 500);
  }

  async flush(data: RegenData): Promise<void> {
    window.clearTimeout(this.saveTimer);
    await this.plugin.saveData(data);
  }
}
