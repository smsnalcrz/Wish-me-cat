import React from 'react';
import { PixelStardustIcon } from './PixelIcons';

interface ToastProps {
  title: string;
  message: string;
}

export const ToastNotification: React.FC<ToastProps> = ({ title, message }) => {
  return (
    <div className="cosmic-panel toast-banner">
      <PixelStardustIcon size={24} />
      <div>
        <div style={{ color: '#fbbf24', fontSize: '11px', fontFamily: 'var(--font-heading)' }}>{title}</div>
        <div style={{ color: '#f8fafc', fontSize: '13px' }}>{message}</div>
      </div>
    </div>
  );
};
