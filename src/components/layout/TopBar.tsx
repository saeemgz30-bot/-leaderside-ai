import { Bell, Search } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-white/5 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search leads, campaigns..."
              className="w-64 rounded-xl bg-base-850/50 border border-white/5 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-glow/30 transition-all"
            />
          </div>
          <button className="relative p-2.5 rounded-xl glass text-slate-400 hover:text-slate-200 transition-colors">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-glow" />
          </button>
          <div className="flex items-center gap-2.5 glass rounded-xl px-3 py-1.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-glow to-cyan-deep flex items-center justify-center text-sm font-bold text-base-950">
              L
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-slate-200">LeaderSide</p>
              <p className="text-[10px] text-slate-500">Enterprise Plan</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
