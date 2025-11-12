// Permissions Overview Component
import React from "react";

const permissions = [
  { key: 'inbox', label: 'Inbox Access', description: 'Read and summarize your inbox for booking and insights.' },
  { key: 'ai', label: 'AI Features', description: 'Compose replies, schedule tasks, and personalize dashboard.' },
  { key: 'whatsapp', label: 'WhatsApp Integration', description: 'Send and receive WhatsApp commands.' },
  { key: 'team', label: 'Team Collaboration', description: 'Invite and manage team members.' },
];

export default function PermissionsOverview() {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-2">Permissions Overview</h2>
      <ul className="space-y-2">
        {permissions.map(p => (
          <li key={p.key} className="border rounded px-3 py-2">
            <span className="font-semibold">{p.label}</span>: {p.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
