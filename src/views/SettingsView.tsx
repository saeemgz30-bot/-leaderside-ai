import { useState } from 'react';
import {
  Settings as SettingsIcon, User, Bell, Shield, Palette, Zap, Mail, Check,
} from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Input';

export function SettingsView() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'ai', label: 'AI Settings', icon: Zap },
    { key: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Tabs */}
        <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-cyan-glow/10 text-cyan-glow border border-cyan-glow/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-base-800/50 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <h4 className="text-base font-semibold text-slate-100 mb-4">Profile Settings</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Full Name" defaultValue="LeaderSide Admin" />
                  <Input label="Email" defaultValue="admin@leaderside.ai" />
                  <Input label="Company" defaultValue="LeaderSide AI" />
                  <Input label="Role" defaultValue="Administrator" />
                </div>
                <Textarea label="Bio" rows={2} defaultValue="Enterprise B2B growth specialist leveraging AI for lead generation and outreach." />
                <div className="flex justify-end">
                  <Button onClick={handleSave}>
                    {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h4 className="text-base font-semibold text-slate-100 mb-4">Notification Preferences</h4>
              <div className="space-y-3">
                {[
                  { label: 'New lead extracted', desc: 'Get notified when AI extracts new leads', defaultOn: true },
                  { label: 'Lead replies', desc: 'Email alerts when a lead responds to outreach', defaultOn: true },
                  { label: 'Campaign milestones', desc: 'Notifications for campaign performance milestones', defaultOn: true },
                  { label: 'Weekly digest', desc: 'Summary of your pipeline every Monday', defaultOn: false },
                  { label: 'AI generation complete', desc: 'Alert when AI finishes personalizing messages', defaultOn: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between glass rounded-xl p-3.5">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <Toggle defaultOn={item.defaultOn} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <h4 className="text-base font-semibold text-slate-100 mb-4">Security</h4>
              <div className="space-y-4">
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-emerald-glow" />
                    <p className="text-sm font-medium text-slate-200">Two-Factor Authentication</p>
                    <Badge variant="emerald">Enabled</Badge>
                  </div>
                  <p className="text-xs text-slate-500">Your account is protected with 2FA via authenticator app.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Current Password" type="password" placeholder="••••••••" />
                  <Input label="New Password" type="password" placeholder="••••••••" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave}>
                    {saved ? <><Check className="w-4 h-4" /> Updated!</> : 'Update Password'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'ai' && (
            <Card>
              <h4 className="text-base font-semibold text-slate-100 mb-4">AI Configuration</h4>
              <div className="space-y-4">
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-cyan-glow" />
                    <p className="text-sm font-medium text-slate-200">Gemini API Status</p>
                    <Badge variant="emerald"><Check className="w-3 h-3" /> Connected</Badge>
                  </div>
                  <p className="text-xs text-slate-500">Using gemini-2.5-flash for personalization and lead extraction.</p>
                </div>
                <Select label="Default Tone" defaultValue="Professional">
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Direct</option>
                  <option>Consultative</option>
                </Select>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Max Message Length (words)</label>
                  <input type="range" min="50" max="300" defaultValue="150" className="w-full accent-cyan-glow" />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>50</span><span>150</span><span>300</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave}>
                    {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save AI Settings'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <h4 className="text-base font-semibold text-slate-100 mb-4">Appearance</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Dark', 'Midnight', 'Slate'].map((theme, i) => (
                      <button
                        key={theme}
                        className={`glass rounded-xl p-4 text-center transition-all ${i === 0 ? 'border-cyan-glow/30 glow-cyan' : 'hover:border-white/10'}`}
                      >
                        <div className={`h-12 rounded-lg mb-2 ${i === 0 ? 'bg-gradient-to-br from-base-900 to-base-800' : i === 1 ? 'bg-gradient-to-br from-base-950 to-base-900' : 'bg-gradient-to-br from-base-800 to-base-700'}`} />
                        <p className="text-xs font-medium text-slate-300">{theme}</p>
                        {i === 0 && <Badge variant="cyan" className="mt-1">Active</Badge>}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Accent Color</label>
                  <div className="flex gap-2">
                    {[
                      { name: 'cyan', color: 'bg-cyan-glow', active: true },
                      { name: 'emerald', color: 'bg-emerald-glow' },
                      { name: 'amber', color: 'bg-amber-glow' },
                      { name: 'rose', color: 'bg-rose-glow' },
                      { name: 'violet', color: 'bg-violet-glow' },
                    ].map(c => (
                      <button
                        key={c.name}
                        className={`h-8 w-8 rounded-lg ${c.color} ${c.active ? 'ring-2 ring-offset-2 ring-offset-base-900 ring-white/20' : ''} transition-all hover:scale-110`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-cyan-glow' : 'bg-base-700'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}
