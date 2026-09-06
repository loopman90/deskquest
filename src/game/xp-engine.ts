import { XpState } from "../data/types";
import { getLevelState } from "./level-engine";

export function awardXp(state: XpState, amount: number): XpState {
  return getLevelState(state.total + Math.max(0, Math.floor(amount)));
}
