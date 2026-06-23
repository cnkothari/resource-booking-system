import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

const Badge = ({ children, className = 'bg-slate-200 text-slate-700' }: BadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

export default Badge;
