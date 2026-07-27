import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface ActionIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  actionType: 'edit' | 'delete';
}

export function ActionIconButton({ actionType, className = '', ...props }: ActionIconButtonProps) {
  const isDelete = actionType === 'delete';
  const Icon = isDelete ? Trash2 : Edit;
  
  const baseClass = "p-2 rounded-lg transition-colors duration-200 flex items-center justify-center text-slate-400";
  const hoverClass = isDelete 
    ? "hover:text-rose-500" 
    : "hover:text-orange-500";

  return (
    <button className={`${baseClass} ${hoverClass} ${className}`} type="button" {...props}>
      <Icon className="w-[18px] h-[18px]" />
    </button>
  );
}
