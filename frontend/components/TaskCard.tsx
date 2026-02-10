"use client";

import { useState } from "react";
import { Check, Circle, Trash2 } from "lucide-react";
import { updateTask, deleteTask, type Task } from "@/lib/api";

type TaskCardProps = {
  task: Task;
  userId: string;
  onTaskChange: () => void;
};

export function TaskCard({ task, userId, onTaskChange }: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⭐ Priority styles (NEW)
  const priorityStyles: Record<string, string> = {
    High: "bg-red-500/15 text-red-400 border-red-500/30",
    Medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    Low: "bg-green-500/15 text-green-400 border-green-500/30",
  };

  async function handleToggleCompleted() {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await updateTask(userId, task.id, {
        title: task.title,
        completed: !task.completed,
      });
      onTaskChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  // ⭐ Priority change handler (NEW)
  async function handlePriorityChange(priority: "Low" | "Medium" | "High") {
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      await updateTask(userId, task.id, {
        title: task.title,
        completed: task.completed,
        priority,
      });
      onTaskChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update priority");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await deleteTask(userId, task.id);
      onTaskChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900 px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Complete toggle */}
        <button
          type="button"
          onClick={handleToggleCompleted}
          disabled={loading}
          className="flex shrink-0 text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-50"
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.completed ? (
            <Check className="h-5 w-5 text-red-600" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        {/* Title */}
        <span
          className={
            "min-w-0 flex-1 " +
            (task.completed
              ? "text-zinc-500 line-through decoration-red-600"
              : "text-white")
          }
        >
          {task.title}
        </span>

        {/* ⭐ Priority badge (NEW) */}
        <span
          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${priorityStyles[task.priority]}`}
        >
          {task.priority}
        </span>

        {/* Delete */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="flex shrink-0 text-zinc-400 transition-colors hover:text-red-500 disabled:opacity-50"
          aria-label="Delete task"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* ⭐ Priority buttons (NEW) */}
      <div className="flex gap-2">
        {(["Low", "Medium", "High"] as const).map((p) => (
          <button
            key={p}
            onClick={() => handlePriorityChange(p)}
            disabled={loading}
            className={`rounded-md border px-2 py-1 text-xs transition
              ${
                task.priority === p
                  ? priorityStyles[p]
                  : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}
