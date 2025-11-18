import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const navigate = useNavigate();

  const handleComplete = async (data: any) => {
    // Save to Supabase is handled in OnboardingFlow component
    // Navigate to dashboard after completion
    navigate('/dashboard');
  };

  return <OnboardingFlow onComplete={handleComplete} />;
};

export default Onboarding;
