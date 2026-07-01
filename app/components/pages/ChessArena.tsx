"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess, type Move, type PieceSymbol, type Square } from "chess.js";
import type { IconType } from "react-icons";
import {
  FaChessBishop,
  FaChessKing,
  FaChessKnight,
  FaChessPawn,
  FaChessQueen,
  FaChessRook,
  FaExchangeAlt,
  FaLightbulb,
  FaPlay,
  FaRedoAlt,
  FaTimes,
  FaUndoAlt,
} from "react-icons/fa";
import { Slide } from "@/app/animation/Slide";

type Difficulty = "casual" | "sharp";

type LastMove = {
  from: Square;
  to: Square;
};

type GameOutcome =
  | {
      tone: "win" | "loss" | "draw";
      title: string;
      message: string;
    }
  | null;

const humanColor = "w";
const botColor = "b";
const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const startFen = new Chess().fen();

const pieceIcons: Record<PieceSymbol, IconType> = {
  k: FaChessKing,
  q: FaChessQueen,
  r: FaChessRook,
  b: FaChessBishop,
  n: FaChessKnight,
  p: FaChessPawn,
};

const pieceValues: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 100,
};

function getSquare(file: string, rank: number) {
  return `${file}${rank}` as Square;
}

function isLightSquare(square: Square) {
  const fileIndex = files.indexOf(square[0] as (typeof files)[number]);
  const rank = Number(square[1]);

  return (fileIndex + rank) % 2 === 0;
}

function getBoardSquares(isFlipped: boolean) {
  const visibleRanks = isFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const visibleFiles = isFlipped ? [...files].reverse() : files;

  return visibleRanks.flatMap((rank) =>
    visibleFiles.map((file) => getSquare(file, rank))
  );
}

function getGameStatus(game: Chess, botThinking: boolean) {
  if (game.isCheckmate()) {
    return game.turn() === humanColor
      ? "Checkmate. Ayush bot wins."
      : "Checkmate. You beat the bot.";
  }

  if (game.isStalemate()) return "Stalemate.";
  if (game.isDraw()) return "Draw.";
  if (botThinking || game.turn() === botColor) return "Ayush bot is thinking.";
  if (game.isCheck()) return "Your king is in check.";

  return "Your move.";
}

function getGameOutcome(game: Chess): GameOutcome {
  if (game.isCheckmate()) {
    return game.turn() === humanColor
      ? {
          tone: "loss",
          title: "Ayush Bot wins",
          message: "Checkmate. Reset the board and try a cleaner line.",
        }
      : {
          tone: "win",
          title: "You won!",
          message: "Checkmate. That one deserves a little victory glow.",
        };
  }

  if (game.isStalemate()) {
    return {
      tone: "draw",
      title: "Stalemate",
      message: "No legal moves left. That match ends even.",
    };
  }

  if (game.isDraw()) {
    return {
      tone: "draw",
      title: "Draw",
      message: "The board could not find a winner this time.",
    };
  }

  return null;
}

function scoreMove(fen: string, move: Move, difficulty: Difficulty) {
  const testGame = new Chess(fen);
  let score = 0;

  if (move.captured) score += pieceValues[move.captured] * 12;
  if (move.promotion) score += pieceValues[move.promotion] * 9;

  try {
    testGame.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion ?? "q",
    });
  } catch {
    return Number.NEGATIVE_INFINITY;
  }

  if (testGame.isCheckmate()) score += 1000;
  if (testGame.isCheck()) score += 4;

  const targetFile = files.indexOf(move.to[0] as (typeof files)[number]);
  const targetRank = Number(move.to[1]);
  const centralDistance = Math.abs(targetFile - 3.5) + Math.abs(targetRank - 4.5);
  score += Math.max(0, 5 - centralDistance) * 0.25;

  if (difficulty === "sharp") {
    const replies = testGame.moves({ verbose: true });
    const bestReplyCapture = replies.reduce((best, reply) => {
      if (!reply.captured) return best;
      return Math.max(best, pieceValues[reply.captured]);
    }, 0);

    score -= bestReplyCapture * 4;
  }

  return score;
}

function chooseBotMove(fen: string, difficulty: Difficulty) {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });

  if (!moves.length) return null;

  return moves
    .map((move) => ({
      move,
      score:
        scoreMove(fen, move, difficulty) +
        (difficulty === "casual" ? Math.random() * 8 : Math.random() * 1.8),
    }))
    .sort((a, b) => b.score - a.score)[0].move;
}

function chooseHintMove(fen: string, difficulty: Difficulty) {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });

  if (!moves.length) return null;

  return moves
    .map((move) => ({
      move,
      score: scoreMove(fen, move, difficulty),
    }))
    .sort((a, b) => b.score - a.score)[0].move;
}

function movePairs(history: Move[]) {
  const pairs: Array<{ white?: Move; black?: Move }> = [];

  history.forEach((move, index) => {
    const pairIndex = Math.floor(index / 2);

    if (!pairs[pairIndex]) pairs[pairIndex] = {};
    if (move.color === humanColor) pairs[pairIndex].white = move;
    if (move.color === botColor) pairs[pairIndex].black = move;
  });

  return pairs;
}

export default function ChessArena() {
  const [isOpen, setIsOpen] = useState(false);
  const [fen, setFen] = useState(startFen);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [hintMove, setHintMove] = useState<LastMove | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<Square | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("sharp");
  const [botThinking, setBotThinking] = useState(false);

  const game = useMemo(() => new Chess(fen), [fen]);
  const boardSquares = useMemo(() => getBoardSquares(isFlipped), [isFlipped]);
  const history = game.history({ verbose: true });
  const legalTargets = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true }).map((move) => move.to)
    : [];
  const status = getGameStatus(game, botThinking);
  const gameOutcome = getGameOutcome(game);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("ayush:chess-open", { detail: { isOpen } })
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("ayush:chess-open", { detail: { isOpen: false } })
      );
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setBotThinking(false);
      return;
    }

    if (game.turn() !== botColor || game.isGameOver()) {
      setBotThinking(false);
      return;
    }

    setBotThinking(true);
    const moveTimer = window.setTimeout(() => {
      const botMove = chooseBotMove(fen, difficulty);

      if (!botMove) {
        setBotThinking(false);
        return;
      }

      const nextGame = new Chess(fen);
      const move = nextGame.move({
        from: botMove.from,
        to: botMove.to,
        promotion: botMove.promotion ?? "q",
      });

      setLastMove({ from: move.from, to: move.to });
      setHintMove(null);
      setFen(nextGame.fen());
      setBotThinking(false);
    }, 520);

    return () => window.clearTimeout(moveTimer);
  }, [difficulty, fen, game, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  function resetGame() {
    setFen(startFen);
    setSelectedSquare(null);
    setLastMove(null);
    setHintMove(null);
    setHoveredSquare(null);
    setBotThinking(false);
  }

  function undoLastTurn() {
    const nextGame = new Chess(fen);

    if (!history.length || botThinking) return;

    nextGame.undo();
    if (nextGame.turn() === botColor) nextGame.undo();

    setFen(nextGame.fen());
    setSelectedSquare(null);
    setLastMove(null);
    setHintMove(null);
  }

  function showHint() {
    if (game.turn() !== humanColor || game.isGameOver() || botThinking) return;

    const move = chooseHintMove(fen, difficulty);
    if (!move) return;

    setSelectedSquare(move.from);
    setHintMove({ from: move.from, to: move.to });
  }

  function makeMove(from: Square, to: Square) {
    const nextGame = new Chess(fen);

    try {
      const move = nextGame.move({ from, to, promotion: "q" });

      setFen(nextGame.fen());
      setSelectedSquare(null);
      setHintMove(null);
      setLastMove({ from: move.from, to: move.to });
    } catch {
      setSelectedSquare(null);
    }
  }

  function handleSquareClick(square: Square) {
    if (game.turn() !== humanColor || game.isGameOver() || botThinking) return;

    const piece = game.get(square);

    if (selectedSquare) {
      if (legalTargets.includes(square)) {
        makeMove(selectedSquare, square);
        return;
      }

      if (piece?.color === humanColor) {
        setSelectedSquare(square);
        setHintMove(null);
        return;
      }

      setSelectedSquare(null);
      setHintMove(null);
      return;
    }

    if (piece?.color === humanColor) {
      setSelectedSquare(square);
      setHintMove(null);
    }
  }

  return (
    <section className="mt-24 md:mt-32">
      <Slide delay={0.2}>
        <div className="group relative mb-16 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/80 p-5 shadow-line-light transition duration-500 hover:-translate-y-1 hover:border-primary-color/60 hover:shadow-2xl hover:shadow-primary-color/10 dark:border-zinc-800 dark:bg-primary-bg dark:shadow-line-dark sm:mb-20">
          <div className="absolute inset-0 bg-noise opacity-60" aria-hidden="true" />
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary-color/10 blur-3xl transition duration-500 group-hover:bg-primary-color/20" aria-hidden="true" />

          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
            <div>
              <h2 className="font-incognito text-4xl font-bold tracking-tight">
                The 64 Boxes
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                The little place I come back to when I feel low, one calm move
                at a time.
              </p>

              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-primary-color bg-zinc-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-color/15 transition hover:-translate-y-0.5 hover:shadow-primary-color/25 dark:bg-primary-color dark:text-zinc-950"
              >
                <FaPlay aria-hidden="true" className="text-xs transition group-hover:translate-x-0.5" />
                Play chess
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative mx-auto grid aspect-square w-full max-w-[220px] grid-cols-4 overflow-hidden rounded-lg border border-zinc-300 bg-zinc-900 shadow-2xl shadow-zinc-950/15 transition duration-500 hover:rotate-1 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary-color dark:border-zinc-700"
              aria-label="Open chess board"
            >
              {Array.from({ length: 16 }).map((_, index) => (
                <span
                  key={index}
                  className={index % 2 === Math.floor(index / 4) % 2 ? "bg-[#eee0c4]" : "bg-[#76a05a]"}
                  aria-hidden="true"
                />
              ))}
              <FaChessKnight className="absolute left-[16%] top-[58%] h-10 w-10 text-[#fff8e8] drop-shadow-[0_3px_2px_rgba(0,0,0,0.55)] transition duration-500 group-hover:-translate-y-2 group-hover:translate-x-3 group-hover:rotate-6" aria-hidden="true" />
              <FaChessQueen className="absolute right-[16%] top-[14%] h-11 w-11 text-zinc-950 drop-shadow-[0_2px_1px_rgba(255,255,255,0.25)] transition duration-500 group-hover:translate-y-2 group-hover:-translate-x-2 group-hover:-rotate-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Slide>

      <Slide delay={0.26}>
        <blockquote
          className="mx-auto mt-16 max-w-3xl text-center text-3xl leading-tight text-zinc-700 dark:text-zinc-200 sm:mt-20 sm:text-4xl"
          style={{ fontFamily: '"Segoe Script", "Brush Script MT", cursive' }}
        >
          <p>
            What if I fall? Oh but my darling, what if you fly?
          </p>
          <footer className="mt-3 font-inter text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            - Erin Hanson
          </footer>
        </blockquote>
      </Slide>

      {isOpen ? (
        <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/90 bg-noise bg-zero p-2 text-white backdrop-blur-md">
          <div className="flex h-full items-center justify-center">
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="absolute left-3 top-3 z-30 rounded-lg bg-[#211f1c]/90 px-3 py-2 shadow-xl shadow-black/30 backdrop-blur">
                <div>
                  <h3 className="font-incognito text-base font-black tracking-tight text-white sm:text-lg">
                    The 64 Boxes
                  </h3>
                  <p className="mt-0.5 max-w-44 truncate text-[11px] font-bold uppercase tracking-wide text-zinc-400 sm:max-w-xs">
                    {status}
                  </p>
                </div>
              </div>

              <div className="absolute right-3 top-3 z-30 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10 text-zinc-300 transition hover:bg-white/15 hover:text-white"
                  aria-label="Close chess board"
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </div>

              <div className="w-[min(calc(100vw-5.5rem),calc(100dvh-1rem),900px)] sm:w-[min(calc(100vw-6.5rem),calc(100dvh-1rem),900px)]">
                <div className={`relative rounded-lg bg-[#2b2926] p-1.5 shadow-2xl shadow-black/35 ${gameOutcome?.tone === "win" ? "chess-win-board" : ""}`}>
                  <div className="grid aspect-square grid-cols-8 overflow-hidden rounded-lg border border-black/50 bg-zinc-900">
                    {boardSquares.map((square) => {
                      const piece = game.get(square);
                      const PieceIcon = piece ? pieceIcons[piece.type] : null;
                      const isSelected = selectedSquare === square;
                      const isTarget = legalTargets.includes(square);
                      const isHint = hintMove?.from === square || hintMove?.to === square;
                      const isLastMove = lastMove?.from === square || lastMove?.to === square;
                      const isHovered = hoveredSquare === square;
                      const lightSquare = isLightSquare(square);
                      const showRank = square[0] === (isFlipped ? "h" : "a");
                      const showFile = square[1] === (isFlipped ? "8" : "1");

                      return (
                        <button
                          key={square}
                          type="button"
                          onClick={() => handleSquareClick(square)}
                          onMouseEnter={() => setHoveredSquare(square)}
                          onMouseLeave={() => setHoveredSquare(null)}
                          className={`group relative grid aspect-square place-items-center overflow-hidden text-2xl transition duration-200 sm:text-3xl md:text-4xl ${
                            lightSquare
                              ? "bg-[#eee0c4] text-zinc-950"
                              : "bg-[#76a05a] text-zinc-950"
                          } ${
                            isSelected
                              ? "z-10 ring-4 ring-inset ring-primary-color"
                              : "hover:z-10 hover:brightness-110"
                          }`}
                          aria-label={piece ? `${piece.color}${piece.type} on ${square}` : square}
                        >
                          {isLastMove ? (
                            <span
                              className="absolute inset-0 bg-primary-color/20 shadow-[inset_0_0_0_2px_rgba(51,224,146,0.55)]"
                              aria-hidden="true"
                            />
                          ) : null}
                          {isHint ? (
                            <span
                              className="absolute inset-1 rounded border-2 border-amber-300/95 bg-amber-200/20"
                              aria-hidden="true"
                            />
                          ) : null}
                          {isTarget ? (
                            <span
                              className={`absolute rounded-full ${
                                piece
                                  ? "inset-2 border-4 border-primary-color/90"
                                  : "h-3.5 w-3.5 bg-zinc-950/45 shadow-[0_0_0_7px_rgba(51,224,146,0.22)]"
                              }`}
                              aria-hidden="true"
                            />
                          ) : null}
                          {showRank ? (
                            <span className={`absolute left-1.5 top-1.5 text-[10px] font-black leading-none ${
                              lightSquare ? "text-[#5f8746]" : "text-[#f5ecd2]/85"
                            }`}>
                              {square[1]}
                            </span>
                          ) : null}
                          {showFile ? (
                            <span className={`absolute bottom-1.5 right-1.5 text-[10px] font-black leading-none ${
                              lightSquare ? "text-[#5f8746]" : "text-[#f5ecd2]/85"
                            }`}>
                              {square[0]}
                            </span>
                          ) : null}
                          {piece && PieceIcon ? (
                            <span
                              className={`relative grid h-[78%] w-[78%] select-none place-items-center transition duration-200 ${
                                piece.color === "w"
                                  ? "text-[#fff8e8] drop-shadow-[0_3px_2px_rgba(0,0,0,0.58)]"
                                  : "text-zinc-950 drop-shadow-[0_2px_1px_rgba(255,255,255,0.22)]"
                              } ${isHovered || isSelected ? "-translate-y-1 scale-110" : ""}`}
                              aria-hidden="true"
                            >
                              <PieceIcon className="h-full w-full" />
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  {gameOutcome ? (
                    <div
                      className="absolute inset-2 z-20 grid place-items-center rounded-lg bg-black/20 px-4"
                      role="status"
                      aria-live="polite"
                    >
                      {gameOutcome.tone === "win" ? (
                        <div className="chess-confetti" aria-hidden="true">
                          {Array.from({ length: 18 }).map((_, index) => (
                            <span key={index} />
                          ))}
                        </div>
                      ) : null}
                      <div className="max-w-xs rounded-xl border border-white/15 bg-[#211f1c]/95 px-5 py-4 text-center shadow-2xl backdrop-blur">
                        <p className="font-incognito text-3xl font-black tracking-tight">
                          {gameOutcome.title}
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-300">
                          {gameOutcome.message}
                        </p>
                        <button
                          type="button"
                          onClick={resetGame}
                          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-color px-5 py-2.5 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5 hover:bg-white"
                        >
                          <FaRedoAlt aria-hidden="true" />
                          New Game
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="absolute bottom-3 left-1/2 z-30 grid w-[min(calc(100%-1.5rem),23rem)] -translate-x-1/2 grid-cols-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/85 text-center text-[10px] font-bold text-zinc-300 shadow-2xl shadow-black/35 backdrop-blur sm:right-3 sm:top-1/2 sm:left-auto sm:bottom-auto sm:w-16 sm:-translate-x-0 sm:-translate-y-1/2 sm:grid-cols-1 sm:text-xs">
                <button
                  type="button"
                  onClick={resetGame}
                  className="flex flex-col items-center gap-1 border-r border-zinc-800 px-2 py-3 transition hover:bg-white/10 sm:border-r-0 sm:border-b"
                  title="New game"
                >
                  <FaRedoAlt aria-hidden="true" className="text-lg" />
                  New
                </button>
                <button
                  type="button"
                  onClick={() => setIsFlipped((currentValue) => !currentValue)}
                  className="flex flex-col items-center gap-1 border-r border-zinc-800 px-2 py-3 transition hover:bg-white/10 sm:border-r-0 sm:border-b"
                  title="Flip board"
                >
                  <FaExchangeAlt aria-hidden="true" className="text-lg" />
                  Flip
                </button>
                <button
                  type="button"
                  onClick={showHint}
                  disabled={game.turn() !== humanColor || game.isGameOver() || botThinking}
                  className="flex flex-col items-center gap-1 border-r border-zinc-800 px-2 py-3 text-amber-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45 sm:border-r-0 sm:border-b"
                  title="Show hint"
                >
                  <FaLightbulb aria-hidden="true" className="text-lg" />
                  Hint
                </button>
                <button
                  type="button"
                  onClick={undoLastTurn}
                  disabled={!history.length || botThinking}
                  className="flex flex-col items-center gap-1 px-2 py-3 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
                  title="Undo turn"
                >
                  <FaUndoAlt aria-hidden="true" className="text-lg" />
                  Undo
                </button>
              </div>

            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
