import React from 'react';

export interface SampleCardProps {
  title: string;
  description?: string;
  badgeText?: string;
  children?: React.ReactNode;
}

export const SampleCard: React.FC<SampleCardProps> = ({
  title,
  description,
  badgeText,
  children,
}) => {
  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
          {title}
        </h3>
        {badgeText && (
          <span
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: '#e0e7ff',
              color: '#3730a3',
              fontWeight: 600,
            }}
          >
            {badgeText}
          </span>
        )}
      </div>
      {description && (
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
};
