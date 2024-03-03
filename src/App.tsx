import { useState } from "react";
import "./App.css";

type Hand = "g" | "c" | "p";
type Result = "win" | "lose" | "draw";
type HandPair = [Hand, Hand];

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

function PlayCell(hand: Hand): JSX.Element {
  return <span style={{ fontSize: "6em" }}>{handMap[hand]}</span>;
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
  const [hands, setHands] = useState<HandPair | null>(null);
  const [numMatches, setNumMatches] = useState(0);
  const [numWins, setNumWins] = useState(0);

  const onSelect = (hand: Hand) => (e: any) => {
    e.preventDefault();
    const myHand = chooseHand();
    const result = judge(myHand, hand);
    setNumMatches((prev) => prev + 1);
    if (result === "win") setNumWins((prev) => prev + 1);
    setHands([myHand, hand]);
    setHandHistory((prev) => [...prev, hand]);
  };

  return (
    <>
      <div>
        <button>reload</button>
      </div>
      <div>
        {numWins} / {numMatches}
      </div>
      <div>{hands ? hands.map(PlayCell) : null}</div>
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
