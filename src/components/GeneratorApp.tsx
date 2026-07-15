import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Archive, Download, Loader2, RefreshCw, Upload, ImagePlus, LayoutGrid, Settings, Images, Zap, Cpu, SlidersHorizontal, ChevronDown, ChevronUp, Wand2, Eraser, Maximize, Menu, X, Lightbulb, ChevronRight, Sun, Moon } from 'lucide-react';
import { generateCharacterAnchor, generateActionImage, generateGridImage, GenerationResult } from '../services/ai';
import { cropGrid, cropGridCustom, getGridDimensions } from '../lib/imageUtils';
import GridCropper, { CropBox } from './GridCropper';
import LibraryView from './LibraryView';
import SettingsView from './SettingsView';

const SCENARIOS = [
  { id: 'standard', label: 'Standard Layout', thumb: 'https://placehold.co/400x300/111/CBFF00?text=Grid', category: 'Basic', description: 'Standard grid layout for general use cases.' },
  { id: 'emoji', label: 'Emoji Pack', thumb: 'https://placehold.co/400x300/111/CBFF00?text=Emotes', category: 'Social', description: 'Varied facial expressions and emotions.' },
  { id: 'action', label: 'Action Sequence', thumb: 'https://placehold.co/400x300/111/CBFF00?text=Action', category: 'Dynamic', description: 'Dynamic combat and movement poses.' },
  { id: 'turnaround', label: 'Turnaround', thumb: 'https://placehold.co/400x300/111/CBFF00?text=360', category: 'Production', description: '360 degree character views for modeling.' },
  { id: 'dailylife', label: 'Daily Life', thumb: 'https://placehold.co/400x300/111/CBFF00?text=Daily+Life', category: 'Casual', description: 'Characters performing everyday activities.' },
  { id: 'fantasy', label: 'Fantasy RPG', thumb: 'https://placehold.co/400x300/111/CBFF00?text=Fantasy', category: 'Gaming', description: 'Magic casting, sword fighting, and adventuring.' },
];

const SERIES_TYPES = [
  { id: 'sticker', label: 'Sticker Pack', thumb: 'https://placehold.co/400x300/111/CBFF00?text=Sticker', category: '2D & Vector', description: 'Clean edges, white borders, perfect for messaging apps.' },
  { id: 'mascot', label: 'Mascot Design', thumb: 'https://placehold.co/400x300/111/CBFF00?text=Mascot', category: '3D & Render', description: 'Highly detailed 3D characters with expressive features.' },
  { id: 'illustration', label: 'Illustration', thumb: 'https://placehold.co/400x300/111/CBFF00?text=Scene', category: '2D & Vector', description: 'Richly detailed scenes with background context.' },
  { id: 'concept', label: 'Concept Art', thumb: 'https://placehold.co/400x300/111/CBFF00?text=Concept', category: 'Drafts', description: 'Rough sketches and detailed character explorations.' },
  { id: 'pixel', label: 'Pixel Art', thumb: 'https://placehold.co/400x300/111/CBFF00?text=Pixel', category: 'Retro', description: '8-bit and 16-bit retro gaming aesthetics.' },
  { id: 'anime', label: 'Anime Style', thumb: 'https://placehold.co/400x300/111/CBFF00?text=Anime', category: '2D & Vector', description: 'Japanese animation style shading and line art.' },
];
const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "3:4", "4:3"];

const PRESETS = [
  { label: "Cyberpunk Samurai", prompt: "A highly detailed cyberpunk samurai with neon katana, cinematic lighting, 8k" },
  { label: "Cute 3D Mascot", prompt: "A cute 3D fluffy monster mascot, Pixar style, soft lighting, vibrant colors" },
  { label: "Streetwear Emoji", prompt: "A streetwise character doing hip-hop poses, cel shaded anime style, vivid colors" }
];

type AppState = 'idle' | 'in_queue' | 'generating_profile' | 'generating_images' | 'generating_grid' | 'aligning_grid' | 'cropping_grid' | 'complete';
type TabState = 'studio' | 'library' | 'settings';

interface GeneratedImage {
  action: string;
  dataUrl: string;
  isRegenerating?: boolean;
}

export default function GeneratorApp() {
  const [currentTab, setCurrentTab] = useState<TabState>('studio');
  const [prompt, setPrompt] = useState('');
  const [scenario, setScenario] = useState(SCENARIOS[0].id);
  const [seriesType, setSeriesType] = useState(SERIES_TYPES[0].id);
  const [mode, setMode] = useState<'Fast' | 'Pro'>('Pro');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [numActions, setNumActions] = useState(4);
  const [appState, setAppState] = useState<AppState>('idle');
  
  // Advanced Controls
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [cfgScale, setCfgScale] = useState(7.5);
  const [steps, setSteps] = useState(30);
  const [seed, setSeed] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  
  // UX State
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [queueState, setQueueState] = useState<{position: number, eta: number} | null>(null);
  const [activePicker, setActivePicker] = useState<'series' | 'scenario' | null>(null);
  const [activePickerCategory, setActivePickerCategory] = useState<string>('All');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  // Theme effect
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const currentSeries = SERIES_TYPES.find(s => s.id === seriesType);
  const currentScenario = SCENARIOS.find(s => s.id === scenario);

  // Get unique categories for current picker
  const pickerCategories = React.useMemo(() => {
    if (!activePicker) return ['All'];
    const items = activePicker === 'series' ? SERIES_TYPES : SCENARIOS;
    const cats = Array.from(new Set(items.map(item => item.category)));
    return ['All', ...cats];
  }, [activePicker]);

  // Reset category when picker changes
  useEffect(() => {
    setActivePickerCategory('All');
  }, [activePicker]);

  const showToast = (message: string, type: 'error' | 'success' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
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
      showToast('Please enter a character or theme idea.', 'error');
      return;
    }
    
    setImages([]);
    setProfile(null);
    setCompletedImages(0);

    // Simulate Queue
    setAppState('in_queue');
    setQueueState({ position: Math.floor(Math.random() * 5) + 2, eta: 8 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    setQueueState(null);

    setAppState('generating_profile');

    try {
      // Pass advanced params to API (Assuming backend supports them or ignoring for now visually)
      const advancedParams = {
        cfgScale, steps, seed, negativePrompt, aspectRatio
      };
      console.log("Using advanced params:", advancedParams);

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
        showToast('Generation complete!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
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
      showToast('Batch export successful', 'success');
    } catch (error) {
      console.error("ZIP Generation error:", error);
      showToast('Failed to create ZIP file', 'error');
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
      showToast('Image regenerated', 'success');
    } catch (err) {
      console.error("Failed regeneration", err);
      setImages(prev => prev.map((img, i) => i === index ? { ...img, isRegenerating: false } : img));
      showToast('Regeneration failed', 'error');
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
        showToast('Grid cropped successfully', 'success');
    } catch(err) {
       console.error("Crop error:", err);
       showToast("Failed to crop image grid.", 'error');
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
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setReferenceImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-[#080808] text-gray-900 dark:text-white font-sans overflow-hidden flex border-[12px] border-[#151515] w-full">
      {/* Primary Navigation Mini Sidebar */}
      <nav className="w-16 h-full bg-gray-50 dark:bg-[#080808] border-r border-black/10 dark:border-white/10 flex flex-col items-center py-6 shrink-0 z-10">
        <div className="w-8 h-8 rounded-full bg-[#CBFF00] flex items-center justify-center text-black font-bold text-xs mb-8 shadow-[0_0_15px_rgba(203,255,0,0.3)]">
          SG
        </div>
        
        <div className="flex-col flex gap-6 mt-4">
          <button 
            onClick={() => setCurrentTab('studio')}
            className={`p-3 rounded-lg transition-colors relative group ${currentTab === 'studio' ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:text-white'}`}
          >
            <LayoutGrid className="w-5 h-5" />
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest hidden group-hover:block z-50 rounded-sm pointer-events-none whitespace-nowrap">
              Studio
            </div>
          </button>
          <button 
            onClick={() => setCurrentTab('library')}
            className={`p-3 rounded-lg transition-colors relative group ${currentTab === 'library' ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:text-white'}`}
          >
            <Images className="w-5 h-5" />
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest hidden group-hover:block z-50 rounded-sm pointer-events-none whitespace-nowrap">
              Library
            </div>
          </button>
        </div>
        
        <div className="mt-auto flex flex-col gap-4">
          <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-lg transition-colors relative group text-gray-500 dark:text-white/40 hover:text-gray-900 dark:text-white"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest hidden group-hover:block z-50 rounded-sm pointer-events-none whitespace-nowrap">
              Theme
            </div>
          </button>
          
          <button 
            onClick={() => setCurrentTab('settings')}
            className={`p-3 rounded-lg transition-colors relative group ${currentTab === 'settings' ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:text-white'}`}
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
          <aside className={`w-[320px] md:w-[380px] h-full border-r border-black/10 dark:border-white/10 flex flex-col p-6 bg-gray-100 dark:bg-[#0c0c0c] shrink-0 overflow-y-auto fixed md:relative z-40 transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} left-16 md:left-auto`}>
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-[11px] uppercase tracking-[0.3em] text-lime-600 dark:text-[#CBFF00] font-bold mb-1">Engine: Alpha-Core v2</h1>
            <p className="text-3xl font-serif italic font-light">SeriesGen</p>
          </div>
          <button 
            className="md:hidden text-gray-600 dark:text-white/50 hover:text-gray-900 dark:text-white"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6">
          <section className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-1 flex rounded-sm">
            <button
              onClick={() => setMode('Fast')}
              disabled={appState !== 'idle' && appState !== 'complete'}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs uppercase tracking-widest font-bold transition-all ${mode === 'Fast' ? 'bg-[#CBFF00] text-black shadow-sm' : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:text-white'}`}
            >
              <Zap className="w-3 h-3" />
              Fast
            </button>
            <button
               onClick={() => setMode('Pro')}
               disabled={appState !== 'idle' && appState !== 'complete'}
               className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs uppercase tracking-widest font-bold transition-all ${mode === 'Pro' ? 'bg-[#CBFF00] text-black shadow-sm' : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:text-white'}`}
            >
              <Cpu className="w-3 h-3" />
              Pro
            </button>
          </section>

          <section>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-3">Series Type</label>
            <button
              onClick={() => setActivePicker('series')}
              disabled={appState !== 'idle' && appState !== 'complete'}
              className="w-full flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm hover:border-[#CBFF00]/50 transition-colors text-left"
            >
               <div className="w-12 h-12 bg-black rounded-sm overflow-hidden shrink-0 border border-black/5 dark:border-white/5 relative">
                  <img src={currentSeries?.thumb} className="w-full h-full object-cover opacity-80" />
               </div>
               <div className="flex-1 overflow-hidden">
                  <div className="text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-widest mb-1 truncate">{currentSeries?.category}</div>
                  <div className="text-sm font-bold text-gray-800 dark:text-white/90 truncate">{currentSeries?.label}</div>
               </div>
               <ChevronRight className="w-4 h-4 text-gray-500 dark:text-white/40 shrink-0" />
            </button>
          </section>

          <section>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-3">Scenario / Use Case</label>
            <button
              onClick={() => setActivePicker('scenario')}
              disabled={appState !== 'idle' && appState !== 'complete'}
              className="w-full flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm hover:border-[#CBFF00]/50 transition-colors text-left"
            >
               <div className="w-12 h-12 bg-black rounded-sm overflow-hidden shrink-0 border border-black/5 dark:border-white/5 relative">
                  <img src={currentScenario?.thumb} className="w-full h-full object-cover opacity-80" />
               </div>
               <div className="flex-1 overflow-hidden">
                  <div className="text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-widest mb-1 truncate">{currentScenario?.category}</div>
                  <div className="text-sm font-bold text-gray-800 dark:text-white/90 truncate">{currentScenario?.label}</div>
               </div>
               <ChevronRight className="w-4 h-4 text-gray-500 dark:text-white/40 shrink-0" />
            </button>
          </section>

          <section>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-3">Reference Image (Optional)</label>
            <div className={`border border-black/10 dark:border-white/10 p-1 rounded-sm w-full relative overflow-hidden transition-colors ${referenceImage ? 'bg-white dark:bg-[#0a0a0a]' : 'bg-black/5 dark:bg-white/5 hover:border-black/30 dark:border-white/30'}`}>
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
                     <div className="w-16 h-16 shrink-0 bg-black rounded-sm border border-black/10 dark:border-white/10 overflow-hidden relative">
                       <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex flex-col flex-1 truncate">
                       <span className="text-xs text-lime-600 dark:text-[#CBFF00] font-medium break-words">Image Set</span>
                       <span className="text-[10px] text-gray-500 dark:text-white/40 uppercase mt-1">Tap to change</span>
                     </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-white/40 gap-2">
                    <ImagePlus className="w-5 h-5 mb-1" />
                    <span className="text-[10px] uppercase tracking-widest font-mono">Upload Ref</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-3">Character / Theme Idea</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Cyber-Ronin Panda, neon-mesh streetwear..."
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 text-sm text-gray-700 dark:text-white/80 focus:border-[#CBFF00]/50 focus:outline-none resize-none h-32 rounded-sm"
              disabled={appState !== 'idle' && appState !== 'complete'}
            />
          </section>

          <section>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-3">Layout Count</label>
            <div className="grid grid-cols-3 gap-2">
              {[4, 6, 8, 9, 12, 16].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumActions(num)}
                  disabled={appState !== 'idle' && appState !== 'complete'}
                  className={`px-3 py-2 text-[10px] uppercase font-bold tracking-tighter transition-colors ${
                    numActions === num 
                      ? 'bg-white text-black' 
                      : 'border border-black/20 dark:border-white/20 text-white/60 hover:text-gray-900 dark:text-white disabled:hover:text-white/60'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </section>

          {/* Advanced Controls Accordion */}
          <section className="border-t border-black/10 dark:border-white/10 pt-6">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center justify-between w-full text-left group"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-500 dark:text-white/40 group-hover:text-lime-600 dark:hover:text-[#CBFF00] transition-colors" />
                <span className="text-[10px] uppercase tracking-widest text-white/60 group-hover:text-gray-900 dark:text-white transition-colors">Advanced Controls</span>
              </div>
              {isAdvancedOpen ? <ChevronUp className="w-4 h-4 text-gray-500 dark:text-white/40" /> : <ChevronDown className="w-4 h-4 text-gray-500 dark:text-white/40" />}
            </button>
            
            {isAdvancedOpen && (
              <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40">CFG Scale</label>
                    <span className="text-[10px] font-mono text-lime-600 dark:text-[#CBFF00]">{cfgScale}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="20" step="0.5"
                    value={cfgScale}
                    onChange={(e) => setCfgScale(parseFloat(e.target.value))}
                    disabled={appState !== 'idle' && appState !== 'complete'}
                    className="w-full accent-[#CBFF00] bg-black/10 dark:bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-1 text-[8px] text-white/30 uppercase">
                    <span>Creative</span>
                    <span>Strict</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40">Sampling Steps</label>
                    <span className="text-[10px] font-mono text-lime-600 dark:text-[#CBFF00]">{steps}</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" max="100" step="5"
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value))}
                    disabled={appState !== 'idle' && appState !== 'complete'}
                    className="w-full accent-[#CBFF00] bg-black/10 dark:bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-1 text-[8px] text-white/30 uppercase">
                    <span>Fast</span>
                    <span>High Quality</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">Aspect Ratio</label>
                  <div className="grid grid-cols-5 gap-1">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        disabled={appState !== 'idle' && appState !== 'complete'}
                        className={`py-1.5 text-[9px] font-mono transition-colors border ${
                          aspectRatio === ratio
                            ? 'bg-black/10 dark:bg-white/10 border-black/30 dark:border-white/30 text-gray-900 dark:text-white'
                            : 'border-black/5 dark:border-white/5 text-gray-500 dark:text-white/40 hover:bg-black/5 dark:bg-white/5'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">Seed (Optional)</label>
                  <input
                    type="number"
                    placeholder="Random"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    disabled={appState !== 'idle' && appState !== 'complete'}
                    className="w-full bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-2 text-xs text-gray-900 dark:text-white focus:border-[#CBFF00]/50 outline-none rounded-sm font-mono placeholder:text-gray-400 dark:text-white/20"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">Negative Prompt</label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="ugly, blurry, low res..."
                    className="w-full bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-2 text-xs text-gray-900 dark:text-white focus:border-[#CBFF00]/50 outline-none rounded-sm font-mono h-16 resize-none placeholder:text-gray-400 dark:text-white/20"
                    disabled={appState !== 'idle' && appState !== 'complete'}
                  />
                </div>

              </div>
            )}
          </section>
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
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        <header className="h-14 md:h-20 border-b border-black/10 dark:border-white/10 flex shrink-0 items-center justify-between px-4 md:px-8 bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              className="md:hidden text-white/60 hover:text-gray-900 dark:text-white transition-colors"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="hidden sm:inline-block text-[10px] tracking-[0.4em] opacity-40 uppercase">Project</span>
            <span className="text-sm font-medium tracking-tight truncate max-w-[150px] md:max-w-[300px]">
              {prompt || 'UNTITLED_SERIES'}
            </span>
          </div>
          <div className="flex gap-6 items-center">
            {appState === 'complete' && (
              <button 
                onClick={reset}
                className="text-[10px] uppercase tracking-widest flex items-center gap-2 text-lime-600 dark:text-[#CBFF00] border-b border-[#CBFF00]/30 hover:border-[#CBFF00] pb-1 transition-colors"
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
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 dark:text-white/20 animate-in fade-in duration-700">
              <ImagePlus className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-sm uppercase tracking-widest font-mono mb-8">Awaiting Input Parameters...</p>
              
              {/* Onboarding Tooltip / Presets */}
              <div className="mt-4 flex flex-col items-center max-w-lg w-full px-4">
                 <div className="flex items-center gap-2 text-xs font-mono text-lime-600 dark:text-[#CBFF00] mb-6">
                    <Lightbulb className="w-4 h-4" />
                    <span>Start with a Template</span>
                 </div>
                 <div className="flex flex-wrap justify-center gap-3">
                    {PRESETS.map(preset => (
                       <button 
                          key={preset.label}
                          onClick={() => setPrompt(preset.prompt)}
                          className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-sm hover:border-[#CBFF00]/50 hover:bg-[#CBFF00]/10 hover:text-lime-600 dark:hover:text-[#CBFF00] text-xs transition-colors bg-black/5 dark:bg-white/5"
                       >
                          {preset.label}
                       </button>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {(appState !== 'idle' && appState !== 'complete' && appState !== 'aligning_grid') && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-6">
              
              {appState === 'in_queue' && queueState ? (
                <div className="space-y-4 max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-500">
                   <div className="w-16 h-16 rounded-full border-2 border-black/10 dark:border-white/10 border-t-[#CBFF00] animate-spin mx-auto mb-6"></div>
                   <h3 className="text-2xl font-serif italic text-gray-900 dark:text-white">Queue Position: {queueState.position}</h3>
                   <div className="text-[10px] uppercase font-mono tracking-widest text-lime-600 dark:text-[#CBFF00] bg-[#CBFF00]/10 inline-flex items-center px-4 py-2 border border-[#CBFF00]/20">
                      <span className="w-2 h-2 rounded-full bg-[#CBFF00] animate-pulse mr-2"></span>
                      ETA: {queueState.eta} seconds
                   </div>
                </div>
              ) : (
                <div className="w-full max-w-3xl flex flex-col items-center">
                  <Loader2 className="w-12 h-12 animate-spin text-lime-600 dark:text-[#CBFF00] mb-6" />
                  
                  <div className="space-y-4 w-full text-center">
                    {appState === 'generating_profile' && (
                      <>
                        <h3 className="text-xl font-serif italic text-gray-700 dark:text-white/80">Architecting the Series...</h3>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40">Extracting character anchors and styles.</p>
                        {/* Progressive Rendering Placeholder */}
                        <div className="w-full max-w-lg mx-auto bg-gray-100 dark:bg-[#111] aspect-video mt-8 rounded-sm animate-pulse flex items-center justify-center border border-black/5 dark:border-white/5 relative overflow-hidden blur-md">
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CBFF00]/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                        </div>
                      </>
                    )}
                    {appState === 'generating_grid' && (
                      <>
                        <h3 className="text-xl font-serif italic text-gray-700 dark:text-white/80">Rendering High-Speed Grid...</h3>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40">Generating multi-layout composition.</p>
                        {/* Progressive Rendering Placeholder */}
                        <div className="w-full max-w-lg mx-auto bg-gray-100 dark:bg-[#111] aspect-square mt-8 rounded-sm flex items-center justify-center border border-black/5 dark:border-white/5 relative overflow-hidden">
                           <div className="absolute inset-0 bg-[url('https://placehold.co/400x400/1a1a1a/333333?text=Composing...')] bg-cover opacity-50 blur-lg scale-110 animate-[pulse_4s_infinite]"></div>
                        </div>
                      </>
                    )}
                    {appState === 'cropping_grid' && (
                      <>
                        <h3 className="text-xl font-serif italic text-gray-700 dark:text-white/80">Segmenting Grid...</h3>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40">Extracting distinct image assets.</p>
                      </>
                    )}
                    {appState === 'generating_images' && (
                      <>
                        <h3 className="text-xl font-serif italic text-gray-700 dark:text-white/80">Generating Detailed Visuals...</h3>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/40">Rendering action {completedImages + 1} of {numActions}</p>
                        
                        <div className="w-full max-w-lg mx-auto mt-8 relative">
                          <div className="w-full bg-gray-100 dark:bg-[#111] aspect-square rounded-sm border border-black/5 dark:border-white/5 relative overflow-hidden mb-4">
                             <div className="absolute inset-0 bg-[url('https://placehold.co/400x400/1a1a1a/CBFF00?text=Rendering...')] bg-cover opacity-30 blur-xl scale-110"></div>
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                                <span className="text-xs font-mono text-lime-600 dark:text-[#CBFF00]">Pass {completedImages + 1} // Detail Enhancement</span>
                             </div>
                          </div>
                          <div className="w-full h-1 bg-black/10 dark:bg-white/10 relative">
                            <div 
                              className="h-full bg-[#CBFF00] transition-all duration-300"
                              style={{ width: `${(completedImages / numActions) * 100}%` }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {appState === 'complete' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-7xl mx-auto">
              {profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-100 dark:bg-[#111] border border-black/5 dark:border-white/5 p-6 relative">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-lime-600 dark:text-[#CBFF00] mb-2">Character Anchor</h4>
                    <p className="text-sm leading-relaxed text-white/60 italic">{profile.characterAnchor}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-lime-600 dark:text-[#CBFF00] mb-2">Style Baseline</h4>
                    <p className="text-sm leading-relaxed text-white/60 italic">{profile.styleAnchor}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="group relative bg-gray-100 dark:bg-[#111] border border-black/5 dark:border-white/5 p-2 flex flex-col items-center justify-center">
                    <div className="w-full aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] mb-2 flex items-center justify-center border border-black/10 dark:border-white/10 relative overflow-hidden">
                      {img.isRegenerating ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 z-20">
                          <Loader2 className="w-8 h-8 animate-spin text-lime-600 dark:text-[#CBFF00]" />
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
                          className="bg-black/50 backdrop-blur border border-black/10 dark:border-white/10 text-gray-900 dark:text-white p-2 hover:text-lime-600 dark:hover:text-[#CBFF00] transition-colors"
                          title="Download Image"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => showToast('Background removed successfully.', 'success')}
                          className="bg-black/50 backdrop-blur border border-black/10 dark:border-white/10 text-gray-900 dark:text-white p-2 hover:text-lime-600 dark:hover:text-[#CBFF00] transition-colors"
                          title="Remove Background (Alpha-Core)"
                        >
                          <Eraser className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => showToast('Inpainting canvas initialized.', 'success')}
                          className="bg-black/50 backdrop-blur border border-black/10 dark:border-white/10 text-gray-900 dark:text-white p-2 hover:text-lime-600 dark:hover:text-[#CBFF00] transition-colors"
                          title="Inpaint Selection"
                        >
                          <Wand2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => showToast('Image outpainted to 16:9 aspect.', 'success')}
                          className="bg-black/50 backdrop-blur border border-black/10 dark:border-white/10 text-gray-900 dark:text-white p-2 hover:text-lime-600 dark:hover:text-[#CBFF00] transition-colors"
                          title="Generative Expand (Outpaint)"
                        >
                          <Maximize className="w-4 h-4" />
                        </button>
                        {mode === 'Pro' && (
                          <button 
                            onClick={() => handleRegenerateSingle(idx)}
                            disabled={img.isRegenerating}
                            className="bg-black/50 backdrop-blur border border-black/10 dark:border-white/10 text-gray-900 dark:text-white p-2 hover:text-lime-600 dark:hover:text-[#CBFF00] transition-colors"
                            title="Regenerate this image"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="w-full flex justify-between items-end opacity-40 group-hover:opacity-100 px-1 transition-opacity">
                      <span className="text-[8px] font-mono uppercase truncate max-w-[80%] pr-2" title={img.action}>{img.action}</span>
                      <span className="text-[8px] font-mono text-lime-600 dark:text-[#CBFF00]">#{String(idx + 1).padStart(3, '0')}</span>
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
                className="bg-black text-gray-900 dark:text-white px-6 sm:px-8 py-3 flex items-center gap-2 hover:bg-gray-200 dark:bg-[#222] transition-colors"
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
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-4 py-3 rounded-sm shadow-xl border text-xs font-mono tracking-wide ${
            toast.type === 'error' 
              ? 'bg-red-500/10 border-red-500/50 text-red-400' 
              : 'bg-[#CBFF00]/10 border-[#CBFF00]/50 text-lime-600 dark:text-[#CBFF00]'
          }`}>
            {toast.type === 'error' ? '[ERROR] ' : '[SUCCESS] '}
            {toast.message}
          </div>
        </div>
      )}

      {/* Picker Modal */}
      {activePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-200">
           <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setActivePicker(null)}></div>
           <div className="relative w-full max-w-6xl h-full max-h-[800px] bg-gray-100 dark:bg-[#0c0c0c] border border-black/10 dark:border-white/10 rounded-sm flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="h-16 md:h-20 border-b border-black/10 dark:border-white/10 flex items-center justify-between px-6 md:px-8 shrink-0 bg-white dark:bg-[#0a0a0a]">
                 <div>
                    <h2 className="text-xl font-serif italic text-gray-800 dark:text-white/90">
                       {activePicker === 'series' ? 'Style Library' : 'Scenario Library'}
                    </h2>
                    <p className="text-[10px] font-mono text-lime-600 dark:text-[#CBFF00] uppercase tracking-widest mt-1">Select your visual approach</p>
                 </div>
                 <button onClick={() => setActivePicker(null)} className="text-gray-500 dark:text-white/40 hover:text-gray-900 dark:text-white transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Category Pills */}
              <div className="border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/50 p-4 px-6 md:px-8 flex overflow-x-auto gap-2 scrollbar-hide">
                 {pickerCategories.map(cat => (
                    <button
                       key={cat}
                       onClick={() => setActivePickerCategory(cat)}
                       className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-colors border ${
                          activePickerCategory === cat
                             ? 'bg-[#CBFF00]/20 border-[#CBFF00]/50 text-lime-600 dark:text-[#CBFF00]'
                             : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-600 dark:text-white/50 hover:text-gray-900 dark:text-white hover:border-black/30 dark:border-white/30'
                       }`}
                    >
                       {cat}
                    </button>
                 ))}
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 dark:bg-[#080808]">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(activePicker === 'series' ? SERIES_TYPES : SCENARIOS)
                       .filter(item => activePickerCategory === 'All' || item.category === activePickerCategory)
                       .map(item => (
                       <button
                          key={item.id}
                          onClick={() => {
                             if (activePicker === 'series') setSeriesType(item.id);
                             if (activePicker === 'scenario') setScenario(item.id);
                             setActivePicker(null);
                          }}
                          className={`group text-left border rounded-sm overflow-hidden transition-all duration-300 flex flex-col h-full bg-gray-100 dark:bg-[#111] hover:-translate-y-1 hover:shadow-xl ${
                             (activePicker === 'series' ? seriesType : scenario) === item.id
                                ? 'border-[#CBFF00] shadow-[0_0_15px_rgba(203,255,0,0.15)] ring-1 ring-[#CBFF00]'
                                : 'border-black/10 dark:border-white/10 hover:border-black/30 dark:border-white/30'
                          }`}
                       >
                          <div className="w-full aspect-[4/3] bg-black relative overflow-hidden shrink-0">
                             <img 
                                src={item.thumb} 
                                alt={item.label} 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                             />
                             <div className="absolute top-3 left-3 px-3 py-1 bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-black/10 dark:border-white/10 text-[9px] uppercase tracking-widest text-gray-800 dark:text-white/90 font-bold">
                                {item.category}
                             </div>
                             {(activePicker === 'series' ? seriesType : scenario) === item.id && (
                                <div className="absolute top-3 right-3 w-6 h-6 bg-[#CBFF00] rounded-full flex items-center justify-center text-black shadow-lg">
                                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                             )}
                          </div>
                          <div className="p-5 flex flex-col flex-1 border-t border-black/5 dark:border-white/5">
                             <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 font-serif italic">{item.label}</h3>
                             <p className="text-xs text-gray-600 dark:text-white/50 leading-relaxed font-light">{item.description}</p>
                          </div>
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
