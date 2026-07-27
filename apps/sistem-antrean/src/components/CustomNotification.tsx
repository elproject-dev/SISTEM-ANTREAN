import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface CustomNotificationProps {
  type?: 'error' | 'success' | 'info';
  message: string;
}

export function CustomNotification({ type = 'error', message }: CustomNotificationProps) {
  let bgClass = '';
  let Icon = AlertCircle;

  if (type === 'error') {
    bgClass = 'bg-red-600 text-white shadow-lg shadow-red-900/30 border border-red-700/50';
    Icon = AlertCircle;
  } else if (type === 'success') {
    bgClass = 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500/50';
    Icon = CheckCircle;
  } else if (type === 'info') {
    bgClass = 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 border border-blue-700/50';
    Icon = Info;
  }

  // Remove emojis from old message strings if present
  const cleanMessage = message.replace(/^(❌|✅|ℹ️)\s*/, '');

  return (
    <div className={`${bgClass} px-6 py-4 rounded-2xl flex items-center font-bold text-[15px] animate-in fade-in slide-in-from-top-4 backdrop-blur-sm`}>
      <Icon className="mr-3 w-6 h-6 shrink-0 drop-shadow-md" />
      <span className="drop-shadow-sm">{cleanMessage}</span>
    </div>
  );
}
