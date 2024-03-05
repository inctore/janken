import { assert } from "chai";
import Predictor, { Node } from "../src/Predictor";
import { Hand } from "../src/types";

describe("Predictor", () => {
  it("should count subsequence", () => {
    const predictor = new Predictor(3);
    predictor.receive("g");
    predictor.receive("c");
    predictor.receive("p");
    predictor.receive("g");
    predictor.receive("c");

    const node: Node = predictor.root;
    assert.equal(2, node.getCount(["g"]));
    assert.equal(2, node.getCount(["c"]));
    assert.equal(1, node.getCount(["p"]));
    assert.equal(0, node.getCount(["g", "g"]));
    assert.equal(2, node.getCount(["g", "c"]));
    assert.equal(0, node.getCount(["g", "p"]));
    assert.equal(0, node.getCount(["c", "g"]));
    assert.equal(0, node.getCount(["c", "c"]));
    assert.equal(1, node.getCount(["c", "p"]));
    assert.equal(1, node.getCount(["p", "g"]));
    assert.equal(0, node.getCount(["p", "c"]));
    assert.equal(0, node.getCount(["p", "p"]));
    assert.equal(1, node.getCount(["g", "c", "p"]));
  });

  it("should predict next hand", () => {
    const randomHand: () => Hand = () => {
      const hands: Hand[] = ["g", "c", "p"];
      return hands[Math.floor(Math.random() * 3)];
    };
    const predictor = new Predictor(3);
    for (let i = 0; i < 100; i++) {
      predictor.receive(randomHand());
      const hand = predictor.doPredict(3);
      assert.include(["g", "c", "p"], hand);
    }
  });
});
