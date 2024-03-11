import { useState } from "react";
import "./App.css";
import { Hand, Result, ResultCount } from "./types";
import Predictor from "./Predictor";

type HandPair =
  | {
      ai: Hand;
      player: Hand;
    }
  | {
      ai: undefined;
      player: undefined;
    };

const handMap = {
  g: "✊",
  c: "✌️",
  p: "✋",
};

function HistoryCell(hand: Hand): JSX.Element {
  return <span>{handMap[hand]}</span>;
}

function SelectHandButton(props: {
  hand: Hand;
  cb: () => void;
  disabled: boolean;
}): JSX.Element {
  return (
    <button
      className="select-hand"
      disabled={props.disabled}
      onClick={(e) => {
        e.preventDefault();
        props.cb();
      }}
    >
      {handMap[props.hand]}
    </button>
  );
}

function PlayCell(hand?: Hand): JSX.Element {
  return (
    <span style={{ fontSize: "3em", margin: "0.5em" }}>
      {hand ? handMap[hand] : "-"}
    </span>
  );
}

function judge(myHand: Hand, enemyHand: Hand): Result {
  if (myHand === enemyHand) return "draw";
  if (
    (myHand === "g" && enemyHand === "c") ||
    (myHand === "c" && enemyHand === "p") ||
    (myHand === "p" && enemyHand === "g")
  )
    return "win";
  return "lose";
}

const timeLimit = 20;

function App() {
  const [predictor, _] = useState(new Predictor(5));
  const [handHistory, setHandHistory] = useState<Hand[]>([]);
  const [hands, setHands] = useState<HandPair>({
    ai: undefined,
    player: undefined,
  });
  const [numMatches, setNumMatches] = useState(0);
  const [resultCount, setResultCount] = useState<ResultCount>({
    win: 0,
    lose: 0,
    draw: 0,
  });
  const [countdown, setCountdown] = useState<number>(timeLimit);
  const [status, setStatus] = useState<"playing" | "finished" | "before">(
    "before"
  );

  const chooseHand = () => {
    return predictor.predict();
  };

  const startCountdown = () => {
    setStatus("playing");
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    setTimeout(
      () => {
        clearInterval(interval);
        setStatus("finished");
        setCountdown(timeLimit);
      },
      timeLimit * 1000 + 10
    );
  };

  const onSelect = (hand: Hand) => () => {
    const aiHand = chooseHand();
    const result = judge(hand, aiHand);
    predictor.receive(hand);
    setNumMatches((prev) => prev + 1);
    setResultCount((prev) => ({ ...prev, [result]: prev[result] + 1 }));
    setHands({ ai: aiHand, player: hand });
    setHandHistory((prev) => [...prev, hand]);
  };

  const start = () => {
    startCountdown();
    setHandHistory([]);
    setHands({ ai: undefined, player: undefined });
    setNumMatches(0);
    setResultCount({ win: 0, lose: 0, draw: 0 });
    predictor.reset();
  };

  return (
    <>
      <div className="header">
        <div className="header-content">
          <div>
            <button disabled={status === "playing"} onClick={start}>
              start
            </button>
          </div>
          <div>
            <table
              style={{
                marginLeft: "auto",
                marginRight: "auto",
                display: "block",
                width: "12rem",
              }}
            >
              <tr>
                <th>試合数</th>
                <th>引分</th>
                <th>AI的中率</th>
              </tr>
              <tr>
                <td>{numMatches}</td>
                <td>{resultCount.draw}</td>
                <td>{Math.floor((100 * resultCount.draw) / numMatches)}%</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div>
          <pre>AI</pre>
          {PlayCell(hands.ai)}
        </div>
        <div>
          <pre>あなた</pre>
          {PlayCell(hands.player)}
        </div>
      </div>
      <div>
        <SelectHandButton
          hand="g"
          cb={onSelect("g")}
          disabled={status !== "playing"}
        />
        <SelectHandButton
          hand="c"
          cb={onSelect("c")}
          disabled={status !== "playing"}
        />
        <SelectHandButton
          hand="p"
          cb={onSelect("p")}
          disabled={status !== "playing"}
        />
      </div>
      <div>
        <div>残り時間</div>
        <div style={{ fontSize: "3rem" }}>{countdown || "-"}</div>
      </div>
      <div style={{ maxWidth: "13rem", margin: "0 auto" }}>
        {handHistory.map(HistoryCell)}
      </div>
    </>
  );
}

export default App;
