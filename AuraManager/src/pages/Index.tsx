import { Greeting } from '@/components/dashboard/Greeting';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';
import { InboxHighlights } from '@/components/dashboard/InboxHighlights';
import { AIInsightSummary } from '@/components/dashboard/AIInsightSummary';

export default function Dashboard() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Greeting />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingTasks />
        <InboxHighlights />
      </div>
      <AIInsightSummary />
    </div>
  );
}
