"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BiHeart, BiShow, BiSolidHeart } from "react-icons/bi";

const likedKey = "ayush-contact-liked";
const viewCountKey = "ayush-contact-view-count";
const sessionViewKey = "ayush-contact-session-viewed";

export default function ContactEngagement() {
  const [liked, setLiked] = useState(false);
  const [views, setViews] = useState(0);
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
    setViews(nextViews);
  }, []);

  function toggleLike() {
    setLiked((currentLiked) => {
      const nextLiked = !currentLiked;
      window.localStorage.setItem(likedKey, String(nextLiked));

      if (nextLiked) {
        setShowThanks(true);
        setGiftImageSrc("/like-for-you.png");
        setShowGift(true);
        window.setTimeout(() => setShowThanks(false), 2600);
        window.setTimeout(() => setShowGift(false), 3600);
      }

      return nextLiked;
    });
  }

  return (
    <div className="relative flex flex-col items-center gap-3 text-center text-sm">
      {showGift ? (
        <div className="pointer-events-none fixed bottom-0 left-0 z-50 like-gift-slide">
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

      {showThanks ? (
        <div
          role="status"
          className="absolute bottom-full left-0 mb-3 w-max max-w-[min(18rem,calc(100vw-3rem))] rounded-md border border-red-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-xl shadow-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
        >
          Thanks for the love. You made this page a little warmer.
        </div>
      ) : null}

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        If this portfolio made you smile, leave a little like.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          className="inline-flex h-10 items-center gap-x-2 rounded-md border border-zinc-200 bg-zinc-50 px-4 font-incognito font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 focus:ring-offset-white dark:border-zinc-800 dark:bg-primary-bg dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white dark:focus:ring-zinc-700 dark:focus:ring-offset-zinc-900"
        >
          {liked ? (
            <BiSolidHeart className="text-lg text-red-500" aria-hidden="true" />
          ) : (
            <BiHeart className="text-lg" aria-hidden="true" />
          )}
          {liked ? "Liked" : "Like"}
        </button>

        <div
          className="inline-flex h-10 items-center gap-x-2 rounded-md border border-zinc-200 bg-zinc-50 px-4 font-incognito font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-primary-bg dark:text-zinc-300"
          title={`${views.toLocaleString()} contact page views`}
        >
          <BiShow className="text-lg" aria-hidden="true" />
          <span>{views.toLocaleString()} views</span>
        </div>
      </div>
    </div>
  );
}
