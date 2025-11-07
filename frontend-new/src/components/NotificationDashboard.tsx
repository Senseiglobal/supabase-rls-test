import { Bell, Home, BarChart, Music, User, Plus, Check, ExternalLink } from 'lucide-react';

/* 
  🧩 Notification Dashboard UI
  Fixed layout with proper alignment, spacing, and accessibility
  Dark mode with WCAG-compliant contrast ratios
*/

const theme = {
  colors: {
    background: "#0e0e0e",
    surface: "#1a1a1a",
    surfaceHover: "#212121",
    border: "#2a2a2a",
    textPrimary: "#f1f1f1",
    textSecondary: "#a3a3a3",
    textMuted: "#6b7280",
    accent: {
      orange: "#f97316",
      orangeHover: "#fb923c",
      green: "#22c55e",
      greenHover: "#4ade80",
      yellow: "#facc15",
      yellowHover: "#fde047",
      red: "#ef4444",
      redHover: "#f87171",
    },
  },
  spacing: {
    cardPadding: "20px",
    cardGap: "16px",
    containerPadding: "16px",
  },
  typography: {
    title: "text-lg font-semibold leading-tight text-gray-100",
    body: "text-sm text-gray-300 leading-relaxed",
    small: "text-xs text-gray-400",
    tag: "text-xs font-medium",
  },
  borderRadius: {
    card: "12px",
    tag: "8px",
    button: "8px",
  }
};

interface NotificationCardProps {
  status: 'high' | 'medium' | 'low';
  color: 'orange' | 'green' | 'yellow' | 'red';
  title: string;
  description: string;
  time: string;
}

function NotificationCard({ status, color, title, description, time }: NotificationCardProps) {
  const accent = theme.colors.accent[color as keyof typeof theme.colors.accent];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return { 
        bg: theme.colors.accent.red, 
        hover: theme.colors.accent.redHover,
        text: '#FFFFFF' // White text for high contrast on red
      };
      case 'medium': return { 
        bg: theme.colors.accent.yellow, 
        hover: theme.colors.accent.yellowHover,
        text: '#000000' // Black text for contrast on yellow
      };
      case 'low': return { 
        bg: theme.colors.accent.green, 
        hover: theme.colors.accent.greenHover,
        text: '#000000' // Black text for contrast on green
      };
      default: return { 
        bg: theme.colors.accent.orange, 
        hover: theme.colors.accent.orangeHover,
        text: '#000000' // Black text for contrast on orange
      };
    }
  };

  const statusColors = getStatusColor(status);

  return (
    <div 
      className="relative group transition-all duration-200 hover:shadow-lg overflow-hidden"
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.card,
        border: `1px solid ${theme.colors.border}`,
        padding: `${theme.spacing.cardPadding}`,
        minHeight: '120px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
        e.currentTarget.style.borderColor = theme.colors.accent.orange + '40';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.surface;
        e.currentTarget.style.borderColor = theme.colors.border;
      }}
    >
      {/* Accent Line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ 
          backgroundColor: accent,
          borderTopLeftRadius: theme.borderRadius.card,
          borderBottomLeftRadius: theme.borderRadius.card,
        }}
      />

      {/* Card Content Container - Ensures proper spacing */}
      <div className="flex flex-col space-y-4 pl-4">
        {/* Header Row - Title and Status Tag */}
        <div className="flex items-center justify-between gap-4">
          <h3 
            className={`${theme.typography.title} flex-1`}
            style={{ 
              lineHeight: '1.3',
              margin: '0',
            }}
          >
            {title}
          </h3>
          
          <span
            className={`${theme.typography.tag} px-3 py-1.5 rounded-full transition-all duration-200 cursor-default flex-shrink-0 font-semibold`}
            style={{
              backgroundColor: statusColors.bg,
              color: statusColors.text,
              borderRadius: theme.borderRadius.tag,
              minWidth: 'fit-content',
              textShadow: status === 'high' ? '0 0 1px rgba(0,0,0,0.5)' : 'none', // Better readability for white text
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = statusColors.hover;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = statusColors.bg;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {status}
          </span>
        </div>

        {/* Body Text */}
        <p 
          className={`${theme.typography.body} -mt-1`}
          style={{ 
            lineHeight: '1.6',
            margin: '0',
          }}
        >
          {description}
        </p>

        {/* Footer Row - Time and Actions */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-700/50">
          <span className={theme.typography.small}>
            {time}
          </span>
          
          <div className="flex items-center space-x-3">
            <button 
              type="button"
              className="flex items-center space-x-1.5 text-gray-400 hover:text-green-400 transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-gray-800/50 group"
              style={{ borderRadius: theme.borderRadius.button }}
            >
              <Check className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Mark as Read</span>
            </button>
            
            <button 
              type="button"
              className="flex items-center space-x-1.5 text-gray-400 hover:text-orange-400 transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-gray-800/50 group"
              style={{ borderRadius: theme.borderRadius.button }}
            >
              <span className="text-xs font-medium">Tell me more</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationDashboard() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: theme.colors.background, 
        color: theme.colors.textPrimary 
      }}
    >
      {/* Header */}
      <header 
        className="flex justify-between items-center border-b"
        style={{ 
          borderColor: theme.colors.border,
          padding: `12px ${theme.spacing.containerPadding}`,
        }}
      >
        <div className="flex items-center space-x-4">
          {['youtube', 'tiktok', 'instagram'].map((platform, i) => (
            <button
              key={i}
              type="button"
              className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded"
              aria-label={`Open ${platform}`}
            >
              <div className="w-5 h-5 bg-current rounded"></div>
            </button>
          ))}
        </div>
      </header>

      {/* Filter Tabs */}
      <div 
        className="flex justify-center space-x-3 border-b"
        style={{ 
          borderColor: theme.colors.border,
          padding: `16px ${theme.spacing.containerPadding}`,
        }}
      >
        {["All", "Unread", "Urgent"].map((tab, i) => (
          <button
            key={i}
            type="button"
            className={`px-5 py-2.5 font-medium transition-all duration-200 ${
              tab === "All"
                ? "text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
            style={tab === "All" ? { 
              backgroundColor: theme.colors.accent.orange,
              borderRadius: theme.borderRadius.button,
            } : {
              borderRadius: theme.borderRadius.button,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification Cards */}
      <main 
        className="flex-1 overflow-y-auto"
        style={{ padding: theme.spacing.containerPadding }}
      >
        <div className="space-y-5 max-w-4xl mx-auto">
          <NotificationCard
            status="high"
            color="red"
            title="Critical: Account Security Alert"
            description="Unusual login activity detected from a new device. Please review your account security settings and enable two-factor authentication if you haven't already."
            time="2 hours ago"
          />

          <NotificationCard
            status="medium"
            color="yellow"
            title="Streaming Milestone Reached"
            description="Your latest single 'Midnight Dreams' just hit 10,000 streams. This is 40% faster than your previous release. Great momentum!"
            time="5 hours ago"
          />

          <NotificationCard
            status="low"
            color="green"
            title="Weekly Analytics Report Available"
            description="Your performance analytics for this week are now available. Check out your streaming trends, audience insights, and engagement metrics."
            time="1 day ago"
          />

          <NotificationCard
            status="high"
            color="red"
            title="Urgent: Payment Method Expires Soon"
            description="Your premium subscription payment method expires in 2 days. Update your billing information to avoid service interruption."
            time="3 hours ago"
          />
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        type="button"
        className="fixed bottom-24 right-6 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/50"
        style={{
          backgroundColor: theme.colors.accent.orange,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.accent.orangeHover;
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.accent.orange;
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Add new notification"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 w-full flex justify-around border-t"
        style={{ 
          backgroundColor: "#111111", 
          borderColor: theme.colors.border,
          padding: '12px 0',
        }}
      >
        {[
          { icon: Home, label: 'Home' },
          { icon: BarChart, label: 'Analytics' },
          { icon: Music, label: 'Music' },
          { icon: Bell, label: 'Notifications' },
          { icon: User, label: 'Profile' },
        ].map((item, i) => (
          <button
            key={i}
            type="button"
            className="flex flex-col items-center text-gray-400 hover:text-orange-400 transition-colors duration-200 p-2 rounded"
            aria-label={item.label}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}