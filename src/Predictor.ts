// Implementation of Prediction by Partial Match algorithm.
// For details of the alogrithm,
// see https://arxiv.org/pdf/1107.0051.pdf, Section 3.2.

import { HANDS, Hand } from "./types";

export class Node {
  count: number;
  next: {
    g?: Node;
    c?: Node;
    p?: Node;
  };
  constructor() {
    this.count = 0;
    this.next = {
      g: undefined,
      c: undefined,
      p: undefined,
    };
  }
  receive(hands: Hand[]) {
    this.count++;
    if (hands.length === 0) return;
    const hand = hands[hands.length - 1];
    const rest = hands.slice(0, -1);
    const next = this.next[hand] || new Node();
    next.receive(rest);
    this.next[hand] = next;
  }
  getCount(context: Hand[]): number {
    if (context.length === 0) return this.count;
    const hand = context[context.length - 1];
    const rest = context.slice(0, -1);
    const next = this.next[hand];
    if (next === undefined) return 0;
    return next.getCount(rest);
  }
}

export function followers(root: Node, context: Hand[]): Hand[] {
  const ret: Hand[] = [];
  for (let i = 0; i < HANDS.length; i++) {
    const sigma = HANDS[i];
    const s_sigma: Hand[] = [...context, sigma];
    if (root.getCount(s_sigma) > 0) ret.push(sigma);
  }
  return ret;
}

function probability_part(
  root: Node,
  context: Hand[],
  hands: Hand[]
): { [key in Hand]?: number } {
  if (context.length === 0) {
    const probs: { [key in Hand]?: number } = {};
    for (let v of hands) {
      probs[v] = 1 / hands.length;
    }
    return probs;
  }
  const hands1 = followers(root, context).filter((h) => hands.includes(h)); // handsの中でcontextのあとに現れたことがあるもの
  const hands2 = hands.filter((h) => !hands1.includes(h)); // handsの中でcontextのあとに現れたことがないもの
  const counts: { [key in Hand]?: number } = {};
  const probs1: { [key in Hand]?: number } = {};
  for (let h of hands1) {
    const s_sigma = [...context, h];
    counts[h] = root.getCount(s_sigma);
  }
  const sum =
    hands1.reduce((acc, cur) => acc + counts[cur]!, 0) + hands2.length;
  for (let v in counts) {
    probs1[v as Hand] = counts[v as Hand]! / sum;
  }
  if (hands2.length === 0) {
    return probs1;
  }
  const escape = hands2.length / sum;
  const probs2 = probability_part(root, context.slice(1), hands2);
  for (let v in probs2) {
    probs1[v as Hand] = escape * probs2[v as Hand]!;
  }
  return probs1;
}

export function probability(
  root: Node,
  context: Hand[]
): { [key in Hand]: number } {
  const ret = probability_part(root, context, HANDS);
  return ret as { [key in Hand]: number };
}

class Predictor {
  readonly degree: number;
  root: Node;
  history: Hand[];
  constructor(degree: number) {
    this.degree = degree;
    this.root = new Node();
    this.history = [];
  }
  receive(hand: Hand) {
    this.history.push(hand);
    const len = this.history.length;
    const num = Math.min(len, this.degree);
    const context = this.history.slice(len - num);
    this.root.receive(context);
  }
  randomChoice(p: number[]): Hand {
    const r = Math.random();
    if (r < p[0]) return "g";
    if (r < p[0] + p[1]) return "c";
    return "p";
  }
  doPredict(n: number): Hand {
    const prob = probability(this.root, this.history.slice(-n));
    return this.randomChoice([prob["g"], prob["c"], prob["p"]]);
  }
  predict(): Hand {
    return this.doPredict(this.degree);
  }
  reset() {
    this.history = [];
    this.root = new Node();
  }
}

export default Predictor;
