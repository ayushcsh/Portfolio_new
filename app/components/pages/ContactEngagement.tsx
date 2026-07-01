"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BiHeart, BiSolidHeart } from "react-icons/bi";

const likedKey = "ayush-contact-liked";
const viewCountKey = "ayush-contact-view-count";
const sessionViewKey = "ayush-contact-session-viewed";

export default function ContactEngagement() {
  const [liked, setLiked] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [giftImageSrc, setGiftImageSrc] = useState("/like-for-you.png");

  useEffect(() => {
    const savedLiked = window.localStorage.getItem(likedKey) === "true";
    const savedViews = Number(window.localStorage.getItem(viewCountKey) ?? 0);
    const shouldCountView = !window.sessionStorage.getItem(sessionViewKey);
    const nextViews = shouldCountView ? savedViews + 1 : savedViews;

    if (shouldCountView) {
      window.localStorage.setItem(viewCountKey, String(nextViews));
      window.sessionStorage.setItem(sessionViewKey, "true");
    }

    setLiked(savedLiked);
  }, []);

  function toggleLike() {
    setLiked((currentLiked) => {
      const nextLiked = !currentLiked;
      window.localStorage.setItem(likedKey, String(nextLiked));

      if (nextLiked) {
        setShowThanks(true);
        setGiftImageSrc("/like-for-you.png");
        setShowGift(true);
        window.setTimeout(() => setShowThanks(false), 4500);
        window.setTimeout(() => setShowGift(false), 4500);
      }

      return nextLiked;
    });
  }

  return (
    <div className="relative flex flex-col items-center gap-3 text-center text-sm">
      {showGift ? (
        <div className="pointer-events-none fixed bottom-0 left-0 z-50 like-gift-slide">
          {showThanks ? (
            <div
              role="status"
              className="absolute -top-10 right-0 translate-x-1/3 w-max max-w-[min(18rem,calc(100vw-3rem))] rounded-md border border-red-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-xl shadow-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 sm:translate-x-1/2"
            >
              Thanks for the love. You made this page a little warmer.
            </div>
          ) : null}
          <Image
            src={giftImageSrc}
            alt=""
            width={260}
            height={260}
            className="h-auto w-44 drop-shadow-2xl sm:w-60"
            unoptimized
            onError={() => setGiftImageSrc("/yeah-right.png")}
          />
        </div>
      ) : null}

      <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400 md:mt-12">
        If this portfolio made you smile, leave a little like.
      </p>

      <div className="flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          className={`inline-flex h-12 items-center gap-x-2.5 rounded-lg border px-6 font-incognito text-base font-bold shadow-line-light transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:shadow-line-dark dark:focus-visible:ring-red-500/40 dark:focus-visible:ring-offset-zinc-900 ${
            liked
              ? "border-red-200 bg-red-50 text-red-600 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300"
              : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-red-200 hover:text-red-500 dark:border-zinc-800 dark:bg-primary-bg dark:text-zinc-200 dark:hover:border-red-500/30 dark:hover:text-red-300"
          }`}
        >
          {liked ? (
            <BiSolidHeart className="text-xl text-red-500" aria-hidden="true" />
          ) : (
            <BiHeart className="text-xl text-red-500" aria-hidden="true" />
          )}
          {liked ? "Liked" : "Like this page"}
        </button>
      </div>
    </div>
  );
}
