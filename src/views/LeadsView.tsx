import { useEffect, useState, useCallback } from 'react';
import { Users, Plus, ListFilter as Filter, Trash2, MoveVertical as MoreVertical, Mail, Phone, Globe, Linkedin, Building2, Star, ChevronDown } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Input';
import { EmptyState, LoadingSpinner, ScoreBar } from '../components/ui/EmptyState';
import { supabase } from '../lib/supabase';
import type { Lead, LeadStatus } from '../types';

const statusVariants: Record<LeadStatus, 'default' | 'cyan' | 'emerald' | 'amber' | 'rose'> = {
  new: 'default',
  contacted: 'cyan',
  engaged: 'emerald',
  qualified: 'amber',
  disqualified: 'rose',
};

export function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setLeads(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const filtered = leads.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.company_name.toLowerCase().includes(q) ||
        (l.contact_name?.toLowerCase().includes(q) || false) ||
        (l.industry?.toLowerCase().includes(q) || false);
    }
    return true;
  });

  const updateStatus = async (id: string, status: LeadStatus) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, status });
  };

  const deleteLead = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);
  };

  if (loading) return <LoadingSpinner label="Loading leads..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as LeadStatus | 'all')}
              className="rounded-xl bg-base-850/50 border border-white/5 pl-9 pr-8 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-glow/30 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="engaged">Engaged</option>
              <option value="qualified">Qualified</option>
              <option value="disqualified">Disqualified</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl bg-base-850/50 border border-white/5 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-glow/30 w-full sm:w-64"
          />
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" /> Add Lead
        </Button>
      </div>

      {/* Leads Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No leads found"
          description="Try adjusting your filters or extract new leads using the Lead Extractor."
          action={<Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Lead Manually</Button>}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left font-medium px-5 py-3">Company</th>
                  <th className="text-left font-medium px-5 py-3">Contact</th>
                  <th className="text-left font-medium px-5 py-3 hidden md:table-cell">Industry</th>
                  <th className="text-left font-medium px-5 py-3 hidden lg:table-cell">Score</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="border-b border-white/[0.03] hover:bg-base-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-800/50 text-slate-400 text-xs font-semibold flex-shrink-0">
                          {lead.company_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-glow transition-colors">{lead.company_name}</p>
                          <p className="text-xs text-slate-500">{lead.company_size || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-slate-300">{lead.contact_name || '—'}</p>
                      <p className="text-xs text-slate-500">{lead.title || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-slate-400">{lead.industry || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <div className="w-24"><ScoreBar score={lead.score} /></div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusVariants[lead.status]}>{lead.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="text-slate-500 hover:text-slate-300 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Lead Modal */}
      <AddLeadModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={loadLeads} />

      {/* Lead Detail Modal */}
      {selectedLead && (
        <Modal open={!!selectedLead} onClose={() => setSelectedLead(null)} title="Lead Details" size="lg">
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-base-800/50 text-slate-300 font-bold">
                  {selectedLead.company_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{selectedLead.company_name}</h3>
                  <p className="text-sm text-slate-400">{selectedLead.contact_name} · {selectedLead.title}</p>
                </div>
              </div>
              <Badge variant={statusVariants[selectedLead.status]}>{selectedLead.status}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="glass rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Mail className="w-3 h-3" /> Email</div>
                <p className="text-sm text-slate-200">{selectedLead.email || '—'}</p>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Phone className="w-3 h-3" /> Phone</div>
                <p className="text-sm text-slate-200">{selectedLead.phone || '—'}</p>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Globe className="w-3 h-3" /> Website</div>
                <p className="text-sm text-slate-200">{selectedLead.website || '—'}</p>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Linkedin className="w-3 h-3" /> LinkedIn</div>
                <p className="text-sm text-slate-200">{selectedLead.linkedin || '—'}</p>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Building2 className="w-3 h-3" /> Industry</div>
                <p className="text-sm text-slate-200">{selectedLead.industry || '—'}</p>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Star className="w-3 h-3" /> Fit Score</div>
                <ScoreBar score={selectedLead.score} />
              </div>
            </div>

            {selectedLead.notes && (
              <div className="glass rounded-xl p-3.5">
                <p className="text-xs text-slate-500 mb-1">Notes</p>
                <p className="text-sm text-slate-300">{selectedLead.notes}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {(['new', 'contacted', 'engaged', 'qualified', 'disqualified'] as LeadStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selectedLead.id, s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedLead.status === s
                        ? 'bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30'
                        : 'glass text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="danger" size="sm" onClick={() => deleteLead(selectedLead.id)}>
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedLead(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AddLeadModal({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({
    company_name: '', contact_name: '', title: '', email: '', phone: '',
    industry: '', company_size: '', revenue: '', website: '', linkedin: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.company_name) return;
    setSaving(true);
    await supabase.from('leads').insert({
      ...form,
      status: 'new',
      score: 50,
      source: 'Manual Entry',
    });
    await supabase.from('activities').insert({
      type: 'lead_imported',
      description: `Manually added lead: ${form.company_name}`,
    });
    setSaving(false);
    setForm({ company_name: '', contact_name: '', title: '', email: '', phone: '', industry: '', company_size: '', revenue: '', website: '', linkedin: '', notes: '' });
    onAdded();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Lead" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Company Name *" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Acme Corp" />
          <Input label="Contact Name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} placeholder="Jane Doe" />
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VP of Engineering" />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@acme.com" />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-0100" />
          <Input label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="SaaS" />
          <Input label="Company Size" value={form.company_size} onChange={(e) => setForm({ ...form, company_size: e.target.value })} placeholder="200-500" />
          <Input label="Revenue" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} placeholder="$20M-$50M" />
          <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="acme.com" />
          <Input label="LinkedIn" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="linkedin.com/in/janedoe" />
        </div>
        <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Additional context about this lead..." />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.company_name}>
            {saving ? 'Saving...' : 'Save Lead'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
