// Personalized Dashboard Greeting Component
import React from "react";
import { useUser } from "@/contexts/UserContext";

export default function DashboardGreeting() {
  const { user } = useUser();
  const name = user?.first_name || "Artist";
  return (
    <div className="mb-6 text-xl font-semibold">
      Hello, {name}! Welcome back to Aura Manager.
    </div>
  );
}
