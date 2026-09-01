import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`glass rounded-2xl p-5 ${hover ? 'transition-all duration-300 hover:border-cyan-glow/20 hover:shadow-[0_0_30px_-8px_rgba(34,211,238,0.15)]' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  accent: 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';
}

const accentMap = {
  cyan: { text: 'text-cyan-glow', bg: 'bg-cyan-glow/10', border: 'border-cyan-glow/20' },
  emerald: { text: 'text-emerald-glow', bg: 'bg-emerald-glow/10', border: 'border-emerald-glow/20' },
  amber: { text: 'text-amber-glow', bg: 'bg-amber-glow/10', border: 'border-amber-glow/20' },
  rose: { text: 'text-rose-glow', bg: 'bg-rose-glow/10', border: 'border-rose-glow/20' },
  violet: { text: 'text-violet-glow', bg: 'bg-violet-glow/10', border: 'border-violet-glow/20' },
};

export function StatCard({ label, value, icon, trend, accent }: StatCardProps) {
  const a = accentMap[accent];
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-100">{value}</p>
          {trend && (
            <p className={`mt-1.5 text-xs font-medium ${trend.positive ? 'text-emerald-glow' : 'text-rose-glow'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${a.bg} ${a.border} ${a.text}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';
  className?: string;
}

const badgeVariants = {
  default: 'bg-base-700/50 text-slate-300 border-base-600/50',
  cyan: 'bg-cyan-glow/10 text-cyan-glow border-cyan-glow/20',
  emerald: 'bg-emerald-glow/10 text-emerald-glow border-emerald-glow/20',
  amber: 'bg-amber-glow/10 text-amber-glow border-amber-glow/20',
  rose: 'bg-rose-glow/10 text-rose-glow border-rose-glow/20',
  violet: 'bg-violet-glow/10 text-violet-glow border-violet-glow/20',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeVariants[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-glow to-cyan-deep text-base-950 font-semibold hover:shadow-[0_0_20px_-4px_rgba(34,211,238,0.4)] hover:brightness-110',
    secondary: 'glass text-slate-200 hover:border-cyan-glow/20 hover:text-cyan-glow',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-base-800/50',
    danger: 'bg-rose-glow/10 text-rose-glow border border-rose-glow/20 hover:bg-rose-glow/20',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
