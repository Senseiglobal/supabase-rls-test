// Preferences Settings Page
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface UserPreferences {
  name?: string;
  goal?: string;
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
    careerStage: '',
    genre: '',
    rememberPrefs: true,
    useHistory: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to manage your preferences');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        toast.error('Failed to load preferences');
      } else if (data) {
        setPreferences({
          name: data.name || '',
          goal: data.goal || '',
          careerStage: data.career_stage || '',
          genre: data.genre || '',
          rememberPrefs: data.remember_prefs ?? true,
          useHistory: data.use_history ?? false,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to save preferences');
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          name: preferences.name,
          goal: preferences.goal,
          career_stage: preferences.careerStage,
          genre: preferences.genre,
          remember_prefs: preferences.rememberPrefs,
          use_history: preferences.useHistory,
        });

      if (error) {
        console.error('Error saving preferences:', error);
        toast.error('Failed to save preferences');
      } else {
        toast.success('Preferences saved successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleReconfigureOnboarding = () => {
    navigate('/onboarding');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Preferences</h1>
      <p className="text-muted-foreground mb-8">
        Manage your music preferences and personalization settings
      </p>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            value={preferences.name}
            onChange={(e) => setPreferences({ ...preferences, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
          />
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium mb-2">Goal</label>
          <select
            value={preferences.goal}
            onChange={(e) => setPreferences({ ...preferences, goal: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a goal</option>
            <option value="discover">Discover new music</option>
            <option value="organize">Organize my library</option>
            <option value="create">Create playlists</option>
            <option value="analyze">Analyze my taste</option>
          </select>
        </div>

        {/* Career Stage */}
        <div>
          <label className="block text-sm font-medium mb-2">Career Stage</label>
          <select
            value={preferences.careerStage}
            onChange={(e) => setPreferences({ ...preferences, careerStage: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select career stage</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="professional">Professional</option>
          </select>
        </div>

        {/* Genre */}
        <div>
          <label className="block text-sm font-medium mb-2">Favorite Genre</label>
          <input
            type="text"
            value={preferences.genre}
            onChange={(e) => setPreferences({ ...preferences, genre: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Rock, Pop, Jazz"
          />
        </div>

        {/* Remember Preferences */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="rememberPrefs"
            checked={preferences.rememberPrefs}
            onChange={(e) => setPreferences({ ...preferences, rememberPrefs: e.target.checked })}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="rememberPrefs" className="text-sm font-medium">
            Remember my preferences
          </label>
        </div>

        {/* Use History */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useHistory"
            checked={preferences.useHistory}
            onChange={(e) => setPreferences({ ...preferences, useHistory: e.target.checked })}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="useHistory" className="text-sm font-medium">
            Use my listening history for recommendations
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
          
          <Button
            onClick={handleReconfigureOnboarding}
            variant="outline"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Reconfigure Onboarding
          </Button>
        </div>
      </div>
    </div>
  );
}
