"use client";

import { FormEvent, useState } from "react";
import {
  BiEnvelope,
  BiLinkExternal,
  BiLogoLinkedinSquare,
  BiSend,
} from "react-icons/bi";
import ContactEngagement from "./ContactEngagement";

const contactEmail = "ayushkumar.nov.2005@gmail.com";
const linkedInUrl = "https://www.linkedin.com/in/ayush-kumar-a8a1592a4/";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = encodeURIComponent(
      `Portfolio hello from ${name.trim() || "someone"}`
    );
    const body = encodeURIComponent(
      [
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        "",
        message.trim(),
      ].join("\n")
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    setStatus("Your email app is opening. I'll be happy to hear from you.");
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <section className="space-y-6">
        <div className="space-y-4">
          <h1 className="font-incognito text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
            You made it to the end of my website. Might as well say hi.{" "}
            <span aria-hidden="true">&#128075;</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Whether it is an internship, collaboration, project idea, or just a
            quick hello, I would love to hear from you.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex h-11 items-center gap-x-2 rounded-md border border-zinc-200 bg-zinc-50 px-4 font-incognito font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-primary-bg dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white"
          >
            <BiEnvelope className="text-xl" aria-hidden="true" />
            Email Me
          </a>
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-11 items-center gap-x-2 rounded-md border border-zinc-200 bg-zinc-50 px-4 font-incognito font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-primary-bg dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white"
          >
            <BiLogoLinkedinSquare className="text-xl" aria-hidden="true" />
            LinkedIn
            <BiLinkExternal className="text-base" aria-hidden="true" />
          </a>
        </div>

        </section>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-md border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-primary-bg"
        >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-primary-color dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-primary-color dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Message
          <textarea
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="What should we talk about?"
            rows={6}
            className="min-h-40 resize-y rounded-md border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-primary-color dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-h-5 text-sm text-zinc-500 dark:text-zinc-400">
            {status}
          </p>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-x-2 rounded-md bg-zinc-950 px-5 font-incognito font-semibold text-white transition hover:scale-[1.02] dark:bg-white dark:text-zinc-950"
          >
            <BiSend className="text-lg" aria-hidden="true" />
            Send Message
          </button>
        </div>
        </form>
      </div>

      <ContactEngagement />
    </div>
  );
}
