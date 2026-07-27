import React from 'react';

export interface SampleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export const SampleButton: React.FC<SampleButtonProps> = ({
  variant = 'primary',
  children,
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    padding: '10px 18px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ...style,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#4f46e5',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: '#10b981',
      color: '#ffffff',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1px solid #cbd5e1',
      color: '#334155',
    },
  };

  return (
    <button style={{ ...baseStyle, ...variantStyles[variant] }} {...props}>
      {children}
    </button>
  );
};
