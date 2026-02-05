"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getTasks } from "@/lib/api";
import { TaskCard } from "./TaskCard";

type TaskListProps = {
  userId: string;
  refreshTrigger?: number;
  onRefresh?: () => void;
};

export function TaskList({
  userId,
  refreshTrigger = 0,
  onRefresh,
}: TaskListProps) {
  const handleTaskChange = () => {
    onRefresh?.();
  };
  const [tasks, setTasks] = useState<Awaited<ReturnType<typeof getTasks>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTasks(userId)
      .then((data) => {
        if (!cancelled) setTasks(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load tasks");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-4 text-red-400" role="alert">
        {error}
      </p>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="py-6 text-center text-zinc-500">
        No tasks yet. Add one above.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          userId={userId}
          onTaskChange={handleTaskChange}
        />
      ))}
    </ul>
  );
}
