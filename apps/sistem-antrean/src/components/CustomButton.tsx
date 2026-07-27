import React from 'react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'slate' | 'success' | 'error';
}

export function CustomButton({ variant = 'primary', className = '', children, ...props }: CustomButtonProps) {
    const baseClass = "px-6 py-[10px] font-bold rounded-xl transition-all duration-150 active:translate-y-[4px] active:border-b-0 text-sm flex items-center justify-center gap-2 whitespace-nowrap border-b-4";

  let variantClass = "";
  if (variant === 'primary') {
    variantClass = "bg-orange-500 text-white hover:bg-orange-400 border-orange-700 shadow-lg shadow-orange-500/20 active:shadow-none";
  } else if (variant === 'slate') {
    variantClass = "bg-slate-600 text-white hover:bg-slate-500 border-slate-800 shadow-lg shadow-slate-600/20 active:shadow-none";
  } else if (variant === 'success') {
    variantClass = "bg-emerald-500 text-white hover:bg-emerald-400 border-emerald-700 shadow-lg shadow-emerald-500/20 active:shadow-none";
  } else if (variant === 'error') {
    variantClass = "bg-rose-500 text-white hover:bg-rose-400 border-rose-700 shadow-lg shadow-rose-500/20 active:shadow-none";
  }

  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
