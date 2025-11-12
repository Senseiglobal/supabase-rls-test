// Inbox Highlights widget for Dashboard
import React from "react";
import type { InboxSummary } from "../services/inboxReader";

interface InboxHighlightsProps {
  highlights: InboxSummary[];
}

export const InboxHighlights: React.FC<InboxHighlightsProps> = ({ highlights }) => (
  <div className="card border-accent/30 p-4 mb-4">
    <h3 className="font-bold text-lg mb-2">Inbox Highlights</h3>
    {highlights.length === 0 ? (
      <div className="text-muted-foreground">No booking-related emails found.</div>
    ) : (
      <ul className="space-y-2">
        {highlights.map((summary, idx) => (
          <li key={idx}>
            <div className="font-semibold">{summary.source.toUpperCase()}</div>
            <ul className="list-disc ml-4">
              {summary.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
            <div className="text-xs text-muted-foreground mt-1">Last checked: {new Date(summary.lastChecked).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    )}
  </div>
);
