// Supabase integration for tasks table
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "../components/Scheduler/TaskScheduler";

export async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, dueDate, completed")
    .eq("user_id", userId);
  if (error) throw error;
  return data || [];
}

export async function addTask(userId: string, task: Omit<Task, "id">): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert([{ ...task, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleTaskComplete(taskId: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .update({ completed })
    .eq("id", taskId);
  if (error) throw error;
}
