import { useEffect, useState, useCallback } from 'react';
import {
  Workflow, Plus, Trash2, Mail, Clock, ChevronRight, GripVertical,
  Loader2, Save, ArrowDown, FileText,
} from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Input';
import { EmptyState, LoadingSpinner } from '../components/ui/EmptyState';
import { supabase } from '../lib/supabase';
import type { Campaign, SequenceStep } from '../types';

export function SequencesView() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [showAddStep, setShowAddStep] = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    setCampaigns(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const loadSteps = useCallback(async (campaignId: string) => {
    setStepsLoading(true);
    const { data } = await supabase
      .from('sequence_steps')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('step_number', { ascending: true });
    setSteps(data || []);
    setStepsLoading(false);
  }, []);

  useEffect(() => {
    if (selectedCampaign) loadSteps(selectedCampaign.id);
    else setSteps([]);
  }, [selectedCampaign, loadSteps]);

  const deleteStep = async (id: string) => {
    await supabase.from('sequence_steps').delete().eq('id', id);
    if (selectedCampaign) loadSteps(selectedCampaign.id);
  };

  const updateStep = async (id: string, field: keyof SequenceStep, value: string | number) => {
    await supabase.from('sequence_steps').update({ [field]: value }).eq('id', id);
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  if (loading) return <LoadingSpinner label="Loading campaigns..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Build automated multi-step outreach sequences</p>
        <Button size="sm" onClick={() => setShowAddCampaign(true)}>
          <Plus className="w-3.5 h-3.5" /> New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Campaign List */}
        <div className="space-y-2">
          {campaigns.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-slate-500">No campaigns yet</p>
            </Card>
          ) : (
            campaigns.map(c => (
              <Card
                key={c.id}
                hover
                className={`cursor-pointer ${selectedCampaign?.id === c.id ? 'border-cyan-glow/30 glow-cyan' : ''}`}
              >
                <div onClick={() => setSelectedCampaign(c)}>
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-sm font-semibold text-slate-200">{c.name}</h5>
                    <Badge variant={c.status === 'active' ? 'emerald' : c.status === 'draft' ? 'default' : 'amber'}>
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{c.description || 'No description'}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <Mail className="w-3 h-3" /> {c.channel}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Sequence Builder */}
        <div className="lg:col-span-2">
          {!selectedCampaign ? (
            <EmptyState
              icon={<Workflow className="w-6 h-6" />}
              title="Select a campaign"
              description="Choose a campaign from the left to view and edit its sequence steps."
            />
          ) : stepsLoading ? (
            <LoadingSpinner label="Loading sequence..." />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-semibold text-slate-100">{selectedCampaign.name}</h4>
                  <p className="text-xs text-slate-500">{steps.length} step sequence</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setShowAddStep(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add Step
                </Button>
              </div>

              {steps.length === 0 ? (
                <EmptyState
                  icon={<Mail className="w-6 h-6" />}
                  title="No steps in this sequence"
                  description="Add your first outreach step to start building the sequence."
                  action={<Button size="sm" onClick={() => setShowAddStep(true)}><Plus className="w-3.5 h-3.5" /> Add First Step</Button>}
                />
              ) : (
                <div className="space-y-2">
                  {steps.map((step, idx) => (
                    <div key={step.id}>
                      <Card hover className="group">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1 pt-1">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-glow/10 text-cyan-glow text-xs font-bold">
                              {step.step_number}
                            </div>
                            {idx < steps.length - 1 && <ArrowDown className="w-3 h-3 text-slate-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="cyan">
                                  {step.channel === 'email' ? <Mail className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                  {step.channel}
                                </Badge>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Day {step.delay_days}
                                </span>
                              </div>
                              <button onClick={() => deleteStep(step.id)} className="text-slate-500 hover:text-rose-glow transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              className="w-full bg-transparent text-sm font-medium text-slate-200 mb-2 focus:outline-none border-b border-transparent focus:border-cyan-glow/20 transition-all"
                              value={step.subject || ''}
                              onChange={(e) => updateStep(step.id, 'subject', e.target.value)}
                              placeholder="Subject line..."
                            />
                            <textarea
                              className="w-full bg-transparent text-xs text-slate-400 focus:outline-none resize-none border border-white/5 rounded-lg p-2 focus:border-cyan-glow/20 transition-all"
                              rows={3}
                              value={step.body || ''}
                              onChange={(e) => updateStep(step.id, 'body', e.target.value)}
                              placeholder="Email body..."
                            />
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                              <span>Delay:</span>
                              <input
                                type="number"
                                className="w-16 bg-base-850/50 border border-white/5 rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-glow/20"
                                value={step.delay_days}
                                onChange={(e) => updateStep(step.id, 'delay_days', parseInt(e.target.value) || 0)}
                              />
                              <span>days after previous step</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Step Modal */}
      <AddStepModal
        open={showAddStep}
        onClose={() => setShowAddStep(false)}
        campaignId={selectedCampaign?.id || ''}
        nextStep={steps.length + 1}
        onAdded={() => selectedCampaign && loadSteps(selectedCampaign.id)}
      />

      {/* Add Campaign Modal */}
      <AddCampaignModal
        open={showAddCampaign}
        onClose={() => setShowAddCampaign(false)}
        onAdded={loadCampaigns}
      />
    </div>
  );
}

function AddStepModal({ open, onClose, campaignId, nextStep, onAdded }: {
  open: boolean; onClose: () => void; campaignId: string; nextStep: number; onAdded: () => void;
}) {
  const [channel, setChannel] = useState('email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [delayDays, setDelayDays] = useState(1);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('sequence_steps').insert({
      campaign_id: campaignId,
      step_number: nextStep,
      channel,
      subject,
      body,
      delay_days: delayDays,
    });
    setSaving(false);
    setSubject(''); setBody(''); setDelayDays(1); setChannel('email');
    onAdded();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Add Sequence Step ${nextStep}`}>
      <div className="space-y-4">
        <Select label="Channel" value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="email">Email</option>
          <option value="linkedin">LinkedIn</option>
          <option value="call">Phone Call</option>
          <option value="task">Task</option>
        </Select>
        <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Quick question about..." />
        <Textarea label="Body" value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Hi {{first_name}}, ..." />
        <Input label="Delay (days after previous step)" type="number" value={delayDays} onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)} />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !campaignId}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Add Step'}
          </Button>
        </div>
      </div>
    </Modal>
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
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
