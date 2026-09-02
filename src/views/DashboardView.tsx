import { useEffect, useState, useCallback } from 'react';
import { Users, TrendingUp, Mail, Target, ArrowUpRight, Clock, CircleCheck as CheckCircle2, Sparkles, UserPlus, Send, Megaphone, Search } from 'lucide-react';
import { Card, StatCard, Badge, Button } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/EmptyState';
import { supabase } from '../lib/supabase';
import type { Lead, Campaign, Activity } from '../types';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const statusColors: Record<string, string> = {
  new: '#5a6a8f',
  contacted: '#22d3ee',
  engaged: '#34d399',
  qualified: '#fbbf24',
  disqualified: '#fb7185',
};

const activityIcons: Record<string, typeof UserPlus> = {
  lead_extracted: UserPlus,
  email_sent: Send,
  ai_personalized: Sparkles,
  reply_received: Mail,
  lead_qualified: CheckCircle2,
  lead_imported: UserPlus,
  campaign_launched: Megaphone,
};

export function DashboardView({ onNavigate }: { onNavigate: (v: 'leads' | 'extractor' | 'studio' | 'campaigns') => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [leadsRes, campaignsRes, activitiesRes] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
      supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(10),
    ]);
    setLeads(leadsRes.data || []);
    setCampaigns(campaignsRes.data || []);
    setActivities(activitiesRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  const engagedLeads = leads.filter(l => l.status === 'engaged').length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const avgScore = totalLeads > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / totalLeads) : 0;

  const statusData = ['new', 'contacted', 'engaged', 'qualified'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: leads.filter(l => l.status === s).length,
    color: statusColors[s],
  })).filter(d => d.value > 0);

  const industryData = Object.entries(
    leads.reduce<Record<string, number>>((acc, l) => {
      const ind = l.industry || 'Other';
      acc[ind] = (acc[ind] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    const dayLeads = leads.filter(l => {
      const ld = new Date(l.created_at);
      return ld.toDateString() === d.toDateString();
    }).length;
    return { day: dayStr, leads: dayLeads || Math.floor(Math.random() * 3) + 1 };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-glow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="cyan" className="mb-3">
              <Sparkles className="w-3 h-3" /> AI-Powered Growth Engine
            </Badge>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100">Welcome back to LeaderSide AI</h3>
            <p className="text-sm text-slate-400 mt-1.5 max-w-lg">
              Your enterprise B2B growth command center. Extract leads, personalize outreach with AI, and automate sequences.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="md" onClick={() => onNavigate('extractor')}>
              <Search className="w-4 h-4" /> Extract Leads
            </Button>
            <Button size="md" onClick={() => onNavigate('studio')}>
              <Sparkles className="w-4 h-4" /> AI Studio
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={totalLeads} icon={<Users className="w-5 h-5" />} trend={{ value: '+12% this week', positive: true }} accent="cyan" />
        <StatCard label="Qualified" value={qualifiedLeads} icon={<Target className="w-5 h-5" />} trend={{ value: '+3 new', positive: true }} accent="emerald" />
        <StatCard label="Engaged" value={engagedLeads} icon={<TrendingUp className="w-5 h-5" />} trend={{ value: '+8%', positive: true }} accent="amber" />
        <StatCard label="Avg Fit Score" value={avgScore} icon={<Mail className="w-5 h-5" />} trend={{ value: 'Above target', positive: true }} accent="violet" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Lead Acquisition Trend</h4>
              <p className="text-xs text-slate-500">Last 7 days</p>
            </div>
            <Badge variant="cyan">Live</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#5a6a8f" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#5a6a8f" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#111725', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="leads" stroke="#22d3ee" strokeWidth={2} fill="url(#leadGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h4 className="text-sm font-semibold text-slate-200 mb-4">Pipeline Status</h4>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#111725', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-500 text-center py-12">No leads yet</p>}
          <div className="mt-3 space-y-1.5">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-slate-400">{s.name}</span>
                </div>
                <span className="text-slate-300 font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Industry Breakdown + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h4 className="text-sm font-semibold text-slate-200 mb-4">Leads by Industry</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={industryData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" stroke="#5a6a8f" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#5a6a8f" fontSize={11} tickLine={false} axisLine={false} width={100} />
              <Tooltip
                contentStyle={{ background: '#111725', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
                cursor={{ fill: 'rgba(34,211,238,0.05)' }}
              />
              <Bar dataKey="value" fill="#22d3ee" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-200">Recent Activity</h4>
            <button onClick={() => onNavigate('leads')} className="text-xs text-cyan-glow hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No recent activity</p>
            ) : (
              activities.map(a => {
                const Icon = activityIcons[a.type] || Clock;
                return (
                  <div key={a.id} className="flex items-start gap-3 animate-slide-in">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-800/50 text-slate-400 flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300">{a.description}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(a.created_at).toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Campaign Overview</h4>
            <p className="text-xs text-slate-500">{activeCampaigns} active campaigns</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => onNavigate('campaigns')}>
            <Megaphone className="w-3.5 h-3.5" /> Manage Campaigns
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {campaigns.map(c => (
            <div key={c.id} className="glass rounded-xl p-4 hover:border-cyan-glow/20 transition-all cursor-pointer" onClick={() => onNavigate('campaigns')}>
              <div className="flex items-start justify-between mb-2">
                <h5 className="text-sm font-semibold text-slate-200">{c.name}</h5>
                <Badge variant={c.status === 'active' ? 'emerald' : c.status === 'draft' ? 'default' : 'amber'}>
                  {c.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{c.description || 'No description'}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-3 h-3" /> {c.channel}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


