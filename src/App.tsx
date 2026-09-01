import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DashboardView } from './views/DashboardView';
import { LeadsView } from './views/LeadsView';
import { ExtractorView } from './views/ExtractorView';
import { StudioView } from './views/StudioView';
import { SequencesView } from './views/SequencesView';
import { CampaignsView } from './views/CampaignsView';
import { SettingsView } from './views/SettingsView';
import type { ViewKey } from './types';

const viewMeta: Record<ViewKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your B2B growth command center' },
  leads: { title: 'Lead Pipeline', subtitle: 'Manage and track all your prospects' },
  extractor: { title: 'AI Lead Extractor', subtitle: 'Find new prospects with AI-powered search' },
  studio: { title: 'AI Personalization Studio', subtitle: 'Generate hyper-personalized outreach messages' },
  sequences: { title: 'Sequence Builder', subtitle: 'Design multi-step outreach campaigns' },
  campaigns: { title: 'Campaigns', subtitle: 'Manage your outreach campaigns' },
  settings: { title: 'Settings', subtitle: 'Configure your LeaderSide AI workspace' },
};

export default function App() {
  const [view, setView] = useState<ViewKey>('dashboard');

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView onNavigate={(v) => setView(v as ViewKey)} />;
      case 'leads':
        return <LeadsView />;
      case 'extractor':
        return <ExtractorView onNavigate={(v) => setView(v as ViewKey)} />;
      case 'studio':
        return <StudioView />;
      case 'sequences':
        return <SequencesView />;
      case 'campaigns':
        return <CampaignsView />;
      case 'settings':
        return <SettingsView />;
    }
  };

  const meta = viewMeta[view];

  return (
    <div className="min-h-screen bg-base-900">
      <Sidebar active={view} onNavigate={setView} />
      <div className="ml-64">
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <main className="p-8 max-w-[1400px]">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
