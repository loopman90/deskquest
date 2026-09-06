import { ButtonComponent, Modal } from "obsidian";
import RegenPlugin from "../main";

export class ConfirmModal extends Modal {
  constructor(
    plugin: RegenPlugin,
    private readonly title: string,
    private readonly message: string,
    private readonly confirmLabel: string,
    private readonly onConfirm: () => Promise<void> | void
  ) {
    super(plugin.app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.title });
    contentEl.createEl("p", { text: this.message });
    const actions = contentEl.createDiv({ cls: "regen-modal-actions" });
    new ButtonComponent(actions).setButtonText("Cancel").onClick(() => this.close());
    new ButtonComponent(actions).setButtonText(this.confirmLabel).setWarning().onClick(async () => {
      await this.onConfirm();
      this.close();
    });
  }
}
