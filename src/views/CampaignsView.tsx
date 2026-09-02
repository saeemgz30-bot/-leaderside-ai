import { useEffect, useState, useCallback } from 'react';
import { Megaphone, Plus, MoveVertical as MoreVertical, Mail, Calendar, TrendingUp, Play, Pause, Trash2 } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Input';
import { LoadingSpinner, EmptyState } from '../components/ui/EmptyState';
import { supabase } from '../lib/supabase';
import type { Campaign } from '../types';

const statusVariants: Record<string, 'default' | 'emerald' | 'amber' | 'cyan'> = {
  draft: 'default',
  active: 'emerald',
  paused: 'amber',
  completed: 'cyan',
};

export function CampaignsView() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    setCampaigns(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('campaigns').update({ status }).eq('id', id);
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    setMenuOpen(null);
  };

  const deleteCampaign = async (id: string) => {
    await supabase.from('campaigns').delete().eq('id', id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
    setMenuOpen(null);
  };

  if (loading) return <LoadingSpinner label="Loading campaigns..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="glass rounded-xl px-3 sm:px-4 py-2.5">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-base sm:text-lg font-bold text-slate-100">{campaigns.length}</p>
          </div>
          <div className="glass rounded-xl px-3 sm:px-4 py-2.5">
            <p className="text-xs text-slate-500">Active</p>
            <p className="text-base sm:text-lg font-bold text-emerald-glow">{campaigns.filter(c => c.status === 'active').length}</p>
          </div>
          <div className="glass rounded-xl px-3 sm:px-4 py-2.5">
            <p className="text-xs text-slate-500">Draft</p>
            <p className="text-base sm:text-lg font-bold text-slate-300">{campaigns.filter(c => c.status === 'draft').length}</p>
          </div>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" /> New Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="w-6 h-6" />}
          title="No campaigns yet"
          description="Create your first outreach campaign to start managing sequences and tracking performance."
          action={<Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Create Campaign</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(c => (
            <Card key={c.id} hover className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-800/50 text-slate-400">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-200">{c.name}</h5>
                    <p className="text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)}
                    className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpen === c.id && (
                    <div className="absolute right-0 top-8 z-10 glass-strong rounded-xl p-1.5 min-w-[140px] animate-scale-in">
                      {c.status !== 'active' && (
                        <button onClick={() => updateStatus(c.id, 'active')} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-base-800/50 transition-colors">
                          <Play className="w-3.5 h-3.5" /> Activate
                        </button>
                      )}
                      {c.status === 'active' && (
                        <button onClick={() => updateStatus(c.id, 'paused')} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-base-800/50 transition-colors">
                          <Pause className="w-3.5 h-3.5" /> Pause
                        </button>
                      )}
                      <button onClick={() => deleteCampaign(c.id)} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-glow hover:bg-rose-glow/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{c.description || 'No description provided.'}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariants[c.status]}>{c.status}</Badge>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {c.channel}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddCampaignModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={loadCampaigns} />
    </div>
  );
}

function AddCampaignModal({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState('email');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    await supabase.from('campaigns').insert({ name, description, status: 'draft', channel });
    await supabase.from('activities').insert({
      type: 'campaign_launched',
      description: `Created new campaign: ${name}`,
    });
    setSaving(false);
    setName(''); setDescription(''); setChannel('email');
    onAdded();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Campaign">
      <div className="space-y-4">
        <Input label="Campaign Name *" value={name} onChange={(e) => setName(e.target.value)} placeholder="Q1 Enterprise Push" />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Targeting enterprise accounts..." />
        <Select label="Channel" value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="email">Email</option>
          <option value="linkedin">LinkedIn</option>
          <option value="multi">Multi-channel</option>
        </Select>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name}>
            <Plus className="w-4 h-4" /> {saving ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
