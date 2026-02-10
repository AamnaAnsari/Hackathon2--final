import axios from "axios";

const DUMMY_USER_ID = "test-user";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export type Task = {
  id: number;
  user_id: string;
  title: string;
  completed: boolean;
  priority: "Low" | "Medium" | "High";
};

export async function getTasks(userId: string = DUMMY_USER_ID): Promise<Task[]> {
  const { data } = await api.get<Task[]>(`/${userId}/tasks`);
  return data;
}

export async function createTask(
  userId: string = DUMMY_USER_ID,
  title: string
): Promise<Task> {
  const { data } = await api.post<Task>(`/${userId}/tasks`, { title });
  return data;
}

export type TaskUpdate = {
  title: string;
  completed: boolean;
  priority?: "Low" | "Medium" | "High";
};

export async function updateTask(
  userId: string = DUMMY_USER_ID,
  taskId: number,
  updates: TaskUpdate
): Promise<Task> {
  const { data } = await api.put<Task>(`/${userId}/tasks/${taskId}`, updates);
  return data;
}

export async function deleteTask(
  userId: string = DUMMY_USER_ID,
  taskId: number
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/${userId}/tasks/${taskId}`
  );
  return data;
}
