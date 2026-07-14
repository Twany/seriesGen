import React, { useState } from 'react';
import { Save, Sliders, Cpu, Monitor, DownloadCloud, Key, CreditCard, ChevronRight } from 'lucide-react';

type SettingsTab = 'general' | 'engine' | 'display' | 'exports' | 'api-keys' | 'billing';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] relative overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-white/10 flex shrink-0 items-center justify-between px-8 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-[10px] tracking-[0.4em] opacity-40 uppercase">Preferences</span>
          <span className="text-sm font-medium tracking-tight font-serif italic text-white/80">System Settings</span>
        </div>
        <div className="flex gap-4 items-center">
          <button className="flex items-center gap-2 bg-[#CBFF00] text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] gap-12">
          
          {/* Settings Nav */}
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-3 text-left px-4 py-3 rounded-sm transition-colors text-xs font-bold uppercase tracking-widest ${activeTab === 'general' ? 'bg-white/5 border border-white/10 text-[#CBFF00]' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <Sliders className="w-4 h-4" />
              General
            </button>
            <button 
              onClick={() => setActiveTab('engine')}
              className={`flex items-center gap-3 text-left px-4 py-3 rounded-sm transition-colors text-xs font-bold uppercase tracking-widest ${activeTab === 'engine' ? 'bg-white/5 border border-white/10 text-[#CBFF00]' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <Cpu className="w-4 h-4" />
              AI Engine
            </button>
            <button 
              onClick={() => setActiveTab('display')}
              className={`flex items-center gap-3 text-left px-4 py-3 rounded-sm transition-colors text-xs font-bold uppercase tracking-widest ${activeTab === 'display' ? 'bg-white/5 border border-white/10 text-[#CBFF00]' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <Monitor className="w-4 h-4" />
              Display
            </button>
            <button 
              onClick={() => setActiveTab('exports')}
              className={`flex items-center gap-3 text-left px-4 py-3 rounded-sm transition-colors text-xs font-bold uppercase tracking-widest ${activeTab === 'exports' ? 'bg-white/5 border border-white/10 text-[#CBFF00]' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <DownloadCloud className="w-4 h-4" />
              Exports
            </button>
            <button 
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-3 text-left px-4 py-3 rounded-sm transition-colors text-xs font-bold uppercase tracking-widest mt-4 ${activeTab === 'billing' ? 'bg-[#CBFF00]/10 border border-[#CBFF00]/30 text-[#CBFF00]' : 'text-[#CBFF00]/70 hover:text-[#CBFF00] hover:bg-[#CBFF00]/5 border border-transparent'}`}
            >
              <CreditCard className="w-4 h-4" />
              Billing
            </button>
            <button 
              onClick={() => setActiveTab('api-keys')}
              className={`flex items-center gap-3 text-left px-4 py-3 rounded-sm transition-colors text-xs font-bold uppercase tracking-widest mt-8 ${activeTab === 'api-keys' ? 'bg-white/5 border border-white/10 text-[#CBFF00]' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <Key className="w-4 h-4" />
              API Keys
            </button>
          </nav>

          {/* Settings Panels */}
          <div className="space-y-12 pb-20">
            
            {/* General Section */}
            {activeTab === 'general' && (
            <section className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-serif italic tracking-tight">Generation Defaults</h2>
                <p className="text-xs text-white/40 mt-1">Configure default parameters for the generation pipeline.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#CBFF00] mb-2">Default Action Count</label>
                  <p className="text-xs text-white/40 mb-3">Set how many variations are generated per series by default.</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[4, 6, 8, 12].map(num => (
                      <button key={num} className={`py-2 border text-sm font-mono transition-all ${num === 8 ? 'bg-[#CBFF00]/10 border-[#CBFF00] text-[#CBFF00]' : 'bg-transparent border-white/10 text-white/60 hover:border-white/30'}`}>
                        {num} Images
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#CBFF00] mb-2">Background Handling</label>
                  <select className="w-full bg-[#111] border border-white/10 text-white p-3 text-sm focus:outline-none focus:border-[#CBFF00]/50 rounded-sm">
                    <option>Enforce Strict Transparency (Recommended)</option>
                    <option>Solid Color Generator</option>
                    <option>Allow Environmental Backgrounds</option>
                  </select>
                </div>
              </div>
            </section>
            )}

            {/* AI Engine Section */}
            {activeTab === 'engine' && (
            <section className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-serif italic tracking-tight">AI Engine Settings</h2>
                <p className="text-xs text-white/40 mt-1">Model configurations and advanced tuning parameters.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#CBFF00] mb-2">Image Model</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-[#CBFF00]/40 bg-[#CBFF00]/5 cursor-pointer rounded-sm">
                      <input type="radio" name="model" defaultChecked className="accent-[#CBFF00]" />
                      <div>
                        <div className="text-sm">gemini-3.1-flash-image-preview</div>
                        <div className="text-[10px] text-[#CBFF00]/60 uppercase tracking-wider mt-0.5">Fast • Recommended for Grids</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-white/10 opacity-50 cursor-not-allowed rounded-sm">
                      <input type="radio" name="model" disabled className="accent-[#CBFF00]" />
                      <div>
                        <div className="text-sm">gemini-2.5-flash-image</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Legacy Engine</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#CBFF00] mb-2">Safety Filters</label>
                  <div className="flex items-center justify-between p-3 border border-white/10 bg-[#111] rounded-sm">
                    <div className="text-sm text-white/80">Block offensive content</div>
                    <div className="w-10 h-5 bg-[#CBFF00] rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 bottom-1 w-3 bg-black rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            )}
            
            {/* Display Section */}
            {activeTab === 'display' && (
            <section className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-serif italic tracking-tight">Interface & Display</h2>
                <p className="text-xs text-white/40 mt-1">Customize your workspace experience.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#CBFF00] mb-2">Theme Preference</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center justify-center p-6 border border-[#CBFF00]/40 bg-[#CBFF00]/5 cursor-pointer rounded-sm">
                      <input type="radio" name="theme" defaultChecked className="hidden" />
                      <div className="text-sm font-medium">Dark Mode</div>
                    </label>
                    <label className="flex items-center justify-center p-6 border border-white/10 opacity-50 cursor-pointer rounded-sm">
                      <input type="radio" name="theme" disabled className="hidden" />
                      <div className="text-sm font-medium">Light Mode (Coming Soon)</div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#CBFF00] mb-2">UI Scale</label>
                  <select className="w-full bg-[#111] border border-white/10 text-white p-3 text-sm focus:outline-none focus:border-[#CBFF00]/50 rounded-sm">
                    <option>Compact</option>
                    <option selected>Standard</option>
                    <option>Large</option>
                  </select>
                </div>
              </div>
            </section>
            )}

            {/* Export Section */}
            {activeTab === 'exports' && (
             <section className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-serif italic tracking-tight">Export Preferences</h2>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#CBFF00] mb-2">Asset Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" defaultChecked className="accent-[#CBFF00]" />
                    <span className="text-sm">PNG (Transparent)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" className="accent-[#CBFF00]" />
                    <span className="text-sm">JPEG (Solid Background)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" className="accent-[#CBFF00]" />
                    <span className="text-sm">WebP</span>
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-xs uppercase tracking-widest text-[#CBFF00] mb-2">Resolution Multiplier</label>
                <select className="w-full bg-[#111] border border-white/10 text-white p-3 text-sm focus:outline-none focus:border-[#CBFF00]/50 rounded-sm">
                  <option>1x (Native - 480px)</option>
                  <option selected>2x (Upscaled - 960px)</option>
                  <option>4x (Max - 1920px)</option>
                </select>
                <p className="text-[10px] text-white/40 mt-2">Upscaling uses AI enhancement when available.</p>
              </div>
            </section>
            )}
            
            {/* Billing Section */}
            {activeTab === 'billing' && (
             <section className="space-y-6">
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif italic tracking-tight">Billing & Credits</h2>
                  <p className="text-xs text-white/40 mt-1">Manage your compute credits and subscription plan.</p>
                </div>
                <div className="bg-[#CBFF00]/10 border border-[#CBFF00]/30 px-3 py-1 text-xs font-mono text-[#CBFF00]">
                  Architect Tier
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-white/10 p-6 bg-white/[0.02] flex flex-col">
                  <div className="text-xs uppercase tracking-widest text-[#CBFF00] mb-4">Compute Resources</div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-serif italic text-white">42</span>
                    <span className="text-sm font-mono text-white/40 mb-1">/ 50 Credits</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-[#CBFF00]" style={{ width: '84%' }}></div>
                  </div>
                  <p className="text-[10px] text-white/40 mt-4">Resets on Jun 1, 2026</p>
                  
                  <button className="mt-8 w-full border border-[#CBFF00]/50 text-[#CBFF00] hover:bg-[#CBFF00] hover:text-black transition-colors py-3 text-xs uppercase tracking-widest font-bold">
                    Buy Compute Credits
                  </button>
                </div>

                <div className="border border-white/10 p-6 bg-white/[0.02] flex flex-col">
                  <div className="text-xs uppercase tracking-widest text-[#CBFF00] mb-4">Payment Method</div>
                  <div className="flex items-center gap-4 bg-[#111] border border-white/10 p-4 mb-4">
                    <div className="w-12 h-8 bg-white/5 rounded flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <div className="text-sm font-mono text-white/80">•••• 4242</div>
                      <div className="text-[10px] text-white/40 uppercase">Expires 12/28</div>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex flex-col gap-2">
                    <button className="flex items-center justify-between w-full p-4 border border-white/10 hover:bg-white/5 transition-colors group">
                      <span className="text-xs font-medium">Invoices & Receipts</span>
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                    </button>
                    <button className="flex items-center justify-between w-full p-4 border border-white/10 hover:bg-white/5 transition-colors group">
                      <span className="text-xs font-medium">Manage Subscription</span>
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
            )}
            
            {/* API Keys Section */}
            {activeTab === 'api-keys' && (
             <section className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-serif italic tracking-tight">API Credentials</h2>
                <p className="text-xs text-white/40 mt-1">Manage integration keys for external services.</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#CBFF00] mb-2">Google Gemini API Key</label>
                <p className="text-xs text-white/40 mb-3">Required for the core Alpha-Core v2 engine.</p>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    value="••••••••••••••••••••••••••••••••" 
                    readOnly
                    className="flex-1 bg-[#111] border border-white/10 text-white p-3 font-mono text-sm focus:outline-none focus:border-[#CBFF00]/50 rounded-sm opacity-50 cursor-not-allowed"
                  />
                  <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 font-bold text-xs uppercase tracking-widest transition-colors rounded-sm">
                    Manage
                  </button>
                </div>
                <p className="text-[10px] text-green-400 mt-2">✓ Key active and verified</p>
              </div>
            </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
