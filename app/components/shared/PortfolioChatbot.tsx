"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { HiPaperAirplane, HiVolumeUp, HiX } from "react-icons/hi";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const starterMessage: ChatMessage = {
  id: "starter",
  role: "assistant",
  content: "Hi, I'm Ayush's AI assistant. Not smarter than Ayush—he built me after all—but smart enough to tell you everything about him: his code, projects, coffee preferences, music taste, and the journey behind this portfolio.",
};

const chatAvatarSrc = "/chatbot-avatar.png";
const fallbackAvatarSrc = "/logo.svg";

function renderMessageContent(content: string) {
  return content.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

export default function PortfolioChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [voiceLoadingId, setVoiceLoadingId] = useState<string | null>(null);
  const [showGreeting, setShowGreeting] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState(chatAvatarSrc);
  const [isChessOpen, setIsChessOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, isLoading]);

  useEffect(() => {
    function handleChessOpen(event: Event) {
      const detail = (event as CustomEvent<{ isOpen?: boolean }>).detail;
      setIsChessOpen(Boolean(detail?.isOpen));
    }

    window.addEventListener("ayush:chess-open", handleChessOpen);

    return () => {
      window.removeEventListener("ayush:chess-open", handleChessOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowGreeting(false);
      return;
    }

    setShowGreeting(true);
    const hideGreeting = window.setTimeout(() => setShowGreeting(false), 4200);
    const greetingInterval = window.setInterval(() => {
      setShowGreeting(true);
      window.setTimeout(() => setShowGreeting(false), 4200);
    }, 14000);

    return () => {
      window.clearTimeout(hideGreeting);
      window.clearInterval(greetingInterval);
    };
  }, [isOpen]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedInput }),
      });

      const data = (await response.json()) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to get chatbot response");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply ?? "I don't have that information yet.",
        },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Unable to get chatbot response.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function playAssistantMessage(message: ChatMessage) {
    if (message.role !== "assistant" || voiceLoadingId) return;

    if (playingMessageId === message.id && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingMessageId(null);
      return;
    }

    audioRef.current?.pause();
    setVoiceLoadingId(message.id);

    try {
      const response = await fetch("/api/chat/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: message.content }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Unable to play voice response.");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audioRef.current = audio;
      setPlayingMessageId(message.id);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setPlayingMessageId(null);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setPlayingMessageId(null);
      };

      await audio.play();
    } catch (error) {
      console.error("Voice playback error:", error);
      setPlayingMessageId(null);
    } finally {
      setVoiceLoadingId(null);
    }
  }

  if (isChessOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {isOpen ? (
        <div className="mb-3 flex h-[520px] w-[min(calc(100vw-2.5rem),380px)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 shadow-2xl shadow-zinc-950/10 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-zinc-950/30">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="relative h-10 w-10 overflow-hidden rounded-full bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
                <Image
                  src={avatarSrc}
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  priority
                  onError={() => setAvatarSrc(fallbackAvatarSrc)}
                />
              </span>
              <div>
                <h2 className="font-incognito text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                  Ayush Assistant
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Portfolio guide
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
              aria-label="Close chat"
            >
              <HiX aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } ${message.role === "assistant" ? "gap-2" : ""}`}
              >
                {message.role === "assistant" ? (
                  <span className="relative mt-1 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
                    <Image
                      src={avatarSrc}
                      alt=""
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarSrc(fallbackAvatarSrc)}
                    />
                  </span>
                ) : null}
                <div className="max-w-[82%]">
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-primary-color text-zinc-950"
                        : "border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-primary-bg dark:text-zinc-200"
                    }`}
                  >
                    {renderMessageContent(message.content)}
                  </div>
                  {message.role === "assistant" ? (
                    <button
                      type="button"
                      onClick={() => playAssistantMessage(message)}
                      disabled={voiceLoadingId !== null}
                      className="mt-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition hover:border-primary-color hover:text-zinc-900 disabled:cursor-wait disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                      aria-label={
                        playingMessageId === message.id
                          ? "Stop voice response"
                          : "Listen to voice response"
                      }
                      title={
                        playingMessageId === message.id
                          ? "Stop voice"
                          : "Listen"
                      }
                    >
                      <HiVolumeUp
                        aria-hidden="true"
                        className={`h-4 w-4 ${
                          playingMessageId === message.id
                            ? "text-primary-color"
                            : ""
                        }`}
                      />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}

            {isLoading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 dark:border-zinc-800 dark:bg-primary-bg">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="flex items-end gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              rows={1}
              placeholder="Ask about Ayush..."
              className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition placeholder:text-zinc-400 focus:border-primary-color focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-primary-color dark:focus:bg-zinc-950"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-zinc-950 text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950"
              aria-label="Send message"
            >
              <HiPaperAirplane aria-hidden="true" className="h-5 w-5 rotate-90" />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className={`relative grid h-16 w-16 place-items-center rounded-full bg-zinc-950 text-zinc-950 shadow-xl shadow-zinc-950/20 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-white dark:bg-zinc-900 dark:shadow-zinc-950/40 dark:focus:ring-offset-zinc-900 ${
          isOpen ? "" : "chatbot-avatar-button"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <HiX aria-hidden="true" className="h-6 w-6 text-white" />
        ) : (
          <>
            {showGreeting ? (
              <span className="chatbot-hello-bubble" aria-hidden="true">
                <span className="chatbot-wave">Hello!</span>
              </span>
            ) : null}
            <span className="relative h-[58px] w-[58px] overflow-hidden rounded-full bg-zinc-900 ring-2 ring-white/80 dark:ring-zinc-700">
              <Image
                src={avatarSrc}
                alt=""
                width={96}
                height={96}
                className="chatbot-avatar-image h-full w-full object-cover"
                priority
                onError={() => setAvatarSrc(fallbackAvatarSrc)}
              />
            </span>
          </>
        )}
      </button>
    </div>
  );
}
