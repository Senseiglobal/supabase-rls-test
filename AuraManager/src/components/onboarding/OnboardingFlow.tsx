import { useState } from 'react';
import './OnboardingFlow.css';

interface OnboardingData {
  name?: string;
  goal?: string;
  careerStage?: string;
  genre?: string;
  rememberPrefs?: boolean;
  useHistory?: boolean;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({});

  const next = () => setStep(prev => Math.min(prev + 1, 3));
  const skip = () => onComplete(formData);

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {step === 1 && <WelcomeScreen onNext={next} />}
        {step === 2 && <ConnectScreen onNext={next} onSkip={skip} />}
        {step === 3 && (
          <PersonalizationScreen
            formData={formData}
            setFormData={setFormData}
            onComplete={onComplete}
            onSkip={skip}
          />
        )}
        <ProgressDots step={step} />
      </div>
    </div>
  );
}

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="progress-dots">
      {[1, 2, 3].map(val => (
        <span
          key={val}
          className={`dot ${step === val ? 'active' : ''}`}
        />
      ))}
    </div>
  );
}

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="screen welcome-screen animate-fadeIn">
      <h1 className="main-heading">AURA - Your Music Career Command Center</h1>
      <p className="subheading">Track everything. Grow everywhere.</p>
      
      <div className="dashboard-preview">
        <div className="preview-content">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">12.5K</div>
            <div className="stat-label">Monthly Streams</div>
            <div className="stat-change">+24.5%</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">3,450</div>
            <div className="stat-label">Active Fans</div>
            <div className="stat-change">+180 new</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎵</div>
            <div className="stat-value">8.4%</div>
            <div className="stat-label">Engagement</div>
            <div className="stat-change">+2.5%</div>
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={onNext}>
        Get Started
      </button>
    </div>
  );
}

function ConnectScreen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="screen connect-screen animate-fadeIn">
      <h2 className="screen-heading">Connect Your Data Sources</h2>
      <p className="screen-subheading">We'll gather insights automatically</p>

      <div className="connection-cards">
        <ConnectionCard
          icon="🔗"
          title="BIOLINKS"
          description="Import audience data from:"
          logos={['Linktree', 'Beacons', 'Tap.bio']}
          benefits={[
            'Click analytics',
            'Traffic sources',
            'Top performing links'
          ]}
          buttonText="Connect Biolink"
        />

        <ConnectionCard
          icon="📊"
          title="MUSIC & SOCIAL"
          description="Track performance across:"
          logos={['Spotify', 'Instagram', 'TikTok']}
          benefits={[
            'Stream & engagement data',
            'Growth trends',
            'Post performance'
          ]}
          buttonText="Connect Platforms"
        />
      </div>

      <button className="skip-link" onClick={onNext}>
        Skip - I'll do this later
      </button>
    </div>
  );
}

function ConnectionCard({
  icon,
  title,
  description,
  logos,
  benefits,
  buttonText
}: {
  icon: string;
  title: string;
  description: string;
  logos: string[];
  benefits: string[];
  buttonText: string;
}) {
  return (
    <div className="connection-card">
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <h3 className="card-title">{title}</h3>
      </div>
      <p className="card-description">{description}</p>
      <div className="platform-logos">
        {logos.map(logo => (
          <div key={logo} className="platform-logo">{logo}</div>
        ))}
      </div>
      <div className="benefits">
        <span className="benefits-label">What you'll get:</span>
        <ul className="benefits-list">
          {benefits.map(benefit => (
            <li key={benefit}>✓ {benefit}</li>
          ))}
        </ul>
      </div>
      <button className="btn-secondary">{buttonText}</button>
    </div>
  );
}

function PersonalizationScreen({
  formData,
  setFormData,
  onComplete,
  onSkip
}: {
  formData: OnboardingData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}) {
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [otherGoalText, setOtherGoalText] = useState('');

  const handleGoalChange = (goal: string) => {
    setSelectedGoal(goal);
    if (goal !== 'other') {
      setFormData(prev => ({ ...prev, goal }));
    }
  };

  const handleOtherGoalChange = (text: string) => {
    setOtherGoalText(text);
    setFormData(prev => ({ ...prev, goal: text }));
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  return (
    <div className="screen personalization-screen animate-fadeIn">
      <h2 className="screen-heading">🤖 Meet Your AI Music Manager</h2>
      <p className="screen-subheading">Help me understand your goals so I can assist you better</p>

      <form className="personalization-form">
        <div className="form-group">
          <label>What should I call you? <span className="optional">(optional)</span></label>
          <input
            type="text"
            placeholder="Your name or alias"
            value={formData.name || ''}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>What's your primary goal right now?</label>
          <div className="radio-group">
            {[
              { val: 'launch', label: '🚀 Launch a new release' },
              { val: 'grow', label: '📈 Grow my fanbase' },
              { val: 'streams', label: '🎵 Increase streams' },
              { val: 'shows', label: '🎤 Book more shows' },
              { val: 'other', label: '✨ Something else' }
            ].map(opt => (
              <label key={opt.val} className="radio-label">
                <input
                  type="radio"
                  name="goal"
                  checked={selectedGoal === opt.val}
                  onChange={() => handleGoalChange(opt.val)}
                  className="radio-input"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
          {selectedGoal === 'other' && (
            <input
              type="text"
              placeholder="Describe your goal"
              value={otherGoalText}
              onChange={e => handleOtherGoalChange(e.target.value)}
              className="form-input mt-2"
            />
          )}
        </div>

        <div className="form-group">
          <label>Where are you in your music career?</label>
          <select
            className="form-select"
            value={formData.careerStage || ''}
            onChange={e => setFormData(prev => ({ ...prev, careerStage: e.target.value }))}
          >
            <option value="">Select...</option>
            <option value="starting">Just starting out (0-1K monthly listeners)</option>
            <option value="growing">Growing artist (1K-50K monthly listeners)</option>
            <option value="established">Established (50K+ monthly listeners)</option>
          </select>
        </div>

        <div className="form-group">
          <label>What's your primary genre?</label>
          <input
            type="text"
            placeholder="e.g., Afrobeats, Hip-Hop, R&B"
            value={formData.genre || ''}
            onChange={e => setFormData(prev => ({ ...prev, genre: e.target.value }))}
            className="form-input"
          />
        </div>

        <div className="toggle-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={formData.rememberPrefs || false}
              onChange={e => setFormData(prev => ({ ...prev, rememberPrefs: e.target.checked }))}
              className="toggle-input"
            />
            <div className="toggle-content">
              <span className="toggle-title">Remember my preferences</span>
              <span className="toggle-description">Let AURA save context about your goals and campaigns</span>
            </div>
          </label>

          <label className="toggle-label">
            <input
              type="checkbox"
              checked={formData.useHistory || false}
              onChange={e => setFormData(prev => ({ ...prev, useHistory: e.target.checked }))}
              className="toggle-input"
            />
            <div className="toggle-content">
              <span className="toggle-title">Use conversation history</span>
              <span className="toggle-description">Reference past conversations to provide better assistance</span>
            </div>
          </label>
        </div>

        <button type="button" className="btn-primary" onClick={handleSubmit}>
          Start Using AURA →
        </button>
        <button type="button" className="btn-tertiary" onClick={onSkip}>
          Skip - I'll set this up later
        </button>
      </form>
    </div>
  );
}
