// GDPR Consent Modal for AI/Inbox Features
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PrivacyConsentModal({ onAccept }: { onAccept: () => void }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
        <h2 className="text-xl font-bold mb-4">Privacy & Consent</h2>
        <p className="mb-4">To use AI and inbox features, you must consent to data processing in accordance with GDPR and our privacy policy.</p>
        <div className="flex gap-4">
          <Button type="button" onClick={() => { setOpen(false); onAccept(); }}>I Consent</Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
