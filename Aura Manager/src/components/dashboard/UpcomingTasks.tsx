import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export const UpcomingTasks = () => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['upcoming-tasks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true })
        .limit(5);

      return data || [];
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'warning';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">Loading tasks...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🗓️ Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks?.length === 0 ? (
          <p className="text-muted-foreground">No upcoming tasks. You're all caught up!</p>
        ) : (
          <ul className="space-y-3">
            {tasks?.map((task) => (
              <li key={task.id} className="flex items-start justify-between border-l-2 border-blue-500 pl-3 py-2">
                <div>
                  <p className="font-medium">{task.title}</p>
                  {task.due_date && (
                    <p className="text-sm text-muted-foreground">
                      Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <Badge variant={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
