import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const Greeting = () => {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('profiles')
        .select('first_name, archetype')
        .eq('id', user.id)
        .single();

      return data;
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">
        {getGreeting()}, {profile?.first_name || 'there'} 👋
      </h1>
      {profile?.archetype && (
        <p className="text-muted-foreground mt-1">
          Your archetype: <span className="font-medium">{profile.archetype}</span>
        </p>
      )}
    </div>
  );
};
