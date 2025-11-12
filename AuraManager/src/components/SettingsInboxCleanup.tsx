// Inbox Cleanup Preferences UI
import React from "react";

export interface CleanupRule {
  type: 'delete' | 'archive' | 'flag';
  match?: string;
  olderThanDays?: number;
}

interface SettingsInboxCleanupProps {
  rules: CleanupRule[];
  onChange: (rules: CleanupRule[]) => void;
}

export const SettingsInboxCleanup: React.FC<SettingsInboxCleanupProps> = ({ rules, onChange }) => {
  const handleRuleChange = (idx: number, field: keyof CleanupRule, value: any) => {
    const updated = [...rules];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };
  const handleAddRule = () => {
    onChange([...rules, { type: 'delete', match: '' }]);
  };
  const handleRemoveRule = (idx: number) => {
    onChange(rules.filter((_, i) => i !== idx));
  };
  return (
    <div className="card border-accent/30 p-4 mb-4">
      <h3 className="font-bold text-lg mb-2">Inbox Cleanup Preferences</h3>
      <ul className="space-y-2 mb-2">
        {rules.map((rule, idx) => (
          <li key={idx} className="flex gap-2 items-center">
            <select value={rule.type} onChange={e => handleRuleChange(idx, 'type', e.target.value)} className="input">
              <option value="delete">Delete</option>
              <option value="archive">Archive</option>
              <option value="flag">Flag</option>
            </select>
            <input
              className="input"
              type="text"
              placeholder="Match keyword (optional)"
              value={rule.match || ''}
              onChange={e => handleRuleChange(idx, 'match', e.target.value)}
            />
            {rule.type === 'archive' && (
              <input
                className="input w-20"
                type="number"
                min={1}
                placeholder="Days"
                value={rule.olderThanDays || ''}
                onChange={e => handleRuleChange(idx, 'olderThanDays', Number(e.target.value))}
              />
            )}
            <button type="button" className="btn btn-error" onClick={() => handleRemoveRule(idx)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-accent" onClick={handleAddRule}>
        Add Rule
      </button>
    </div>
  );
};
