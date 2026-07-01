"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BiShow } from "react-icons/bi";
import sanitylogo from "@/public/sanity.png";
import vercellogo from "@/public/vercel.svg";
import nextjslogo from "@/public/nextjs.svg";
import UnmountStudio from "./Unmount";

export default function Footer() {
  const pathname = usePathname();
  const [views, setViews] = useState(0);

  useEffect(() => {
    const savedViews = Number(
      window.localStorage.getItem("ayush-contact-view-count") ?? 0
    );

    setViews(savedViews);
  }, []);

  if (pathname === "/contact") return null;

  return (
    <UnmountStudio>
      <footer className="border-t dark:border-zinc-800 border-zinc-100 mt-44 lg:min-h-[250px] min-h-full relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-y-6 md:px-16 px-6 py-16">
          <div className="flex w-full lg:flex-row flex-col items-center lg:justify-between justify-center gap-y-4">
            <div className="flex md:flex-row flex-col items-center gap-x-2">
              <h3 className="font-inter">Built with:</h3>
              <ul className="flex items-center gap-x-2 text-sm dark:text-zinc-600 text-zinc-400 md:mt-0 mt-3">
                <li>
                  <a
                    href="https://sanity.io"
                    rel="noreferrer noopener"
                    target="_blank"
                    className="flex items-center gap-x-2 dark:text-white text-zinc-600 hover:underline"
                  >
                    <Image
                      src={sanitylogo}
                      width={20}
                      height={20}
                      alt="sanity logo"
                    />{" "}
                    Sanity
                  </a>
                </li>
                <li>
                  <a
                    href="https://nextjs.org"
                    rel="noreferrer noopener"
                    target="_blank"
                    className="flex items-center gap-x-2 dark:text-white text-zinc-600 hover:underline"
                  >
                    <Image
                      src={nextjslogo}
                      width={20}
                      height={20}
                      alt="nextjs logo"
                    />{" "}
                    Next.js
                  </a>
                </li>
                <li>
                  <a
                    href="https://vercel.com"
                    rel="noreferrer noopener"
                    target="_blank"
                    className="flex items-center gap-x-2 dark:text-white text-zinc-600 hover:underline"
                  >
                    <Image
                      src={vercellogo}
                      width={20}
                      height={20}
                      alt="vercel logo"
                    />{" "}
                    Vercel
                  </a>
                </li>
              </ul>
            </div>

            <small className="text-center text-zinc-500 lg:text-right">
              Copyright &copy; Ayush Kumar {new Date().getFullYear()} All rights
              Reserved
            </small>
          </div>
        </div>
        {views > 0 ? (
          <div
            className="absolute bottom-4 right-6 inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-300 opacity-45 dark:text-zinc-700 md:right-16"
            title={`${views.toLocaleString()} contact page views`}
          >
            <BiShow className="text-sm" aria-hidden="true" />
            <span>{views.toLocaleString()} quiet visits</span>
          </div>
        ) : null}
      </footer>
    </UnmountStudio>
  );
}
