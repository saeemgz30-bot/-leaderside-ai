import {
  LayoutDashboard,
  Users,
  Search,
  Sparkles,
  Workflow,
  Megaphone,
  Settings,
  Zap,
  X,
} from 'lucide-react';
import type { ViewKey } from '../../types';

interface SidebarProps {
  active: ViewKey;
  onNavigate: (view: ViewKey) => void;
  open: boolean;
  onClose: () => void;
}

const navItems: { key: ViewKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'leads', label: 'Lead Pipeline', icon: Users },
  { key: 'extractor', label: 'Lead Extractor', icon: Search },
  { key: 'studio', label: 'AI Studio', icon: Sparkles },
  { key: 'sequences', label: 'Sequence Builder', icon: Workflow },
  { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ active, onNavigate, open, onClose }: SidebarProps) {
  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-full w-64 glass-strong border-r border-white/5 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-glow to-cyan-deep glow-cyan">
            <Zap className="w-5 h-5 text-base-950" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 leading-tight">LeaderSide</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">AI Growth Engine</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-glow/10 text-cyan-glow border border-cyan-glow/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-base-800/50 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/5">
          <div className="glass rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-emerald-glow animate-pulse-glow" />
              <p className="text-xs font-medium text-slate-300">System Active</p>
            </div>
            <p className="text-[10px] text-slate-500">Gemini API connected</p>
          </div>
        </div>
      </aside>
    </>
  );
}
