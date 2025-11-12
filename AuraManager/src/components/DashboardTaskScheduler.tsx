// Dashboard Task Scheduler (Supabase integration)
import { useEffect, useState } from "react";
import { TaskScheduler } from "@/components/Scheduler/TaskScheduler";
import type { Task } from "@/components/Scheduler/TaskScheduler";
import { fetchTasks, addTask, toggleTaskComplete } from "@/lib/supabaseTasks";
import { useUser } from "@/contexts/UserContext";

export default function DashboardTaskScheduler() {
  const { userId } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetchTasks(userId)
        .then(setTasks)
        .finally(() => setLoading(false));
    }
  }, [userId]);

  const handleAddTask = async (task: Omit<Task, "id">) => {
    if (!userId) return;
    setLoading(true);
    await addTask(userId, task);
    const updated = await fetchTasks(userId);
    setTasks(updated);
    setLoading(false);
  };

  const handleToggleComplete = async (id: string) => {
    setLoading(true);
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await toggleTaskComplete(id, !task.completed);
    const updated = await fetchTasks(userId!);
    setTasks(updated);
    setLoading(false);
  };

  return (
    <div className="mb-6">
      <TaskScheduler tasks={tasks} onAddTask={handleAddTask} onToggleComplete={handleToggleComplete} />
      {loading && <div className="text-xs text-muted-foreground">Loading...</div>}
    </div>
  );
}