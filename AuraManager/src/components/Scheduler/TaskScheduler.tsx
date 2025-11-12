// Calendar & Task Scheduler UI
import React, { useState } from "react";

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface TaskSchedulerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id">) => void;
  onToggleComplete: (id: string) => void;
}

export const TaskScheduler: React.FC<TaskSchedulerProps> = ({ tasks, onAddTask, onToggleComplete }) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = () => {
    if (!title || !dueDate) return;
    onAddTask({ title, dueDate, completed: false });
    setTitle("");
    setDueDate("");
  };

  return (
    <div className="card border-accent/30 p-4 mb-4">
      <h3 className="font-bold text-lg mb-2">Task Scheduler</h3>
      <div className="flex gap-2 mb-2">
        <input
          className="input"
          type="text"
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          className="input"
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
        <button type="button" className="btn btn-accent" onClick={handleAdd}>
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {tasks.map(task => (
          <li key={task.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task.id)}
            />
            <span className={task.completed ? "line-through" : ""}>{task.title}</span>
            <span className="text-xs text-muted-foreground">Due: {task.dueDate}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
