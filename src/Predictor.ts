import { Hand } from "./types";

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
    const sum = p.reduce((acc, cur) => acc + cur, 0);
    for (let i = 0; i < p.length; i++) {
      p[i] /= sum;
    }
    const r = Math.random();
    if (r < p[0]) return "g";
    if (r < p[0] + p[1]) return "c";
    return "p";
  }
  doPredict(n: number): Hand {
    if (n === 0) {
      return this.randomChoice([1, 1, 1]);
    }
    const context = this.history.slice(-n);
    const node = this.root;
    const g = node.getCount([...context, "g"]);
    const c = node.getCount([...context, "c"]);
    const p = node.getCount([...context, "p"]);
    const max = Math.max(g, c, p);
    if (max === 0) {
      return this.doPredict(n - 1);
    }
    return this.randomChoice([g, c, p]);
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
