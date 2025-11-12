// Sidebar Team & Collaboration Link
import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarTeamLink() {
  return (
    <NavLink to="/team" className="sidebar-link" activeClassName="active">
      Team & Collaboration
    </NavLink>
  );
}
