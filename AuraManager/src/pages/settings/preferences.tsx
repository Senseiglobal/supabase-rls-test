// Preferences Settings Page - AI Personalization
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';

interface UserPreferences {
  name?: string;
  goal?: string;
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
    name: '',
    goal: '',
    goalOther: '',
    careerStage: '',
    genre: '',
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
        toast.error('Please sign in to access preferences');
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        toast.error('Failed to load preferences');
      } else if (data) {
        setPreferences({
          name: data.name || '',
          goal: data.goal || '',
          goalOther: data.goal_other || '',
          careerStage: data.career_stage || '',
          genre: data.genre || '',
          rememberPrefs: data.remember_prefs ?? true,
          useHistory: data.use_history ?? true,
        });
      }
    } catch (err) {
      console.error('Error in loadPreferences:', err);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save preferences');
        return;
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          name: preferences.name || null,
          goal: preferences.goal || null,
          goal_other: preferences.goalOther || null,
          career_stage: preferences.careerStage || null,
          genre: preferences.genre || null,
          remember_prefs: preferences.rememberPrefs,
          use_history: preferences.useHistory,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving preferences:', error);
        toast.error('Failed to save preferences');
      } else {
        toast.success('Preferences saved successfully!');
      }
    } catch (err) {
      console.error('Error in handleSave:', err);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReconfigure = () => {
    navigate('/onboarding');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">🤖 Meet Your AI Music Manager</h1>
          <p className="text-muted-foreground">
            Help me understand your goals so I can assist you better
          </p>
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">What should I call you?</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your preferred name"
              value={preferences.name}
              onChange={(e) => setPreferences({ ...preferences, name: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">Optional - helps personalize your experience</p>
          </div>

          {/* Primary Goal Radio Group */}
          <div className="space-y-3">
            <Label>What's your primary goal right now?</Label>
            <RadioGroup
              value={preferences.goal}
              onValueChange={(value) => setPreferences({ ...preferences, goal: value, goalOther: value !== 'other' ? '' : preferences.goalOther })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="launch" id="launch" />
                <Label htmlFor="launch" className="cursor-pointer">🚀 Launch a new release</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="grow" id="grow" />
                <Label htmlFor="grow" className="cursor-pointer">📈 Grow my fanbase</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="streams" id="streams" />
                <Label htmlFor="streams" className="cursor-pointer">🎵 Increase streams</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shows" id="shows" />
                <Label htmlFor="shows" className="cursor-pointer">🎤 Book more shows</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="cursor-pointer">✨ Something else</Label>
              </div>
            </RadioGroup>
            
            {preferences.goal === 'other' && (
              <Input
                type="text"
                placeholder="Tell us your goal..."
                value={preferences.goalOther}
                onChange={(e) => setPreferences({ ...preferences, goalOther: e.target.value })}
                className="mt-2"
              />
            )}
          </div>

          {/* Career Stage Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="career-stage">Where are you in your music career?</Label>
            <Select
              value={preferences.careerStage}
              onValueChange={(value) => setPreferences({ ...preferences, careerStage: value })}
            >
              <SelectTrigger id="career-stage">
                <SelectValue placeholder="Select your career stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starting">Just starting out (0-1K monthly listeners)</SelectItem>
                <SelectItem value="growing">Growing artist (1K-50K monthly listeners)</SelectItem>
                <SelectItem value="established">Established (50K+ monthly listeners)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Genre Input */}
          <div className="space-y-2">
            <Label htmlFor="genre">What's your primary genre?</Label>
            <Input
              id="genre"
              type="text"
              placeholder="e.g., Afrobeats, Hip-Hop, R&B"
              value={preferences.genre}
              onChange={(e) => setPreferences({ ...preferences, genre: e.target.value })}
            />
          </div>

          {/* Toggle Switches */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1">
                <Label htmlFor="remember-prefs" className="font-medium">Remember my preferences</Label>
                <p className="text-sm text-muted-foreground">Let AURA save context about your goals and campaigns</p>
              </div>
              <Switch
                id="remember-prefs"
                checked={preferences.rememberPrefs}
                onCheckedChange={(checked) => setPreferences({ ...preferences, rememberPrefs: checked })}
              />
            </div>

            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1">
                <Label htmlFor="use-history" className="font-medium">Use conversation history</Label>
                <p className="text-sm text-muted-foreground">Reference past conversations to provide better assistance</p>
              </div>
              <Switch
                id="use-history"
                checked={preferences.useHistory}
                onCheckedChange={(checked) => setPreferences({ ...preferences, useHistory: checked })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save Preferences →'}
            </Button>
            <Button
              onClick={handleReconfigure}
              variant="outline"
              className="flex-1"
            >
              Reconfigure from Onboarding
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
