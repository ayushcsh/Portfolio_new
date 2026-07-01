"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import {
  HiBeaker,
  HiBadgeCheck,
  HiBookmarkAlt,
  HiCamera,
  HiMail,
  HiOutlineX,
  HiUser,
} from "react-icons/hi";

export default function MobileMenu() {
  const [navShow, setNavShow] = useState(false);
  const data = [
    {
      title: "About",
      href: "/about",
      icon: HiUser,
    },
    {
      title: "Projects",
      href: "/projects",
      icon: HiBeaker,
    },
    {
      title: "Blog",
      href: "/blog",
      icon: HiBookmarkAlt,
    },
    {
      title: "Certifications",
      href: "/certifications",
      icon: HiBadgeCheck,
    },
    {
      title: "Beyond Code",
      href: "/Beyondcode",
      icon: HiCamera,
    },
    {
      title: "Contact",
      href: "/contact",
      icon: HiMail,
    },
  ];

  const onToggleNav = () => {
    setNavShow((status) => {
      if (status) {
        document.body.style.overflow = "auto";
      } else {
        document.body.style.overflow = "hidden";
      }
      return !status;
    });
  };

  return (
    <>
      <button
        aria-label="Toggle Menu"
        onClick={onToggleNav}
        className="md:hidden dark:bg-primary-bg bg-secondary-bg border dark:border-zinc-800 border-zinc-200 rounded-md p-2"
      >
        <RxHamburgerMenu className="text-xl" />
      </button>
      <div
        className={`fixed left-0 top-0 z-[80] h-full w-full transform isolation-isolate duration-[600ms] ease-[cubic-bezier(0.7,0,0,1)] dark:bg-zinc-900 bg-white md:hidden ${
          navShow ? "translate-x-0 rounded-none" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mt-6 px-8">
          <Link href="/" onClick={onToggleNav}>
            <Image src="/logo.png" width={42} height={42} alt="logo" priority className="h-10 w-10 rounded-md object-cover" />
          </Link>

          <button
            aria-label="Toggle Menu"
            onClick={onToggleNav}
            className={`md:hidden dark:bg-primary-bg bg-secondary-bg border dark:border-zinc-800 border-zinc-200 rounded-full p-2 duration-500 ${
              !navShow ? "-rotate-[360deg]" : null
            }`}
          >
            <HiOutlineX className="text-xl" />
          </button>
        </div>
        <nav className="mt-4 flex max-h-[calc(100dvh-7rem)] flex-col overflow-y-auto pb-6">
          {data.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="flex items-center gap-x-2 p-4 font-incognito text-base font-semibold shadow-line-light group dark:shadow-line-dark"
              onClick={onToggleNav}
            >
              <link.icon
                className="text-zinc-500 group-hover:dark:text-white group-hover:text-zinc-800 duration-300"
                aria-hidden="true"
              />
              {link.title}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
