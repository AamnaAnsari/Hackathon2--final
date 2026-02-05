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
    <li className="flex flex-col gap-1 rounded-lg border border-zinc-800/50 bg-zinc-900 px-4 py-3">
      <div className="flex items-center gap-3">
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
      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}
