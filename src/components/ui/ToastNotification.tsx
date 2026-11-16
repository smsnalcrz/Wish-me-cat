import React from 'react';
import { Sparkles } from 'lucide-react';

interface ToastProps {
  title: string;
  message: string;
}

export const ToastNotification: React.FC<ToastProps> = ({ title, message }) => {
  return (
    <div className="cosmic-panel toast-banner">
      <Sparkles className="text-yellow-400" size={24} style={{ color: '#fbbf24' }} />
      <div>
        <div style={{ color: '#fbbf24', fontSize: '14px', textTransform: 'uppercase' }}>{title}</div>
        <div style={{ color: '#f8fafc', fontSize: '15px' }}>{message}</div>
      </div>
    </div>
  );
};
