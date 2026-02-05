"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createTask } from "@/lib/api";

type CreateTaskFormProps = {
  userId: string;
  onTaskAdded?: () => void;
};

export function CreateTaskForm({ userId, onTaskAdded }: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || loading) return;
    setError(null);
    setLoading(true);
    try {
      await createTask(userId, trimmed);
      setTitle("");
      onTaskAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
          maxLength={200}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
          Add
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
