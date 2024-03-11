import { assert } from "chai";
import Predictor, { Node, followers, probability } from "../src/Predictor";
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

  it("should return valid count", () => {
    const predictor = new Predictor(3);
    assert.equal(0, followers(predictor.root, []).length);

    predictor.receive("g");
    assert.equal(1, followers(predictor.root, []).length);
    assert.equal(0, followers(predictor.root, ["g"]).length);

    predictor.receive("c");
    assert.equal(2, followers(predictor.root, []).length);
    assert.equal(1, followers(predictor.root, ["g"]).length);
    assert.equal(0, followers(predictor.root, ["c"]).length);

    predictor.receive("p");
    assert.equal(3, followers(predictor.root, []).length);
    assert.equal(1, followers(predictor.root, ["g"]).length);
    assert.equal(1, followers(predictor.root, ["c"]).length);
    assert.equal(0, followers(predictor.root, ["p"]).length);
    assert.equal(1, followers(predictor.root, ["g", "c"]).length);
  });

  it("should return valid probability", () => {
    const predictor = new Predictor(3);
    const p1 = probability(predictor.root, []);
    for (let v of ["g", "c", "p"]) {
      assert.equal(1 / 3, p1[v as Hand]);
    }
    predictor.receive("g");
    const p2 = probability(predictor.root, ["g"]);
    for (let v of ["g", "c", "p"]) {
      assert.equal(1 / 3, p2[v as Hand]);
    }

    predictor.receive("g");
    const p3 = probability(predictor.root, ["g"]);
    for (let v of ["g", "c", "p"]) {
      assert.equal(1 / 3, p3[v as Hand]);
    }

    predictor.receive("g");
    const p4 = probability(predictor.root, ["g"]);
    for (let v of ["g", "c", "p"]) {
      if (v === "g") {
        assert.equal(2 / 4, p4[v as Hand]);
      } else {
        assert.equal(1 / 4, p4[v as Hand]);
      }
    }

    const p5 = probability(predictor.root, ["g", "g"]);
    for (let v of ["g", "c", "p"]) {
      assert.equal(1 / 3, p5[v as Hand]);
    }
  });
});
