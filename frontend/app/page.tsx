"use client";

import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { AuthForm } from "@/components/AuthForm";
import { ChatWidget } from "@/components/ChatWidget";
import { CreateTaskForm } from "@/components/CreateTaskForm";
import { TaskList } from "@/components/TaskList";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: session, isPending } = useSession();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex items-center gap-2 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left: Marketing Hero */}
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-black via-zinc-900 to-red-950 px-6 py-8 lg:px-12 lg:py-10">
          <div className="shrink-0">
            <span className="text-lg font-semibold tracking-tight text-white">
              TodoApp
            </span>
          </div>
          <div className="flex flex-1 flex-col items-start justify-center">
            <h1 className="text-5xl font-bold leading-tight text-white">
              Focus on What Matters.
            </h1>
            <p className="mt-4 text-gray-400">
              The minimal task manager for high performers.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              <li className="flex items-center gap-3 text-gray-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-500">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                Fast Performance
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-500">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                Secure Cloud
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-500">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                Minimal Design
              </li>
            </ul>
          </div>
        </div>
        {/* Right: Auth Section */}
        <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12 lg:py-10">
          <AuthForm />
        </div>
      </div>
    );
  }

  const userId = session.user.id;
  const userName =
    (session.user as { name?: string }).name ?? session.user.email ?? "User";

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
            My Todo List
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">{userName}</span>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-red-400"
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <CreateTaskForm
            userId={userId}
            onTaskAdded={() => setRefreshTrigger((t) => t + 1)}
          />
          <TaskList
            userId={userId}
            refreshTrigger={refreshTrigger}
            onRefresh={() => setRefreshTrigger((t) => t + 1)}
          />
        </div>
      </main>
      <ChatWidget />
    </div>
  );
}
