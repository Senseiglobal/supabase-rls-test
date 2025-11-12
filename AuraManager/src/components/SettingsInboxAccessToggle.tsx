// Toggle for user consent: Settings → AI Permissions → Inbox Access
import React from "react";

interface SettingsInboxAccessToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
}

export const SettingsInboxAccessToggle: React.FC<SettingsInboxAccessToggleProps> = ({ enabled, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <span className="font-medium">Inbox Access (AI Permissions)</span>
    <input
      type="checkbox"
      checked={enabled}
      onChange={e => onChange(e.target.checked)}
      className="toggle toggle-accent"
      aria-label="Enable Inbox Access"
    />
  </div>
);
