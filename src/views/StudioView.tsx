import { useEffect, useState, useCallback } from 'react';
import {
  Sparkles, Loader2, Copy, Check, Wand2, Mail, FileText, MessageSquare,
  RefreshCw, Star, Zap, Lightbulb,
} from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/Card';
import { Select, Textarea } from '../components/ui/Input';
import { LoadingSpinner, EmptyState } from '../components/ui/EmptyState';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types';

const tones = ['Professional', 'Friendly', 'Direct', 'Consultative', 'Bold', 'Empathetic'];
const types = [
  { key: 'email', label: 'Cold Email', icon: Mail },
  { key: 'linkedin', label: 'LinkedIn Message', icon: MessageSquare },
  { key: 'followup', label: 'Follow-up Email', icon: FileText },
];

export function StudioView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [tone, setTone] = useState('Professional');
  const [type, setType] = useState('email');
  const [context, setContext] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string; reasoning: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('leads').select('*').order('company_name');
    setLeads(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  const generate = async () => {
    if (!selectedLead) return;
    setGenerating(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/v1/personalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead: selectedLead, tone: tone.toLowerCase(), type, context }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate personalization');
    }
    setGenerating(false);
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const savePersonalization = async () => {
    if (!result || !selectedLead) return;
    await supabase.from('personalizations').insert({
      lead_id: selectedLead.id,
      type,
      content: `Subject: ${result.subject}\n\n${result.body}`,
      tone: tone.toLowerCase(),
    });
    await supabase.from('activities').insert({
      type: 'ai_personalized',
      description: `AI generated personalized ${type} for ${selectedLead.company_name}`,
      lead_id: selectedLead.id,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <LoadingSpinner label="Loading leads..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Configuration Panel */}
        <div className="space-y-4">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-glow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-glow/10 text-violet-glow">
                  <Wand2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">AI Personalization Studio</h3>
                  <p className="text-xs text-slate-500">Generate hyper-personalized outreach with Gemini AI</p>
                </div>
              </div>

              <div className="space-y-3">
                <Select label="Select Lead" value={selectedLeadId} onChange={(e) => setSelectedLeadId(e.target.value)}>
                  <option value="">Choose a lead...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.company_name} — {l.contact_name || 'Unknown'}
                    </option>
                  ))}
                </Select>

                {selectedLead && (
                  <div className="glass rounded-xl p-3.5 animate-slide-in">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-200">{selectedLead.company_name}</p>
                      <Badge variant="cyan">Score: {selectedLead.score}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <span>{selectedLead.contact_name}</span>
                      <span>{selectedLead.title}</span>
                      <span>{selectedLead.industry}</span>
                      <span>{selectedLead.company_size}</span>
                    </div>
                    {selectedLead.notes && (
                      <p className="text-xs text-slate-500 mt-2 italic">{selectedLead.notes}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Message Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {types.map(t => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.key}
                          onClick={() => setType(t.key)}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all ${
                            type === t.key
                              ? 'bg-violet-glow/10 text-violet-glow border border-violet-glow/20'
                              : 'glass text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Select label="Tone" value={tone} onChange={(e) => setTone(e.target.value)}>
                  {tones.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>

                <Textarea
                  label="Additional Context (optional)"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={2}
                  placeholder="e.g. Mention our recent Series B funding, reference their latest product launch..."
                />

                <Button onClick={generate} disabled={generating || !selectedLead} className="w-full">
                  {generating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generate Personalized Message</>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Output Panel */}
        <div>
          {error && (
            <Card className="border-rose-glow/20 bg-rose-glow/5 mb-4">
              <p className="text-sm text-rose-glow">{error}</p>
            </Card>
          )}

          {generating ? (
            <Card className="h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative">
                <div className="h-14 w-14 rounded-full border-2 border-base-700" />
                <div className="absolute inset-0 h-14 w-14 rounded-full border-2 border-transparent border-t-violet-glow animate-spin" />
              </div>
              <p className="mt-4 text-sm text-slate-400">AI is crafting your message...</p>
              <div className="mt-2 flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-glow animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-violet-glow animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-violet-glow animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </Card>
          ) : result ? (
            <Card className="animate-slide-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="violet"><Zap className="w-3 h-3" /> AI Generated</Badge>
                  <Badge variant="default">{type}</Badge>
                  <Badge variant="default">{tone}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={generate}>
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Subject Line</p>
                  <div className="glass rounded-xl p-3">
                    <p className="text-sm font-medium text-slate-100">{result.subject}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Message Body</p>
                  <div className="glass rounded-xl p-3.5">
                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{result.body}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-glow" />
                    <p className="text-xs text-slate-500">AI Reasoning</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-slate-400 italic">{result.reasoning}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={savePersonalization} variant={saved ? 'secondary' : 'primary'} size="sm">
                  {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : <><Star className="w-3.5 h-3.5" /> Save Personalization</>}
                </Button>
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={<Sparkles className="w-6 h-6" />}
              title="No message generated yet"
              description="Select a lead, choose your tone and message type, then let AI craft a hyper-personalized outreach message."
            />
          )}
        </div>
      </div>
    </div>
  );
}
