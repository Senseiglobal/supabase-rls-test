import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export interface NotificationProps {
  id: string;
  title: string;
  message?: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number; // in milliseconds
  onClose?: () => void;
}

interface NotificationItemProps extends NotificationProps {
  onClose: () => void;
}

export function NotificationItem({ id, title, message, type, duration = 4000, onClose }: NotificationItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Match animation duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900",
    error: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
    info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900",
    warning: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900",
  };

  const textColor = {
    success: "text-green-900 dark:text-green-200",
    error: "text-red-900 dark:text-red-200",
    info: "text-blue-900 dark:text-blue-200",
    warning: "text-yellow-900 dark:text-yellow-200",
  };

  const iconColor = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
    warning: "text-yellow-600 dark:text-yellow-400",
  };

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }[type];

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm
        transition-all duration-300 animate-in slide-in-from-right
        ${isExiting ? "animate-out slide-out-to-right opacity-0" : "opacity-100"}
        ${bgColor[type]}
      `}
      role="alert"
    >
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColor[type]}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${textColor[type]}`}>{title}</p>
        {message && <p className={`text-sm ${textColor[type]} opacity-90 mt-0.5`}>{message}</p>}
      </div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className={`flex-shrink-0 mt-0.5 p-1 hover:opacity-70 transition-opacity ${textColor[type]}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface NotificationContainerProps {
  notifications: NotificationProps[];
  onRemove: (id: string) => void;
}

export function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem
            {...notification}
            onClose={() => onRemove(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Simple notification manager hook
let notificationId = 0;

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, "id">) => {
    const id = `notification-${notificationId++}`;
    setNotifications((prev) => [...prev, { ...notification, id }]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const success = (title: string, message?: string, duration?: number) => {
    return addNotification({ title, message, type: "success", duration });
  };

  const error = (title: string, message?: string, duration?: number) => {
    return addNotification({ title, message, type: "error", duration: duration || 5000 });
  };

  const info = (title: string, message?: string, duration?: number) => {
    return addNotification({ title, message, type: "info", duration });
  };

  const warning = (title: string, message?: string, duration?: number) => {
    return addNotification({ title, message, type: "warning", duration });
  };

  return {
    notifications,
    removeNotification,
    addNotification,
    success,
    error,
    info,
    warning,
  };
}
