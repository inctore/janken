import { useState } from "react";
import "./App.css";

type Hand = "g" | "c" | "p";
type Result = "win" | "lose" | "draw";
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

function chooseHand(): Hand {
  const hands: Hand[] = ["g", "c", "p"];
  return hands[Math.floor(Math.random() * 3)];
}

function PlayCell(hand?: Hand): JSX.Element {
  return (
    <span style={{ fontSize: "6em", margin: "0.5em" }}>
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

function App() {
  const [handHistory, setHandHistory] = useState<Hand[]>([]);
  const [hands, setHands] = useState<HandPair>({
    ai: undefined,
    player: undefined,
  });
  const [numMatches, setNumMatches] = useState(0);
  const [numWins, setNumWins] = useState(0);

  const onSelect = (hand: Hand) => (e: any) => {
    e.preventDefault();
    const myHand = chooseHand();
    const result = judge(myHand, hand);
    setNumMatches((prev) => prev + 1);
    if (result === "win") setNumWins((prev) => prev + 1);
    setHands({ ai: myHand, player: hand });
    setHandHistory((prev) => [...prev, hand]);
  };

  const reload = () => {
    setHandHistory([]);
    setHands({ ai: undefined, player: undefined });
    setNumMatches(0);
    setNumWins(0);
  };

  return (
    <>
      <div className="header">
        <div className="header-content">
          <div>
            <button onClick={reload}>reload</button>
          </div>
          <div>
            {numWins} / {numMatches}
          </div>
        </div>
      </div>
      <div>
        {PlayCell(hands.ai)}
        {PlayCell(hands.player)}
      </div>
      <div>
        <button onClick={onSelect("g")}>✊</button>
        <button onClick={onSelect("c")}>✌️</button>
        <button onClick={onSelect("p")}>✋</button>
      </div>
      <div>{handHistory.map(HistoryCell)}</div>
    </>
  );
}

export default App;
