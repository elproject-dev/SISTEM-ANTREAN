import type { ReactNode } from 'react';
import { Card, CardContent } from '@elproject/ui';

interface KpiCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  footerText?: string;
  gradientClass: string;
  titleColorClass?: string;
}

export function KpiCard({ 
  title, 
  value, 
  icon, 
  footerText, 
  gradientClass, 
  titleColorClass = "text-white/80" 
}: KpiCardProps) {
  return (
    <Card className={`${gradientClass} border-0 shadow-lg h-full`}>
      <CardContent className="p-4 sm:p-5 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className={`${titleColorClass} text-xs sm:text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis`}>{title}</p>
            <p className="text-lg sm:text-lg md:text-xl font-bold text-white leading-tight mt-1">
              {value}
            </p>
          </div>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
            {icon}
          </div>
        </div>
        {footerText && (
          <p className={`${titleColorClass} text-xs mt-3 font-medium`}>{footerText}</p>
        )}
      </CardContent>
    </Card>
  );
}
