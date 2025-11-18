// Preferences Settings Page - Aura Manager Personalization
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';

interface UserPreferences {
  name?: string;
  goals?: string[];
  goalOther?: string;
  careerStage?: string;
  genre?: string;
  rememberPrefs?: boolean;
  useHistory?: boolean;
}

export default function Preferences() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    goals: [],
    rememberPrefs: true,
    useHistory: true,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
      } else if (data) {
        setPreferences({
          name: data.name || '',
          goals: data.goals || [],
          goalOther: data.goal_other || '',
          careerStage: data.career_stage || '',
          genre: data.genre || '',
          rememberPrefs: data.remember_prefs ?? true,
          useHistory: data.use_history ?? true,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          name: preferences.name,
          goals: preferences.goals,
          goal_other: preferences.goalOther,
          career_stage: preferences.careerStage,
          genre: preferences.genre,
          remember_prefs: preferences.rememberPrefs,
          use_history: preferences.useHistory,
        });

      if (error) throw error;

      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleGoalToggle = (goal: string) => {
    setPreferences(prev => {
      const currentGoals = prev.goals || [];
      const newGoals = currentGoals.includes(goal)
        ? currentGoals.filter(g => g !== goal)
        : [...currentGoals, goal];
      return { ...prev, goals: newGoals };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 px-4">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Set Your Aura Manager</h1>
            <p className="text-sm text-muted-foreground">
              Help us understand your goals so we can assist you better
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">What should I call you? (optional)</Label>
              <Input
                id="name"
                placeholder="Your preferred name"
                value={preferences.name || ''}
                onChange={(e) => setPreferences({ ...preferences, name: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <Label>What's your primary goal right now? (Select all that apply)</Label>
              <div className="space-y-2">
                {[
                  { value: 'launch', label: 'Launch a new release' },
                  { value: 'grow', label: 'Grow my fanbase' },
                  { value: 'streams', label: 'Increase streams' },
                  { value: 'shows', label: 'Book more shows' },
                  { value: 'other', label: 'Something else' },
                ].map((goal) => (
                  <div key={goal.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal.value}
                      checked={preferences.goals?.includes(goal.value)}
                      onCheckedChange={() => handleGoalToggle(goal.value)}
                    />
                    <Label
                      htmlFor={goal.value}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {goal.label}
                    </Label>
                  </div>
                ))}
              </div>
              {preferences.goals?.includes('other') && (
                <Input
                  placeholder="Please specify..."
                  value={preferences.goalOther || ''}
                  onChange={(e) =>
                    setPreferences({ ...preferences, goalOther: e.target.value })
                  }
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="careerStage">Where are you in your music career?</Label>
              <Select
                value={preferences.careerStage}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, careerStage: value })
                }
              >
                <SelectTrigger id="careerStage">
                  <SelectValue placeholder="Select your career stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starting">Just starting out (0-1K monthly listeners)</SelectItem>
                  <SelectItem value="growing">Growing artist (1K-50K monthly listeners)</SelectItem>
                  <SelectItem value="established">Established (50K+ monthly listeners)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">What's your primary genre?</Label>
              <Input
                id="genre"
                placeholder="e.g., Afrobeats, Hip-Hop, R&B"
                value={preferences.genre || ''}
                onChange={(e) => setPreferences({ ...preferences, genre: e.target.value })}
              />
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="rememberPrefs">Remember my preferences</Label>
                  <p className="text-sm text-muted-foreground">
                    Let Aura Manager save context about your goals and campaigns
                  </p>
                </div>
                <Switch
                  id="rememberPrefs"
                  checked={preferences.rememberPrefs}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, rememberPrefs: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="useHistory">Use conversation history</Label>
                  <p className="text-sm text-muted-foreground">
                    Reference past conversations to provide better assistance
                  </p>
                </div>
                <Switch
                  id="useHistory"
                  checked={preferences.useHistory}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, useHistory: checked })
                  }
                />
              </div>
            </div>

    <div className="flex flex-col md:flex-row gap-4 pt-4 md:gap-6">              <Button onClick={handleSave} disabled={saving} className="flex-1">
     <Button onClick={handleSave} disabled={saving} className="w-full md:flex-1">              </Button>
     <Button
       variant="outline"
       onClick={() => navigate('/onboarding')}
       disabled={saving}
       className="w-full md:flex-1"
              >
                Reconfigure from Onboarding
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
