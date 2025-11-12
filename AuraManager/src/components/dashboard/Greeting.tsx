import { useUser } from '@/contexts/UserContext';

export function Greeting() {
  const { user } = useUser();
  const name = user?.first_name || "Artist";
  return (
    <div className="mb-6 text-xl font-semibold">
      Hello, {name}! Welcome back to Aura Manager.
    </div>
  );
}
