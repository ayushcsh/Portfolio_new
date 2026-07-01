"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Slide } from "@/app/animation/Slide";
import {
  FaPlay,
} from "react-icons/fa";
import {
  RiSkipBackFill,
  RiSkipForwardFill,
} from "react-icons/ri";

const favoriteSongs = [
  {
    title: "Duvet",
    artist: "boa",
    cover:
      "/music/musicphoto/images.jpeg",
    audio: "/music/Duvet_spotdown.org.mp3"
  },
  {
    title: "Krystal",
    artist: "Matt Maltese",
    cover:
      "/music/musicphoto/krystal.jpeg",
    audio: "/music/Krystal_spotdown.org.mp3"
  },
  {
    title: "is this the end",
    artist: "Nato kitch",
    cover:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=640&q=80",
      audio: "/music/is this the end.mp3"
  },
  {
    title: "Oldest Trick in the Book",
    artist: "Matt Maltese",
    cover:
      "/music/musicphoto/oldest trick in the book.png",
    audio: "/music/Oldest Trick in the Book_spotdown.org.mp3"
  },
  {
    title: "Those Eyes",
    artist: "New West ",
    cover:
      "/music/musicphoto/Those eyes.jpeg",
    audio: "/music/Those Eyes_spotdown.org.mp3"
  },
  {
    title: "EVERYTHING HALLELUJAH",
    artist: "justin biber",
    cover:
      "/music/musicphoto/swag.png",
    audio: "/music/swag.mp3"
  },
];

const MIDDLE_SONG_INDEX = Math.floor(favoriteSongs.length / 2);

function getLoopOffset(index: number, activeIndex: number) {
  const total = favoriteSongs.length;
  let offset = index - activeIndex;

  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;

  return offset;
}

function formatTrackTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.max(0, Math.floor(seconds % 60));

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function FavoriteSongs() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isPlayingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(MIDDLE_SONG_INDEX);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);

  const activeSong = favoriteSongs[activeIndex];
  const elapsedSeconds = audioRef.current?.currentTime ?? 0;
  const remainingSeconds = Math.max(0, duration - elapsedSeconds);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();
    setProgress(0);
    setDuration(0);
    setAudioError(false);

    if (isPlayingRef.current) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [activeIndex]);

  function selectSong(index: number) {
    isPlayingRef.current = true;
    setIsPlaying(true);
    setAudioError(false);

    if (index === activeIndex) {
      audioRef.current?.play().catch(() => {
        setAudioError(true);
        setIsPlaying(false);
        isPlayingRef.current = false;
      });
      return;
    }

    setActiveIndex(index);
  }

  function previousSong() {
    setActiveIndex(
      (currentIndex) =>
        (currentIndex - 1 + favoriteSongs.length) % favoriteSongs.length
    );
  }

  function nextSong() {
    setActiveIndex((currentIndex) => (currentIndex + 1) % favoriteSongs.length);
  }

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio
      .play()
      .then(() => {
        setAudioError(false);
        setIsPlaying(true);
      })
      .catch(() => {
        setAudioError(true);
        setIsPlaying(false);
      });
  }

  function updateProgress() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    setProgress((audio.currentTime / audio.duration) * 100);
  }

  function updateDuration() {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;

    setDuration(audio.duration);
  }

  function seekTrack(value: number) {
    const audio = audioRef.current;
    if (!audio || !duration) {
      setProgress(value);
      return;
    }

    audio.currentTime = (duration * value) / 100;
    setProgress(value);
  }

  function handleAudioError() {
    setAudioError(true);
    setIsPlaying(false);
    setProgress(0);
  }

  return (
    <section className="mt-32 overflow-hidden">
      <audio
        ref={audioRef}
        src={activeSong.audio}
        preload="metadata"
        onLoadedMetadata={updateDuration}
        onTimeUpdate={updateProgress}
        onEnded={nextSong}
        onError={handleAudioError}
      />

      <Slide delay={0.2}>
        <div className="mb-8">
          <h2 className="font-incognito text-4xl mb-4 font-bold tracking-tight">
            Favorite Songs
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            A few tracks that stay in my rotation while building, learning, and
            winding down.
          </p>
        </div>
      </Slide>

      <Slide delay={0.24}>
        <div className="poster-stage relative -mx-6 overflow-hidden md:-mx-16">
          {favoriteSongs.map((song, index) => {
            const offset = getLoopOffset(index, activeIndex);
            const distance = Math.abs(offset);
            const isActive = index === activeIndex;
            const scale = isActive ? 1.08 : distance === 1 ? 0.88 : 0.7;
            const opacity = distance <= 2 ? 1 : 0;
            const dim = isActive ? 0 : distance === 1 ? 0.24 : 0.48;
            const position =
              offset === 0
                ? 0
                : Math.sign(offset) * (distance === 1 ? 0.89 : 1.59);

            return (
              <button
                type="button"
                key={song.title}
                onClick={() => selectSong(index)}
                className={`poster-card group absolute left-1/2 top-1/2 overflow-hidden rounded-2xl bg-zinc-950 text-left transition-all duration-500 ease-out ${
                  isActive ? "is-active" : ""
                }`}
                style={
                  {
                    "--poster-offset": offset,
                    "--poster-position": position,
                    "--poster-scale": scale,
                    "--poster-opacity": opacity,
                    "--poster-dim": dim,
                    zIndex: isActive ? 30 : 10 - distance,
                    pointerEvents: distance > 2 ? "none" : "auto",
                  } as CSSProperties
                }
                aria-label={`Select ${song.title} by ${song.artist}`}
              >
                <Image
                  src={song.cover}
                  alt={`${song.title} cover`}
                  fill
                  sizes="(min-width: 768px) 270px, 180px"
                  className="rounded-[inherit] object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-zinc-950 transition duration-300 poster-dim" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 via-zinc-950/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 translate-y-4 p-5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="truncate text-sm font-semibold text-white">
                    {song.title}
                  </p>
                  <p className="truncate text-xs text-zinc-300">{song.artist}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Slide>

      <Slide delay={0.28}>
        <div className="mx-auto mt-5 max-w-xl rounded-xl border border-zinc-200 bg-white/85 px-4 py-3 shadow-line-light backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85 dark:shadow-line-dark">
          <div className="flex items-center justify-center gap-3 text-xl">
            <button
              type="button"
              onClick={previousSong}
              className="grid h-8 w-8 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
              aria-label="Previous song"
            >
              <RiSkipBackFill aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={togglePlayback}
              className="grid h-10 w-10 place-items-center rounded-full bg-zinc-950 text-2xl text-white shadow-lg shadow-zinc-950/20 transition hover:scale-105 dark:bg-white dark:text-zinc-950"
              aria-label={isPlaying ? "Pause current song" : "Play current song"}
            >
              {isPlaying ? (
                <span aria-hidden="true" className="pause-mark">
                  <span />
                  <span />
                </span>
              ) : (
                <FaPlay aria-hidden="true" className="translate-x-0.5 text-lg" />
              )}
            </button>
            <button
              type="button"
              onClick={nextSong}
              className="grid h-8 w-8 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
              aria-label="Next song"
            >
              <RiSkipForwardFill aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="w-10 text-right text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
              {formatTrackTime(elapsedSeconds)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(event) => seekTrack(Number(event.target.value))}
              className="track-range h-1 flex-1 cursor-pointer appearance-none rounded-full"
              style={
                {
                  "--progress": `${progress}%`,
                } as CSSProperties
              }
              aria-label="Song progress"
            />
            <span className="w-10 text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
              -{formatTrackTime(remainingSeconds)}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-center text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {audioError ? (
              <span>Could not play {activeSong.audio}</span>
            ) : (
              <span>
                {activeSong.title} - {activeSong.artist}
              </span>
            )}
          </div>
        </div>
      </Slide>

      <style jsx>{`
        .poster-stage {
          --poster-size: 132px;
          --poster-shift: 104px;
          height: 210px;
        }

        .poster-card {
          height: var(--poster-size);
          width: var(--poster-size);
          background: #09090b;
          border-radius: 1rem;
          opacity: var(--poster-opacity);
          transform: translate(-50%, calc(-50% + var(--poster-lift, 0px)))
            translateX(calc(var(--poster-position) * var(--poster-shift)))
            scale(var(--poster-scale));
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.22);
        }

        .poster-card:hover {
          --poster-lift: -8px;
        }

        .poster-card.is-active {
          opacity: 1;
          box-shadow: 0 32px 90px rgba(0, 0, 0, 0.34),
            0 0 50px rgba(51, 224, 146, 0.14);
        }

        .poster-dim {
          opacity: var(--poster-dim);
        }

        .pause-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .pause-mark span {
          display: block;
          width: 7px;
          height: 20px;
          border-radius: 9999px;
          background: currentColor;
        }

        .track-range {
          --track-active: #71717a;
          background: linear-gradient(
            to right,
            var(--track-active) 0%,
            var(--track-active) var(--progress),
            #e4e4e7 var(--progress),
            #e4e4e7 100%
          );
          transition: background 160ms ease;
        }

        .track-range:hover,
        .track-range:focus-visible {
          --track-active: #33e092;
        }

        .track-range::-webkit-slider-thumb {
          appearance: none;
          background: #ffffff;
          border: 0;
          border-radius: 9999px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          height: 12px;
          opacity: 0;
          transition: opacity 160ms ease;
          width: 12px;
        }

        .track-range:hover::-webkit-slider-thumb,
        .track-range:focus-visible::-webkit-slider-thumb {
          opacity: 1;
        }

        .track-range::-moz-range-thumb {
          background: #ffffff;
          border: 0;
          border-radius: 9999px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          height: 12px;
          opacity: 0;
          transition: opacity 160ms ease;
          width: 12px;
        }

        .track-range:hover::-moz-range-thumb,
        .track-range:focus-visible::-moz-range-thumb {
          opacity: 1;
        }

        :global(.dark) .track-range {
          --track-active: #a1a1aa;
          background: linear-gradient(
            to right,
            var(--track-active) 0%,
            var(--track-active) var(--progress),
            #3f3f46 var(--progress),
            #3f3f46 100%
          );
        }

        :global(.dark) .track-range:hover,
        :global(.dark) .track-range:focus-visible {
          --track-active: #33e092;
        }

        @media (min-width: 768px) {
          .poster-stage {
            --poster-size: 270px;
            --poster-shift: 232px;
            height: 380px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .poster-card,
          .poster-card :global(img) {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
