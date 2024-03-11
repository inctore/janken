export type Hand = "g" | "c" | "p";
export type Result = "win" | "lose" | "draw";
export type ResultCount = {
  win: number;
  lose: number;
  draw: number;
};
export const HANDS: Hand[] = ["g", "c", "p"];
