
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@elproject/ui';
import { cn } from '@elproject/ui';

export interface SelectOption {
  value: string;
  label: any;
}

interface CustomSelectProps {
  label?: any;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
  className?: string; // Additional classes for the container
}

export function CustomSelect({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  required = false,
  className,
}: CustomSelectProps) {
  return (
    <div className={cn("flex flex-col justify-end gap-1.5", className)}>
      {label && (
        <label className="text-sm font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full h-[44px] bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/15 transition-all duration-200 hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm [&>span]:flex [&>span]:w-full [&>span]:items-center">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white shadow-xl border-slate-100 rounded-xl overflow-hidden p-1">
          {options.map((opt) => (
            <SelectItem 
              key={opt.value} 
              value={opt.value}
              className="cursor-pointer rounded-lg py-2.5 pl-3 pr-10 mb-1 last:mb-0 transition-colors focus:bg-slate-100 focus:text-primary data-[highlighted]:bg-slate-100 data-[highlighted]:text-primary [&>span:not(.absolute)]:w-full"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
