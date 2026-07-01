"use client";

import { FormEvent, useState } from "react";
import { BiSend } from "react-icons/bi";
import ContactEngagement from "./ContactEngagement";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSending(true);
    setStatus("Sending your message...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error ?? "Could not send your message.");
      }

      setName("");
      setEmail("");
      setMessage("");
      setStatus("Sent. I got your hello.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Could not send your message right now."
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="relative mx-auto flex max-w-6xl flex-col justify-center gap-5 overflow-visible pb-8 md:h-[calc(100dvh-15rem)] md:min-h-0 md:pb-0">
      <div className="grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="flex min-h-0 flex-col justify-center">
          <div className="space-y-4">
            <h1 className="font-incognito text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
              Aww... you stayed till the end.{" "}
              <span aria-hidden="true">❤️</span>
            </h1>
            <p className="max-w-xl whitespace-pre-line text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
              {`I genuinely appreciate you taking the time to look through everything.
It means more than you know.

So... let's not end it here.
Send me a hello.`}
            </p>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="grid min-h-0 gap-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-5 shadow-line-light dark:border-zinc-800 dark:bg-primary-bg dark:shadow-line-dark sm:p-6"
        >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            Name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-primary-color dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-primary-color dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          Message
          <textarea
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="What should we talk about?"
            rows={5}
            className="min-h-32 resize-none rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-primary-color dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-h-5 text-sm text-zinc-500 dark:text-zinc-400">
            {status}
          </p>
          <button
            type="submit"
            disabled={isSending}
            className="inline-flex h-11 items-center justify-center gap-x-2 rounded-lg bg-zinc-950 px-5 font-incognito font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950"
          >
            <BiSend className="text-lg" aria-hidden="true" />
            {isSending ? "Sending..." : "Send Message"}
          </button>
        </div>
        </form>
      </div>

      <div className="mx-auto mt-4 w-full max-w-md">
        <ContactEngagement />
      </div>
    </div>
  );
}
