"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, X } from "lucide-react";
import axios from "axios";

const CHAT_API = "https://amna2468-todo-backend-hackathon.hf.space/api/chat";

type Message = { role: "user" | "assistant"; content: string };

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "Hi! I'm your AI assistant. You can ask me to add, list, complete, or delete tasks. How can I help?",
  },
];

export function ChatWidget() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || !session?.user?.id || thinking) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setThinking(true);

    try {
      const { data } = await axios.post<{ response: string }>(CHAT_API, {
        user_id: session.user.id,
        message: trimmed,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      router.refresh();
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setThinking(false);
    }
  };

  if (!session?.user) return null;

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg transition hover:bg-blue-800"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex w-[350px] flex-col overflow-hidden rounded-xl shadow-2xl"
          style={{ height: "500px" }}
        >
          {/* Gradient top border */}
          <div className="h-1 w-full shrink-0 bg-gradient-to-r from-blue-600 to-red-600 rounded-t-xl" />
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between bg-black px-4 py-3">
            <span className="font-medium text-white">AI Assistant</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1.5 text-gray-400 transition hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-zinc-950 p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white"
                      : "border border-zinc-800 bg-zinc-900 text-zinc-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm">{m.content}</p>
                </div>
              </div>
            ))}
            {thinking && (
              <div className="mb-3 flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500 [animation-delay:0.2s]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500 [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input area */}
          <div className="shrink-0 border-t border-zinc-800 bg-black p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={thinking}
              />
              <button
                type="button"
                onClick={send}
                disabled={thinking || !input.trim()}
                className="rounded-full p-2 text-red-500 transition hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
