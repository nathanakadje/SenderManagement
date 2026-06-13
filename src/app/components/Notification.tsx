import { useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  type: NotificationType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Notification({ type, message, onClose, duration = 5000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#ecfdf5',
          border: '#059669',
          icon: <CheckCircle2 size={18} style={{ color: '#059669' }} />,
          textColor: '#065f46'
        };
      case 'error':
        return {
          bg: '#fff1f2',
          border: '#e11d48',
          icon: <XCircle size={18} style={{ color: '#e11d48' }} />,
          textColor: '#be123c'
        };
      default:
        return {
          bg: '#eff6ff',
          border: '#2563eb',
          icon: <AlertCircle size={18} style={{ color: '#2563eb' }} />,
          textColor: '#1e40af'
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className="fixed top-4 right-4 z-50 animate-slide-in"
      style={{
        minWidth: 300,
        maxWidth: 400,
        background: styles.bg,
        borderLeft: `4px solid ${styles.border}`,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {styles.icon}
      <p style={{ flex: 1, color: styles.textColor, fontSize: '0.875rem', fontWeight: 500 }}>
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 4,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.05)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
      >
        <X size={14} style={{ color: styles.textColor }} />
      </button>
    </div>
  );
}