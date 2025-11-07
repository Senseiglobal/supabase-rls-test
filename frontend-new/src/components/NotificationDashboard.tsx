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
      case 'high': return { bg: theme.colors.accent.red, hover: theme.colors.accent.redHover };
      case 'medium': return { bg: theme.colors.accent.yellow, hover: theme.colors.accent.yellowHover };
      case 'low': return { bg: theme.colors.accent.green, hover: theme.colors.accent.greenHover };
      default: return { bg: theme.colors.accent.orange, hover: theme.colors.accent.orangeHover };
    }
  };

  const statusColors = getStatusColor(status);

  return (
    <div 
      className="relative group transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.card,
        border: `1px solid ${theme.colors.border}`,
        padding: theme.spacing.cardPadding,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.surface;
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
      <div className="flex flex-col space-y-4 ml-2">
        {/* Header Row - Title and Status Tag */}
        <div className="flex items-start justify-between gap-4">
          <h3 
            className={`${theme.typography.title} flex-1 pr-2`}
            style={{ 
              lineHeight: '1.4',
              marginTop: '2px', // Align with status tag
            }}
          >
            {title}
          </h3>
          
          <span
            className={`${theme.typography.tag} px-3 py-1.5 rounded-full transition-all duration-200 cursor-default flex-shrink-0`}
            style={{
              backgroundColor: statusColors.bg,
              color: '#000000', // High contrast for accessibility
              borderRadius: theme.borderRadius.tag,
              minWidth: 'fit-content',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = statusColors.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = statusColors.bg;
            }}
          >
            {status}
          </span>
        </div>

        {/* Body Text */}
        <p 
          className={theme.typography.body}
          style={{ 
            lineHeight: '1.5',
            marginTop: '0',
            marginBottom: '0',
          }}
        >
          {description}
        </p>

        {/* Footer Row - Time and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
          <span className={theme.typography.small}>
            {time}
          </span>
          
          <div className="flex items-center space-x-4">
            <button 
              type="button"
              className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors duration-200 px-2 py-1 rounded group"
              style={{ borderRadius: theme.borderRadius.button }}
            >
              <Check className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Mark as Read</span>
            </button>
            
            <button 
              type="button"
              className="flex items-center space-x-2 text-gray-400 transition-colors duration-200 px-2 py-1 rounded group"
              style={{ 
                borderRadius: theme.borderRadius.button,
                color: theme.colors.textSecondary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.accent.orange;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.textSecondary;
              }}
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
        <div className="space-y-4 max-w-4xl mx-auto">
          <NotificationCard
            status="high"
            color="red"
            title="Peak posting time detected"
            description="Your audience is most active between 7–9 PM. Consider posting your next single announcement during this window to maximize engagement."
            time="2 hours ago"
          />

          <NotificationCard
            status="medium"
            color="yellow"
            title="Milestone reached!"
            description="Your latest single 'Midnight Dreams' just hit 10,000 streams. This is 40% faster than your previous release."
            time="5 hours ago"
          />

          <NotificationCard
            status="low"
            color="green"
            title="Weekly report ready"
            description="Your performance analytics for this week are now available. Check out your streaming trends and audience insights."
            time="1 day ago"
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