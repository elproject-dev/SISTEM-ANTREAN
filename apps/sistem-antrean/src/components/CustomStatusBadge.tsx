import React from 'react';

export type BadgeVariant = 'active' | 'inactive' | 'success' | 'warning' | 'error' | 'slate' | 'info' | 'purple';

interface CustomStatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  active: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600 shadow-[0_2px_0_0_#059669] hover:from-emerald-400 hover:to-emerald-500 active:translate-y-[2px] active:shadow-none',
  success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600 shadow-[0_2px_0_0_#059669] hover:from-emerald-400 hover:to-emerald-500 active:translate-y-[2px] active:shadow-none',
  inactive: 'bg-slate-600 text-white border-slate-700 shadow-[0_2px_0_0_#334155] hover:bg-slate-500 active:translate-y-[2px] active:shadow-none',
  slate: 'bg-slate-500 text-white border-slate-600 shadow-[0_2px_0_0_#475569] hover:bg-slate-400 active:translate-y-[2px] active:shadow-none',
  warning: 'bg-amber-500 text-white border-amber-600 shadow-[0_2px_0_0_#d97706] hover:bg-amber-400 active:translate-y-[2px] active:shadow-none',
  error: 'bg-rose-500 text-white border-rose-600 shadow-[0_2px_0_0_#e11d48] hover:bg-rose-400 active:translate-y-[2px] active:shadow-none',
  info: 'bg-blue-500 text-white border-blue-600 shadow-[0_2px_0_0_#2563eb] hover:bg-blue-400 active:translate-y-[2px] active:shadow-none',
  purple: 'bg-purple-500 text-white border-purple-600 shadow-[0_2px_0_0_#9333ea] hover:bg-purple-400 active:translate-y-[2px] active:shadow-none',
};

const flatVariantStyles: Record<BadgeVariant, string> = {
  active: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600',
  success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600',
  inactive: 'bg-slate-600 text-white border-slate-700',
  slate: 'bg-slate-500 text-white border-slate-600',
  warning: 'bg-amber-500 text-white border-amber-600',
  error: 'bg-rose-500 text-white border-rose-600',
  info: 'bg-blue-500 text-white border-blue-600',
  purple: 'bg-purple-500 text-white border-purple-600',
};

export function CustomStatusBadge({
  variant,
  label,
  icon,
  onClick,
  className = '',
}: CustomStatusBadgeProps) {
  const baseClasses = "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all";
  
  const isClickable = !!onClick;
  const styleClasses = isClickable ? variantStyles[variant] : flatVariantStyles[variant];
  
  const combinedClasses = `${baseClasses} ${styleClasses} ${className}`;

  if (isClickable) {
    return (
      <button type="button" onClick={onClick} className={combinedClasses}>
        {icon}
        {label}
      </button>
    );
  }

  return (
    <span className={combinedClasses}>
      {icon}
      {label}
    </span>
  );
}
