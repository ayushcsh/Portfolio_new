"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Chess, type Move, type PieceSymbol, type Square } from "chess.js";
import type { IconType } from "react-icons";
import {
  FaBolt,
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
  FaRobot,
  FaTimes,
  FaUndoAlt,
  FaUserAlt,
} from "react-icons/fa";
import { Slide } from "@/app/animation/Slide";

type Difficulty = "casual" | "sharp";

type LastMove = {
  from: Square;
  to: Square;
};

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

function getCapturedPieces(history: Move[], color: typeof humanColor | typeof botColor) {
  return history
    .filter((move) => move.color === color && move.captured)
    .map((move) => move.captured as PieceSymbol);
}

function getMaterialScore(pieces: PieceSymbol[]) {
  return pieces.reduce((total, piece) => total + pieceValues[piece], 0);
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
  const userCapturedPieces = getCapturedPieces(history, humanColor);
  const botCapturedPieces = getCapturedPieces(history, botColor);
  const userMaterial = getMaterialScore(userCapturedPieces);
  const botMaterial = getMaterialScore(botCapturedPieces);
  const materialLead = userMaterial - botMaterial;
  const currentMoveNumber = Math.max(1, Math.floor(history.length / 2) + 1);
  const lastSan = history[history.length - 1]?.san;
  const status = getGameStatus(game, botThinking);

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
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-incognito text-4xl font-bold tracking-tight">
              The 64 Boxes
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              A quiet little board for slow moves, sharp ideas, and quick
              matches against Ayush Bot.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex w-fit items-center justify-center gap-2 rounded-lg border border-primary-color bg-zinc-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-color/15 transition hover:-translate-y-0.5 hover:shadow-primary-color/25 dark:bg-primary-color dark:text-zinc-950"
          >
            <FaPlay aria-hidden="true" className="text-xs transition group-hover:translate-x-0.5" />
            Play chess
          </button>
        </div>
      </Slide>

      {isOpen ? (
        <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/85 p-2 backdrop-blur-md sm:p-3">
          <div className="mx-auto flex h-[calc(100dvh-1rem)] max-w-6xl flex-col rounded-xl border border-zinc-800 bg-white p-3 shadow-2xl shadow-zinc-950/60 dark:bg-zinc-950 sm:h-[calc(100dvh-1.5rem)]">
            <div className="mb-3 flex flex-col gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-incognito text-2xl font-bold tracking-tight">
                  The 64 Boxes
                </h2>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  <span>Move {currentMoveNumber}</span>
                  <span className="h-1 w-1 rounded-full bg-primary-color" />
                  <span>{materialLead >= 0 ? `You +${materialLead}` : `Bot +${Math.abs(materialLead)}`}</span>
                  {lastSan ? (
                    <>
                      <span className="h-1 w-1 rounded-full bg-primary-color" />
                      <span>Last {lastSan}</span>
                    </>
                  ) : null}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-xs font-semibold dark:border-zinc-800 dark:bg-zinc-900">
                  {(["casual", "sharp"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`rounded-md px-4 py-2 capitalize transition ${
                        difficulty === level
                          ? "bg-zinc-950 text-white shadow-md shadow-zinc-950/15 dark:bg-white dark:text-zinc-950"
                          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 transition hover:border-primary-color hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:text-white"
                  aria-label="Close chess board"
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[minmax(0,1fr)_280px] md:items-start lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="mx-auto w-full max-w-[min(100%,calc(100dvh-11rem),560px)]">
            <div className="rounded-xl border border-[#4b3928] bg-[#261b12] p-2 shadow-2xl shadow-zinc-950/25 ring-1 ring-white/10 dark:shadow-zinc-950/50">
              <div className="rounded-lg border border-black/35 bg-[#2d2117] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-18px_42px_rgba(0,0,0,0.36)]">
                <div className="grid aspect-square grid-cols-8 overflow-hidden rounded-md border border-black/55 bg-zinc-900 shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
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
                            : "bg-[#2f6f58] text-zinc-950"
                        } ${
                          isSelected
                            ? "z-10 ring-4 ring-inset ring-primary-color"
                            : "hover:z-10 hover:brightness-110"
                        }`}
                        aria-label={piece ? `${piece.color}${piece.type} on ${square}` : square}
                      >
                        <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                          <span className="absolute inset-0 bg-white/20" />
                          <span className="absolute inset-x-0 top-0 h-px bg-white/35" />
                        </span>
                        {isLastMove ? (
                          <span
                            className="absolute inset-0 bg-primary-color/20 shadow-[inset_0_0_0_2px_rgba(51,224,146,0.62),inset_0_0_20px_rgba(51,224,146,0.32)]"
                            aria-hidden="true"
                          />
                        ) : null}
                        {isHint ? (
                          <span
                            className="absolute inset-1 rounded border-2 border-amber-300/95 bg-amber-200/20 shadow-[inset_0_0_18px_rgba(252,211,77,0.42)]"
                            aria-hidden="true"
                          />
                        ) : null}
                        {isTarget ? (
                          <span
                            className={`absolute rounded-full ${
                              piece
                                ? "inset-2 border-4 border-primary-color/90 shadow-[0_0_16px_rgba(51,224,146,0.45)]"
                                : "h-3.5 w-3.5 bg-zinc-950/45 shadow-[0_0_0_7px_rgba(51,224,146,0.22)] dark:bg-white/70"
                            }`}
                            aria-hidden="true"
                          />
                        ) : null}
                        {showRank ? (
                          <span className={`absolute left-1.5 top-1.5 text-[10px] font-black leading-none ${
                            lightSquare ? "text-[#3b7a63]" : "text-[#eadfc9]/80"
                          }`}>
                            {square[1]}
                          </span>
                        ) : null}
                        {showFile ? (
                          <span className={`absolute bottom-1.5 right-1.5 text-[10px] font-black leading-none ${
                            lightSquare ? "text-[#3b7a63]" : "text-[#eadfc9]/80"
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
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3 px-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                <span className="truncate">{selectedSquare ? `Selected ${selectedSquare}` : "Tap a white piece to start"}</span>
                <span className="shrink-0 text-right text-tertiary-color dark:text-primary-color">{botThinking ? "Bot calculating..." : status}</span>
              </div>
            </div>
          </div>

          <aside className="min-h-0 rounded-xl border border-zinc-200 bg-white/90 p-3 shadow-2xl shadow-zinc-950/10 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 dark:shadow-zinc-950/25">
            <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <span className="relative h-10 w-10 overflow-hidden rounded-full bg-zinc-900 shadow-lg shadow-zinc-950/10 ring-1 ring-zinc-200 dark:shadow-zinc-950/30 dark:ring-zinc-800">
                <Image
                  src="/chatbot-avatar.png"
                  alt=""
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </span>
              <div>
                <h3 className="font-incognito text-lg font-bold tracking-tight">
                  Ayush Bot
                </h3>
                <p className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{status}</span>
                  {botThinking ? (
                    <span className="flex gap-1" aria-hidden="true">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-color [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-color [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-color" />
                    </span>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={resetGame}
                className="group flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-xs font-semibold transition hover:-translate-y-0.5 hover:border-primary-color hover:bg-white hover:text-tertiary-color hover:shadow-lg hover:shadow-primary-color/10 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:bg-zinc-900 dark:hover:text-primary-color"
                title="New game"
              >
                <FaRedoAlt aria-hidden="true" className="transition group-hover:rotate-180" />
                New game
              </button>
              <button
                type="button"
                onClick={() => setIsFlipped((currentValue) => !currentValue)}
                className="group flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-xs font-semibold transition hover:-translate-y-0.5 hover:border-primary-color hover:bg-white hover:text-tertiary-color hover:shadow-lg hover:shadow-primary-color/10 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:bg-zinc-900 dark:hover:text-primary-color"
                title="Flip board"
              >
                <FaExchangeAlt aria-hidden="true" className="transition group-hover:scale-110" />
                Flip
              </button>
              <button
                type="button"
                onClick={showHint}
                disabled={game.turn() !== humanColor || game.isGameOver() || botThinking}
                className="group flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-xs font-semibold text-amber-700 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white hover:shadow-lg hover:shadow-amber-300/15 disabled:cursor-not-allowed disabled:opacity-45 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200 dark:hover:bg-amber-400/15"
                title="Show hint"
              >
                <FaLightbulb aria-hidden="true" className="transition group-hover:scale-110" />
                Hint
              </button>
              <button
                type="button"
                onClick={undoLastTurn}
                disabled={!history.length || botThinking}
                className="group flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-xs font-semibold transition hover:-translate-y-0.5 hover:border-primary-color hover:bg-white hover:text-tertiary-color hover:shadow-lg hover:shadow-primary-color/10 disabled:cursor-not-allowed disabled:opacity-45 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:bg-zinc-900 dark:hover:text-primary-color"
                title="Undo turn"
              >
                <FaUndoAlt aria-hidden="true" className="transition group-hover:-rotate-12" />
                Undo
              </button>
            </div>

            <div className="mt-3 grid gap-2 text-xs">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-primary-bg">
                <div className="mb-1.5 flex items-center gap-2 font-medium">
                  <FaUserAlt aria-hidden="true" className="text-tertiary-color dark:text-primary-color" />
                  <span>You captured</span>
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                    +{userMaterial}
                  </span>
                </div>
                <div className="flex min-h-7 flex-wrap gap-1 text-xl leading-none">
                  {userCapturedPieces.length
                    ? userCapturedPieces.map((piece, index) => {
                        const CapturedIcon = pieceIcons[piece];

                        return (
                          <span
                            key={`${piece}-${index}`}
                            className="grid h-7 w-7 place-items-center rounded-md bg-zinc-950 text-primary-color shadow-line-light dark:bg-zinc-950 dark:shadow-line-dark"
                          >
                            <CapturedIcon aria-hidden="true" className="h-4 w-4" />
                          </span>
                        );
                      })
                    : "-"}
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-primary-bg">
                <div className="mb-1.5 flex items-center gap-2 font-medium">
                  <FaRobot aria-hidden="true" className="text-tertiary-color dark:text-primary-color" />
                  <span>Bot captured</span>
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                    +{botMaterial}
                  </span>
                </div>
                <div className="flex min-h-7 flex-wrap gap-1 text-xl leading-none">
                  {botCapturedPieces.length
                    ? botCapturedPieces.map((piece, index) => {
                        const CapturedIcon = pieceIcons[piece];

                        return (
                          <span
                            key={`${piece}-${index}`}
                            className="grid h-7 w-7 place-items-center rounded-md bg-white text-zinc-950 shadow-line-light dark:bg-white dark:shadow-line-dark"
                          >
                            <CapturedIcon aria-hidden="true" className="h-4 w-4" />
                          </span>
                        );
                      })
                    : "-"}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <FaChessKnight aria-hidden="true" className="text-tertiary-color dark:text-primary-color" />
                  Moves
                </span>
                <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-bold uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <FaBolt aria-hidden="true" className="text-primary-color" />
                  Live
                </span>
              </div>
              <div className="max-h-[18dvh] overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs shadow-inner dark:border-zinc-800 dark:bg-zinc-950">
                {history.length ? (
                  <ol className="space-y-1.5">
                    {movePairs(history).map((pair, index) => (
                      <li
                        key={`${pair.white?.lan ?? "white"}-${pair.black?.lan ?? "black"}-${index}`}
                        className="grid grid-cols-[2rem_1fr_1fr] gap-2 rounded-md px-2 py-1.5 font-mono text-xs text-zinc-600 transition hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        <span className="text-zinc-400">{index + 1}.</span>
                        <span className={pair.white === history[history.length - 1] ? "font-bold text-tertiary-color dark:text-primary-color" : ""}>
                          {pair.white?.san ?? ""}
                        </span>
                        <span className={pair.black === history[history.length - 1] ? "font-bold text-tertiary-color dark:text-primary-color" : ""}>
                          {pair.black?.san ?? ""}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="rounded-md border border-dashed border-zinc-300 px-3 py-5 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    Ready. Your first move starts the match.
                  </p>
                )}
              </div>
            </div>
          </aside>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
