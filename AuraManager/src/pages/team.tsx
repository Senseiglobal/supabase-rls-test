// Team Collaboration Route
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const initialMembers = [
  { id: '1', name: 'Alex', role: 'Owner' },
  { id: '2', name: 'Jamie', role: 'Editor' },
];

export default function TeamPage() {
  const [members, setMembers] = useState(initialMembers);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleInvite = async () => {
    // TODO: Generate secure invite link via Vercel Edge Function
    setInviteLink('https://auramanager.app/invite/secure-token');
  };

  return (
    <div className="container max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Team & Collaboration</h1>
      <ul className="mb-6">
        {members.map((m) => (
          <li key={m.id} className="flex gap-4 items-center mb-2">
            <span className="font-medium">{m.name}</span>
            <span className="badge badge-accent">{m.role}</span>
          </li>
        ))}
      </ul>
      <Button type="button" onClick={handleInvite}>
        Invite Member
      </Button>
      {inviteLink && (
        <div className="mt-4 p-2 border rounded bg-muted">
          <div className="font-semibold mb-1">Share this link:</div>
          <div>{inviteLink}</div>
        </div>
      )}
    </div>
  );
}
