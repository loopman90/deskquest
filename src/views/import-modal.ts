import { ButtonComponent, Modal, Notice } from "obsidian";
import DeskQuestPlugin from "../main";
import { DeskQuestData } from "../data/types";
import { createDefaultData, DEFAULT_SETTINGS } from "../data/defaults";

export class ImportModal extends Modal {
  constructor(private readonly plugin: DeskQuestPlugin) {
    super(plugin.app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("deskquest-import-modal");
    contentEl.createEl("h2", { text: "Import DeskQuest JSON" });
    contentEl.createEl("p", { text: "Paste a DeskQuest JSON export. Import overwrites current DeskQuest plugin data after validation." });
    const textarea = contentEl.createEl("textarea", { cls: "deskquest-import-box" });
    textarea.placeholder = "{ ... }";
    const actions = contentEl.createDiv({ cls: "deskquest-modal-actions" });
    new ButtonComponent(actions).setButtonText("Cancel").onClick(() => this.close());
    new ButtonComponent(actions).setButtonText("Import").setCta().onClick(async () => {
      try {
        const parsed = JSON.parse(textarea.value) as Partial<DeskQuestData>;
        if (!parsed.settings || !parsed.bars || !parsed.xp) {
          new Notice("Import failed: this does not look like DeskQuest data.");
          return;
        }
        const defaults = createDefaultData();
        const nextData: DeskQuestData = {
          ...defaults,
          ...parsed,
          settings: {
            ...DEFAULT_SETTINGS,
            ...parsed.settings,
            mealWindows: {
              ...DEFAULT_SETTINGS.mealWindows,
              ...parsed.settings?.mealWindows
            },
            workdays: {
              ...DEFAULT_SETTINGS.workdays,
              ...parsed.settings?.workdays
            }
          },
          reminderHistory: parsed.reminderHistory ?? defaults.reminderHistory
        };
        await this.plugin.replaceData(nextData);
        new Notice("DeskQuest import complete.");
        this.close();
      } catch (error) {
        console.error(error);
        new Notice("Import failed: invalid JSON.");
      }
    });
  }
}
