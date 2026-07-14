import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Archive, Download, Loader2, RefreshCw, Upload, ImagePlus, LayoutGrid, Settings, Images, Zap, Cpu } from 'lucide-react';
import { generateCharacterAnchor, generateActionImage, generateGridImage, GenerationResult } from '../services/ai';
import { cropGrid, cropGridCustom, getGridDimensions } from '../lib/imageUtils';
import GridCropper, { CropBox } from './GridCropper';
import LibraryView from './LibraryView';
import SettingsView from './SettingsView';

const SCENARIOS = [
  "Standard Layout",
  "Emoji Pack (Expressions & Memes)",
  "Action Sequence (Combat & Poses)",
  "Daily Life (Casual Activities)",
  "Character Turnaround (Different Angles)"
];

const SERIES_TYPES = ["Sticker", "Mascot", "Illustration"];

type AppState = 'idle' | 'generating_profile' | 'generating_images' | 'generating_grid' | 'aligning_grid' | 'cropping_grid' | 'complete';
type TabState = 'studio' | 'library' | 'settings';

interface GeneratedImage {
  action: string;
  dataUrl: string;
}

export default function GeneratorApp() {
  const [currentTab, setCurrentTab] = useState<TabState>('studio');
  const [prompt, setPrompt] = useState('');
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [seriesType, setSeriesType] = useState(SERIES_TYPES[0]);
  const [mode, setMode] = useState<'Fast' | 'Pro'>('Pro');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [numActions, setNumActions] = useState(4);
  const [appState, setAppState] = useState<AppState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Generation Data
  const [profile, setProfile] = useState<GenerationResult | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [completedImages, setCompletedImages] = useState(0);
  const [gridImageUrl, setGridImageUrl] = useState<string | null>(null);
  const [gridDimensions, setGridDimensions] = useState<{rows: number, cols: number} | null>(null);
  const [history, setHistory] = useState<Array<{
    id: string;
    url: string;
    timestamp: number;
    prompt: string;
    panels?: string[];
  }>>([]);

  const startGeneration = async () => {
    if (!prompt.trim()) {
      setError('Please enter a character or theme idea.');
      return;
    }
    setError(null);
    setAppState('generating_profile');
    setImages([]);
    setProfile(null);
    setCompletedImages(0);

    try {
      if (mode === 'Fast') {
        const dimensions = getGridDimensions(numActions);
        setGridDimensions(dimensions);

        // Step 1: Generate Character Profile
        const generatedProfile = await generateCharacterAnchor(prompt, 1, scenario, referenceImage || undefined);
        setProfile(generatedProfile);
        
        // Step 2: Generate single Grid Image
        setAppState('generating_grid');
        const gridDataUrl = await generateGridImage(generatedProfile.characterAnchor, generatedProfile.styleAnchor, dimensions.rows, dimensions.cols, seriesType);
        
        // Step 3: Switch to Alignment UI
        setGridImageUrl(gridDataUrl);
        setAppState('aligning_grid');
      } else {
        // Step 1: Generate Character Profile
        const generatedProfile = await generateCharacterAnchor(prompt, numActions, scenario, referenceImage || undefined);
        setProfile(generatedProfile);
        setAppState('generating_images');

        const newImages: GeneratedImage[] = [];
        let currentCompleted = 0;
        
        for (const action of generatedProfile.actions) {
          try {
            const dataUrl = await generateActionImage(
              generatedProfile.characterAnchor,
              generatedProfile.styleAnchor,
              action
            );
            
            currentCompleted++;
            setCompletedImages(currentCompleted);
            
            const genImage = { action, dataUrl };
            newImages.push(genImage);
            setImages([...newImages]);
          } catch (err) {
            console.error(`Failed to generate action: ${action}`, err);
          }
        }

        setAppState('complete');
        setHistory(prev => [{
            id: Date.now().toString(),
            url: newImages[0]?.dataUrl || '',
            timestamp: Date.now(),
            prompt: prompt,
            panels: newImages.map(img => img.dataUrl)
        }, ...prev]);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAppState('idle');
    }
  };

  const handleDownloadSingle = (image: GeneratedImage, index: number) => {
    saveAs(image.dataUrl, `series_${index + 1}_${image.action.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`);
  };

  const handleDownloadZip = async () => {
    if (images.length === 0) return;
    const zip = new JSZip();
    
    // Create text info file
    if (profile) {
      const readmeInfo = `Theme Prompt: ${prompt}\n\nCharacter Anchor:\n${profile.characterAnchor}\n\nStyle Anchor:\n${profile.styleAnchor}`;
      zip.file("README.txt", readmeInfo);
    }
    
    images.forEach((img, index) => {
      // dataUrl looks like "data:image/jpeg;base64,...""
      const base64Data = img.dataUrl.split(';base64,').pop();
      if (base64Data) {
        zip.file(`series_${index + 1}_${img.action.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`, base64Data, { base64: true });
      }
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "visual_series.zip");
    } catch (error) {
      console.error("ZIP Generation error:", error);
    }
  };

  const handleRegenerateSingle = async (index: number) => {
    if (!profile) return;
    const originalImage = images[index];
    if (!originalImage || originalImage.isRegenerating) return;

    setImages(prev => prev.map((img, i) => i === index ? { ...img, isRegenerating: true } : img));

    try {
      const newUrl = await generateActionImage(profile.characterAnchor, profile.styleAnchor, originalImage.action);
      setImages(prev => prev.map((img, i) => i === index ? { ...img, isRegenerating: false, dataUrl: newUrl } : img));
    } catch (err) {
      console.error("Failed regeneration", err);
      setImages(prev => prev.map((img, i) => i === index ? { ...img, isRegenerating: false } : img));
    }
  };

  const handleGridCropComplete = async (boxes: CropBox[]) => {
    if (!gridImageUrl || !gridDimensions) return;
    setAppState('cropping_grid');
    try {
       const croppedBase64s = await cropGridCustom(gridImageUrl, boxes, numActions);
       setImages(croppedBase64s.map((dataUrl, idx) => ({ action: `Variation ${idx+1}`, dataUrl })));
       setAppState('complete');
       setHistory(prev => [{
            id: Date.now().toString(),
            url: gridImageUrl,
            timestamp: Date.now(),
            prompt: prompt,
            panels: croppedBase64s
        }, ...prev]);
    } catch(err) {
       console.error("Crop error:", err);
       setError("Failed to crop image grid.");
       setAppState('idle');
    }
  };

  const handleGridCropCancel = () => {
    setAppState('idle');
    setGridImageUrl(null);
  };

  const reset = () => {
    setAppState('idle');
    setImages([]);
    setProfile(null);
    setGridImageUrl(null);
    // Preserving prompt, scenario, reference image on reset to allow quick tweaks
    setCompletedImages(0);
    setError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setReferenceImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-screen bg-[#080808] text-white font-sans overflow-hidden flex border-[12px] border-[#151515] w-full">
      {/* Primary Navigation Mini Sidebar */}
      <nav className="w-16 h-full bg-[#080808] border-r border-white/10 flex flex-col items-center py-6 shrink-0 z-10">
        <div className="w-8 h-8 rounded-full bg-[#CBFF00] flex items-center justify-center text-black font-bold text-xs mb-8 shadow-[0_0_15px_rgba(203,255,0,0.3)]">
          SG
        </div>
        
        <div className="flex-col flex gap-6 mt-4">
          <button 
            onClick={() => setCurrentTab('studio')}
            className={`p-3 rounded-lg transition-colors relative group ${currentTab === 'studio' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <LayoutGrid className="w-5 h-5" />
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest hidden group-hover:block z-50 rounded-sm pointer-events-none whitespace-nowrap">
              Studio
            </div>
          </button>
          <button 
            onClick={() => setCurrentTab('library')}
            className={`p-3 rounded-lg transition-colors relative group ${currentTab === 'library' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <Images className="w-5 h-5" />
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest hidden group-hover:block z-50 rounded-sm pointer-events-none whitespace-nowrap">
              Library
            </div>
          </button>
        </div>
        
        <div className="mt-auto">
          <button 
            onClick={() => setCurrentTab('settings')}
            className={`p-3 rounded-lg transition-colors relative group ${currentTab === 'settings' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" />
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest hidden group-hover:block z-50 rounded-sm pointer-events-none whitespace-nowrap">
              Settings
            </div>
          </button>
        </div>
      </nav>

      {currentTab === 'studio' && (
        <>
          {/* Sidebar: Control & Input */}
          <aside className="w-[320px] md:w-[380px] h-full border-r border-white/10 flex flex-col p-6 bg-[#0c0c0c] shrink-0 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-[11px] uppercase tracking-[0.3em] text-[#CBFF00] font-bold mb-1">Engine: Alpha-Core v2</h1>
          <p className="text-3xl font-serif italic font-light">SeriesGen</p>
        </div>

        <div className="flex-1 space-y-6">
          <section className="bg-white/5 border border-white/10 p-1 flex rounded-sm">
            <button
              onClick={() => setMode('Fast')}
              disabled={appState !== 'idle' && appState !== 'complete'}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs uppercase tracking-widest font-bold transition-all ${mode === 'Fast' ? 'bg-[#CBFF00] text-black shadow-sm' : 'text-white/40 hover:text-white'}`}
            >
              <Zap className="w-3 h-3" />
              Fast
            </button>
            <button
               onClick={() => setMode('Pro')}
               disabled={appState !== 'idle' && appState !== 'complete'}
               className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs uppercase tracking-widest font-bold transition-all ${mode === 'Pro' ? 'bg-[#CBFF00] text-black shadow-sm' : 'text-white/40 hover:text-white'}`}
            >
              <Cpu className="w-3 h-3" />
              Pro
            </button>
          </section>

          <section>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-3">Series Type</label>
            <div className="relative">
              <select 
                value={seriesType}
                onChange={(e) => setSeriesType(e.target.value)}
                disabled={appState !== 'idle' && appState !== 'complete'}
                className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white/80 focus:border-[#CBFF00]/50 outline-none rounded-sm appearance-none cursor-pointer"
              >
                {SERIES_TYPES.map(s => <option key={s} value={s} className="bg-black text-white">{s}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                ▼
              </div>
            </div>
          </section>

          <section>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-3">Scenario / Use Case</label>
            <div className="relative">
              <select 
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                disabled={appState !== 'idle' && appState !== 'complete'}
                className="w-full bg-white/5 border border-white/10 p-3 text-sm text-white/80 focus:border-[#CBFF00]/50 outline-none rounded-sm appearance-none cursor-pointer"
              >
                {SCENARIOS.map(s => <option key={s} value={s} className="bg-black text-white">{s}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                ▼
              </div>
            </div>
          </section>

          <section>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-3">Reference Image (Optional)</label>
            <div className={`border border-white/10 p-1 rounded-sm w-full relative overflow-hidden transition-colors ${referenceImage ? 'bg-[#0a0a0a]' : 'bg-white/5 hover:border-white/30'}`}>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={appState !== 'idle' && appState !== 'complete'}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center justify-center h-20">
                {referenceImage ? (
                  <div className="flex items-center gap-4 px-4 w-full">
                     <div className="w-16 h-16 shrink-0 bg-black rounded-sm border border-white/10 overflow-hidden relative">
                       <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex flex-col flex-1 truncate">
                       <span className="text-xs text-[#CBFF00] font-medium break-words">Image Set</span>
                       <span className="text-[10px] text-white/40 uppercase mt-1">Tap to change</span>
                     </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/40 gap-2">
                    <ImagePlus className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase tracking-widest font-mono">Upload Ref</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-3">Character / Theme Idea</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Cyber-Ronin Panda, neon-mesh streetwear..."
              className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white/80 focus:border-[#CBFF00]/50 focus:outline-none resize-none h-32 rounded-sm"
              disabled={appState !== 'idle' && appState !== 'complete'}
            />
          </section>

          <section>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-3">Layout Count</label>
            <div className="grid grid-cols-3 gap-2">
              {[4, 6, 8, 9, 12, 16].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumActions(num)}
                  disabled={appState !== 'idle' && appState !== 'complete'}
                  className={`px-3 py-2 text-[10px] uppercase font-bold tracking-tighter transition-colors ${
                    numActions === num 
                      ? 'bg-white text-black' 
                      : 'border border-white/20 text-white/60 hover:text-white disabled:hover:text-white/60'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </section>

          {error && (
            <section>
               <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono rounded-sm break-words">
                  [ERR] {error}
               </div>
            </section>
          )}
        </div>

        <div className="mt-auto pt-8">
          <button
            onClick={startGeneration}
            disabled={!prompt.trim() || appState === 'generating_images' || appState === 'generating_profile'}
            className="w-full bg-[#CBFF00] text-black font-black py-4 uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Series
          </button>
        </div>
      </aside>

      {/* Main Viewport: The Series Grid */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-20 border-b border-white/10 flex shrink-0 items-center justify-between px-8 bg-[#0a0a0a]">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-[10px] tracking-[0.4em] opacity-40 uppercase">Project</span>
            <span className="text-sm font-medium tracking-tight truncate max-w-[200px] md:max-w-[300px]">
              {prompt || 'UNTITLED_SERIES'}
            </span>
          </div>
          <div className="flex gap-6 items-center">
            {appState === 'complete' && (
              <button 
                onClick={reset}
                className="text-[10px] uppercase tracking-widest flex items-center gap-2 text-[#CBFF00] border-b border-[#CBFF00]/30 hover:border-[#CBFF00] pb-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                New Sequence
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 p-8 grid gap-4 overflow-y-auto content-start relative">
          {appState === 'aligning_grid' && gridImageUrl && gridDimensions && (
            <div className="absolute inset-0 z-50">
              <GridCropper 
                imageUrl={gridImageUrl}
                rows={gridDimensions.rows}
                cols={gridDimensions.cols}
                expectedCount={numActions}
                onComplete={handleGridCropComplete}
                onCancel={handleGridCropCancel}
              />
            </div>
          )}

          {appState === 'idle' && (
            <div className="h-full min-h-[400px] flex items-center justify-center text-white/20">
              <p className="text-sm uppercase tracking-widest font-mono">Awaiting Input Parameters...</p>
            </div>
          )}

          {(appState !== 'idle' && appState !== 'complete' && appState !== 'aligning_grid') && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-6">
              <Loader2 className="w-12 h-12 animate-spin text-[#CBFF00]" />
              
              <div className="space-y-4 max-w-md w-full text-center">
                {appState === 'generating_profile' && (
                  <>
                    <h3 className="text-xl font-serif italic text-white/80">Architecting the Series...</h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/40">Extracting character anchors and styles.</p>
                  </>
                )}
                {appState === 'generating_grid' && (
                  <>
                    <h3 className="text-xl font-serif italic text-white/80">Rendering High-Speed Grid...</h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/40">Generating multi-layout composition.</p>
                  </>
                )}
                {appState === 'cropping_grid' && (
                  <>
                    <h3 className="text-xl font-serif italic text-white/80">Segmenting Grid...</h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/40">Extracting distinct image assets.</p>
                  </>
                )}
                {appState === 'generating_images' && (
                  <>
                    <h3 className="text-xl font-serif italic text-white/80">Generating Detailed Visuals...</h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/40">Rendering action {completedImages + 1} of {numActions}</p>
                    <div className="w-full h-1 bg-white/10 mt-4 relative">
                      <div 
                        className="h-full bg-[#CBFF00] transition-all duration-300"
                        style={{ width: `${(completedImages / numActions) * 100}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {appState === 'complete' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-7xl mx-auto">
              {profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#111] border border-white/5 p-6 relative">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#CBFF00] mb-2">Character Anchor</h4>
                    <p className="text-sm leading-relaxed text-white/60 italic">{profile.characterAnchor}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#CBFF00] mb-2">Style Baseline</h4>
                    <p className="text-sm leading-relaxed text-white/60 italic">{profile.styleAnchor}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="group relative bg-[#111] border border-white/5 p-2 flex flex-col items-center justify-center">
                    <div className="w-full aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] mb-2 flex items-center justify-center border border-white/10 relative overflow-hidden">
                      {img.isRegenerating ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                          <Loader2 className="w-8 h-8 animate-spin text-[#CBFF00]" />
                        </div>
                      ) : null}
                      <img 
                        src={img.dataUrl} 
                        alt={img.action} 
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${img.isRegenerating ? 'opacity-20 grayscale' : ''}`}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 z-30">
                        <button 
                          onClick={() => handleDownloadSingle(img, idx)}
                          className="bg-black/50 backdrop-blur border border-white/10 text-white p-2 hover:text-[#CBFF00] transition-colors"
                          title="Download Image"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {mode === 'Pro' && (
                          <button 
                            onClick={() => handleRegenerateSingle(idx)}
                            disabled={img.isRegenerating}
                            className="bg-black/50 backdrop-blur border border-white/10 text-white p-2 hover:text-[#CBFF00] transition-colors"
                            title="Regenerate this image"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="w-full flex justify-between items-end opacity-40 group-hover:opacity-100 px-1 transition-opacity">
                      <span className="text-[8px] font-mono uppercase truncate max-w-[80%] pr-2" title={img.action}>{img.action}</span>
                      <span className="text-[8px] font-mono text-[#CBFF00]">#{String(idx + 1).padStart(3, '0')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {appState === 'complete' && (
          <footer className="h-24 shrink-0 bg-white text-black flex items-center justify-between px-6 sm:px-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline-block">Export Protocol</span>
              <span className="text-[10px] uppercase tracking-widest sm:opacity-60 font-bold sm:font-normal">{images.length} Assets Compiled</span>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleDownloadZip}
                className="bg-black text-white px-6 sm:px-8 py-3 flex items-center gap-2 hover:bg-[#222] transition-colors"
              >
                <Archive className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Batch Export (.zip)</span>
              </button>
            </div>
          </footer>
        )}
          </main>
        </>
      )}

      {currentTab === 'library' && (
        <LibraryView history={history} />
      )}

      {currentTab === 'settings' && (
        <SettingsView />
      )}
    </div>
  );
}
