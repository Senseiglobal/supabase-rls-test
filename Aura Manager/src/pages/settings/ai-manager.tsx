// AI Customization Hub Route
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const initialSettings = {
  tone: 0.5,
  humor: 0.5,
  speed: 0.5,
  personality: 0.5,
};

export default function AIManagerSettings() {
  const [settings, setSettings] = useState(initialSettings);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSlider = (key: keyof typeof initialSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleFeedback = async (value: 'up' | 'down') => {
    setFeedback(value);
    // TODO: Log feedback to Supabase ai_feedback table
  };

  return (
    <div className="container max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">AI Customization Hub</h1>
      <div className="space-y-6">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <label className="w-32 font-medium capitalize">{key}</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={value}
              onChange={e => handleSlider(key as keyof typeof initialSettings, Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-10 text-right">{Math.round(Number(value) * 100)}%</span>
          </div>
        ))}
        <div className="flex gap-4 items-center mt-6">
          <Button type="button" variant={feedback === 'up' ? 'default' : 'outline'} onClick={() => handleFeedback('up')}>
            👍
          </Button>
          <Button type="button" variant={feedback === 'down' ? 'default' : 'outline'} onClick={() => handleFeedback('down')}>
            👎
          </Button>
          <span className="text-muted-foreground">Feedback helps tune your AI experience</span>
        </div>
      </div>
    </div>
  );
}
