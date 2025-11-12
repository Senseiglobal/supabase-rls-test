import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AIInsightSummary = () => {
  // In production, this would fetch AI-generated insights from API
  const insights = [
    {
      id: 1,
      type: 'opportunity',
      message: '3 venues have expressed interest in booking dates in Q2 2025',
      priority: 'high',
    },
    {
      id: 2,
      type: 'action',
      message: 'Follow up with Blue Note Jazz Club regarding March residency',
      priority: 'urgent',
    },
    {
      id: 3,
      type: 'trend',
      message: 'Booking inquiries up 40% this month compared to last month',
      priority: 'medium',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      default: return 'secondary';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4" />;
      case 'action': return <AlertCircle className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          🤖 AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {insights.map((insight) => (
            <li
              key={insight.id}
              className="flex items-start gap-3 p-3 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
            >
              <div className="mt-1">{getIcon(insight.type)}</div>
              <div className="flex-1">
                <p className="text-sm">{insight.message}</p>
              </div>
              <Badge variant={getPriorityColor(insight.priority)}>
                {insight.priority}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};