import { setIcon } from "obsidian";
import { DeskQuestData } from "../data/types";
import { getHealthLabel } from "../game/health-engine";
import { roundBar } from "../utils/number";

export function renderHud(container: HTMLElement, data: DeskQuestData): void {
  container.empty();
  container.addClass("deskquest-hud");
  container.toggleClass("deskquest-hud-compact", data.settings.hudMode !== "full");

  const bars = [
    ["heart-pulse", "Health", data.bars.health],
    ["zap", "Stamina", data.bars.stamina],
    ["droplets", "Hydration", data.bars.hydration],
    ["utensils", "Food", data.bars.food]
  ] as const;

  bars.forEach(([icon, label, value]) => {
    const item = container.createDiv({ cls: "deskquest-meter" });
    const head = item.createDiv({ cls: "deskquest-meter-head" });
    const iconBox = head.createSpan({ cls: "deskquest-meter-icon" });
    setIcon(iconBox, icon);
    head.createSpan({ text: label, cls: "deskquest-meter-label" });
    head.createSpan({ text: String(roundBar(value)), cls: "deskquest-meter-value" });

    const track = item.createDiv({ cls: "deskquest-meter-track" });
    const fill = track.createDiv({ cls: "deskquest-meter-fill" });
    fill.style.width = `${roundBar(value)}%`;
  });

  const xp = container.createDiv({ cls: "deskquest-xp" });
  xp.createSpan({ text: `LV ${data.xp.level}` });
  xp.createSpan({ text: `${data.xp.total} XP` });
  xp.createSpan({ text: getHealthLabel(data.bars.health) });
}

export function statusText(data: DeskQuestData): string {
  const h = roundBar(data.bars.health);
  const s = roundBar(data.bars.stamina);
  const hy = roundBar(data.bars.hydration);
  const f = roundBar(data.bars.food);
  if (data.settings.hudMode === "minimal") return `DQ ${s}`;
  if (data.settings.hudMode === "compact") return `Stamina ${s} Health ${h}`;
  return `Health ${h} Food ${f} Hydration ${hy} Stamina ${s} LV ${data.xp.level}`;
}
