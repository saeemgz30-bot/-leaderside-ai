import { useState } from 'react';
import {
  Search, Sparkles, Plus, Building2, User, Mail, Globe, Star, Loader2, Zap, Target,
} from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Input';
import { ScoreBar } from '../components/ui/EmptyState';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types';

interface ExtractedLead {
  company_name: string;
  contact_name: string;
  title: string;
  industry: string;
  company_size: string;
  website: string;
  email: string;
  score: number;
  reasoning: string;
}

export function ExtractorView({ onNavigate }: { onNavigate: (v: 'leads' | 'studio') => void }) {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [results, setResults] = useState<ExtractedLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);

  const handleExtract = async () => {
    if (!query) return;
    setLoading(true);
    setError('');
    setResults([]);
    setSelected(new Set());
    try {
      const res = await fetch('/api/v1/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, industry, companySize }),
      });
      if (!res.ok) throw new Error('Extraction failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract leads');
    }
    setLoading(false);
  };

  const toggleSelect = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === results.length) setSelected(new Set());
    else setSelected(new Set(results.map((_, i) => i)));
  };

  const importSelected = async () => {
    setImporting(true);
    const toImport = results.filter((_, i) => selected.has(i));
    let count = 0;
    for (const lead of toImport) {
      const { error } = await supabase.from('leads').insert({
        company_name: lead.company_name,
        contact_name: lead.contact_name,
        title: lead.title,
        email: lead.email,
        industry: lead.industry,
        company_size: lead.company_size,
        website: lead.website,
        status: 'new',
        score: lead.score,
        source: 'AI Extractor',
        notes: lead.reasoning,
      });
      if (!error) count++;
    }
    if (count > 0) {
      await supabase.from('activities').insert({
        type: 'lead_extracted',
        description: `Extracted ${count} new leads via AI Extractor`,
      });
    }
    setImported(count);
    setImporting(false);
    setTimeout(() => {
      setImported(0);
      setResults([]);
      setSelected(new Set());
      onNavigate('leads');
    }, 1500);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Search Panel */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-glow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-glow/10 text-cyan-glow">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">AI Lead Extractor</h3>
              <p className="text-xs text-slate-500">Describe your ideal customer profile and let AI find matching prospects</p>
            </div>
          </div>

          <div className="space-y-3">
            <Textarea
              label="Search Query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={2}
              placeholder="e.g. Series B SaaS companies in the cybersecurity space with engineering teams of 50+"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Industry Filter" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Cybersecurity" />
              <Select label="Company Size" value={companySize} onChange={(e) => setCompanySize(e.target.value)}>
                <option value="">Any Size</option>
                <option value="1-50">1-50</option>
                <option value="50-200">50-200</option>
                <option value="200-500">200-500</option>
                <option value="500-1000">500-1000</option>
                <option value="1000-5000">1000-5000</option>
                <option value="5000+">5000+</option>
              </Select>
            </div>
            <Button onClick={handleExtract} disabled={loading || !query} className="w-full">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Extracting Leads...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Extract Leads with AI</>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-rose-glow/20 bg-rose-glow/5">
          <p className="text-sm text-rose-glow">{error}</p>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-semibold text-slate-200">Extracted Leads ({results.length})</h4>
              <button onClick={selectAll} className="text-xs text-cyan-glow hover:underline">
                {selected.size === results.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <Button size="sm" onClick={importSelected} disabled={importing || selected.size === 0}>
              {importing ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing...</>
              ) : imported > 0 ? (
                <><Star className="w-3.5 h-3.5" /> {imported} Imported!</>
              ) : (
                <><Plus className="w-3.5 h-3.5" /> Import {selected.size > 0 ? `(${selected.size})` : ''}</>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((lead, idx) => {
              const isSelected = selected.has(idx);
              return (
                <Card
                  key={idx}
                  hover
                  className={`cursor-pointer transition-all ${isSelected ? 'border-cyan-glow/30 glow-cyan' : ''}`}
                >
                  <div className="flex items-start gap-3" onClick={() => toggleSelect(idx)}>
                    <div className={`flex h-5 w-5 items-center justify-center rounded-md border mt-0.5 flex-shrink-0 transition-all ${
                      isSelected ? 'bg-cyan-glow border-cyan-glow text-base-950' : 'border-base-600'
                    }`}>
                      {isSelected && <Plus className="w-3 h-3 rotate-45" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="text-sm font-semibold text-slate-200">{lead.company_name}</h5>
                          <p className="text-xs text-slate-500">{lead.contact_name} · {lead.title}</p>
                        </div>
                        <Badge variant={lead.score >= 85 ? 'emerald' : lead.score >= 70 ? 'cyan' : 'amber'}>
                          {lead.score}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-400 mb-2.5">
                        <div className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {lead.industry}</div>
                        <div className="flex items-center gap-1.5"><User className="w-3 h-3" /> {lead.company_size}</div>
                        <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {lead.email}</div>
                        <div className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {lead.website}</div>
                      </div>
                      <div className="w-28 mb-2"><ScoreBar score={lead.score} /></div>
                      <p className="text-xs text-slate-500 italic">{lead.reasoning}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && !error && (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-glow/10 text-cyan-glow mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-300">Ready to find your next customers</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            Describe your ideal customer profile above and AI will generate matching prospects with fit scores.
          </p>
        </Card>
      )}
    </div>
  );
}
