import { useAuth } from '@/lib/AuthContext';
import WelcomeHeader from '../components/home/WelcomeHeader';
import ChronosTimeline from '../components/home/ChronosTimeline';
import QuickActions from '../components/home/QuickActions';

export default function Home() {
  const { user, profile } = useAuth();

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <WelcomeHeader user={user} profile={profile} />
      <QuickActions />
      <ChronosTimeline currentPeriod={profile?.current_period} />
    </div>
  );
}

