// Dashboard Tasks Component (Supabase integration)
import React, { useEffect, useState } from "react";
import { getUserTasks } from "@/lib/supabaseTasks";
import { useUser } from "@/contexts/UserContext";

export default function DashboardTasks() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      getUserTasks(user.id).then(setTasks);
    }
  }, [user]);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-2">Your Tasks</h2>
      <ul className="space-y-2">
        {tasks.length === 0 ? (
          <li>No tasks yet.</li>
        ) : (
          tasks.map(task => (
            <li key={task.id} className="border rounded px-3 py-2">{task.title}</li>
          ))
        )}
      </ul>
    </div>
  );
}
