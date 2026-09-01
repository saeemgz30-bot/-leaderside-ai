import { type ReactNode } from 'react';
import { Card } from './Card';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-base-800/50 text-slate-500 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-300">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="h-10 w-10 rounded-full border-2 border-base-700" />
        <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-transparent border-t-cyan-glow animate-spin" />
      </div>
      {label && <p className="mt-4 text-sm text-slate-400 animate-pulse">{label}</p>}
    </div>
  );
}

export function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-emerald-glow' : score >= 70 ? 'bg-cyan-glow' : score >= 50 ? 'bg-amber-glow' : 'bg-rose-glow';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-base-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-300 tabular-nums">{score}</span>
    </div>
  );
}
