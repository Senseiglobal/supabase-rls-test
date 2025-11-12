// Mobile Team Access Menu Item
import React from "react";
import { useNavigate } from "react-router-dom";

export default function MobileTeamAccess() {
  const navigate = useNavigate();
  return (
    <button className="w-full py-2 px-4 text-left" onClick={() => navigate('/team')}>
      Team Access
    </button>
  );
}
