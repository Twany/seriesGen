import React, { useState, useMemo } from 'react';
import { Download, MoreHorizontal, Search, Trash2, ArrowLeft, Folder, FolderOpen, Image as ImageIcon, ChevronRight, LayoutGrid, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { downloadImage, downloadAllImages } from '../lib/imageUtils';

const generateMockImages = (prefix: string, count: number, folder: string) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-img-${i}`,
    url: `https://placehold.co/400x${300 + Math.floor(Math.random() * 300)}/1a1a1a/CBFF00?text=${prefix}_${i + 1}`, // Random height for masonry
    action: `Pose ${i + 1}`,
    folder: folder,
    prompt: `A highly detailed ${prefix} character in pose ${i + 1}, cinematic lighting, 8k resolution...`
  }));
};

const MOCK_IMAGES = [
  ...generateMockImages('Panda', 6, 'Concept Art'),
  ...generateMockImages('Emoji', 8, 'UI Assets'),
  ...generateMockImages('Mecha', 5, 'Spritesheets'),
  ...generateMockImages('Pixel', 7, 'Spritesheets'),
  ...generateMockImages('Samurai', 8, 'Concept Art'),
];

export interface HistoryItem {
  id: string;
  url: string;
  timestamp: number;
  prompt: string;
  panels?: string[];
}

interface LibraryViewProps {
  history: HistoryItem[];
}

export default function LibraryView({ history }: LibraryViewProps) {
  const [selectedFolder, setSelectedFolder] = useState<string>('All Assets');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(3); // 1 to 5

  // Directories
  const directories = ['All Assets', 'Concept Art', 'Spritesheets', 'UI Assets', 'Uncategorized'];

  // Map real history to our flat architecture
  const realImages = history.flatMap((h) => {
    const images = (h.panels && h.panels.length > 0) ? h.panels.map((p, idx) => ({
      id: `${h.id}-img-${idx}`,
      url: p,
      action: `Action ${idx + 1}`,
      folder: 'Uncategorized',
      prompt: h.prompt
    })) : [{ 
      id: `${h.id}-img-0`, 
      url: h.url, 
      action: 'Original Grid',
      folder: 'Uncategorized',
      prompt: h.prompt
    }];
    return images;
  });

  const allImages = [...realImages, ...MOCK_IMAGES];

  const filteredImages = allImages.filter(img => {
    const matchesFolder = selectedFolder === 'All Assets' || img.folder === selectedFolder;
    const matchesSearch = img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || img.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleReusePrompt = (prompt: string) => {
    // In a real app we'd dispatch an event or pass a prop to handle this
    console.log("Reusing prompt:", prompt);
  };

  const getZoomClasses = () => {
    switch(zoomLevel) {
      case 1: return "columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-8"; // Tiny
      case 2: return "columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6";
      case 3: return "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5"; // Default
      case 4: return "columns-1 sm:columns-2 lg:columns-2 xl:columns-3";
      case 5: return "columns-1 md:columns-2"; // Huge
      default: return "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5";
    }
  };

  return (
    <div className="flex-1 flex h-full bg-gray-50 dark:bg-[#080808] relative overflow-hidden">
      
      {/* Sidebar Directory Tree */}
      <aside className="w-64 shrink-0 border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex flex-col hidden md:flex">
        <div className="h-20 border-b border-black/10 dark:border-white/10 flex items-center px-6">
          <span className="text-[10px] tracking-[0.2em] font-mono text-lime-600 dark:text-[#CBFF00] uppercase pt-1">
            Library_Tree
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1">
            {directories.map(dir => (
              <button
                key={dir}
                onClick={() => setSelectedFolder(dir)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm transition-all text-xs outline-none ${
                  selectedFolder === dir 
                  ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white font-medium shadow-[inset_2px_0_0_#CBFF00]' 
                  : 'text-gray-600 dark:text-white/50 hover:bg-black/5 dark:bg-white/5 hover:text-gray-800 dark:text-white/90'
                }`}
              >
                {selectedFolder === dir ? <FolderOpen className="w-4 h-4 text-lime-600 dark:text-[#CBFF00]" /> : <Folder className="w-4 h-4" />}
                {dir}
                <span className="ml-auto text-[10px] font-mono opacity-50">
                  {dir === 'All Assets' ? allImages.length : allImages.filter(img => img.folder === dir).length}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            <div className="px-3 text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Recent Exports</div>
            <div className="space-y-1">
               {['Pack_Alpha.zip', 'Hero_Poses.png'].map((file, i) => (
                 <div key={i} className="flex items-center gap-3 px-3 py-1.5 text-xs text-gray-500 dark:text-white/40 cursor-default">
                    <ImageIcon className="w-3 h-3" />
                    <span>{file}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-[#0c0c0c]">
        {/* Header */}
        <header className="h-20 border-b border-black/10 dark:border-white/10 flex shrink-0 items-center justify-between px-8 bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            <span className="text-xl font-medium tracking-tight font-serif italic text-gray-900 dark:text-white">{selectedFolder}</span>
            <span className="text-xs font-mono text-white/30 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-sm">{filteredImages.length} items</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/40 group-focus-within:text-lime-600 dark:group-focus-within:text-[#CBFF00] transition-colors" />
              <input 
                type="text" 
                placeholder="Search prompt or tag..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-100 dark:bg-[#111] border border-black/10 dark:border-white/10 text-gray-900 dark:text-white text-xs pl-9 pr-4 py-2 w-48 lg:w-64 focus:outline-none focus:border-[#CBFF00]/50 rounded-sm font-mono placeholder:font-sans transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-3 py-2 rounded-sm border border-black/10 dark:border-white/10">
              <button 
                onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
                className="text-gray-500 dark:text-white/40 hover:text-gray-900 dark:text-white transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="w-20 accent-[#CBFF00] h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <button 
                onClick={() => setZoomLevel(Math.min(5, zoomLevel + 1))}
                className="text-gray-500 dark:text-white/40 hover:text-gray-900 dark:text-white transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Waterfall / Masonry Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {filteredImages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/30">
              <FolderOpen className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-mono text-sm uppercase tracking-widest">No assets found</p>
            </div>
          ) : (
            <div className={`${getZoomClasses()} gap-6 space-y-6 max-w-[1800px] mx-auto transition-all duration-500`}>
              {filteredImages.map((img) => (
                <div 
                  key={img.id} 
                  className="break-inside-avoid relative group"
                >
                  <div className="bg-gray-100 dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-sm overflow-hidden relative">
                    <img 
                      src={img.url} 
                      alt={img.action} 
                      className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAHElEQVR42mP8//8/A7HwMTIywvjEaBQOqPDBAABf0Qn1JbZ3YAAAAABJRU5ErkJggg==')]"
                      loading="lazy"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 backdrop-blur-[2px]">
                      
                      {/* Top Actions */}
                      <div className="flex justify-end gap-2 translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-200">
                        <button 
                          onClick={() => downloadImage(img.url, `${img.id}.png`)}
                          className="w-8 h-8 bg-white/80 dark:bg-black/80 hover:bg-[#CBFF00] hover:text-black text-gray-700 dark:text-white/80 border border-black/20 dark:border-white/20 hover:border-[#CBFF00] shadow-xl flex items-center justify-center rounded-sm transition-all"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          className="w-8 h-8 bg-white/80 dark:bg-black/80 hover:bg-red-500 hover:text-gray-900 dark:text-white text-gray-700 dark:text-white/80 border border-black/20 dark:border-white/20 hover:border-red-500 shadow-xl flex items-center justify-center rounded-sm transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bottom Info & Action */}
                      <div className="translate-y-[10px] group-hover:translate-y-0 transition-transform duration-200">
                        <div className="text-[10px] uppercase font-mono tracking-widest text-lime-600 dark:text-[#CBFF00] mb-2 drop-shadow-md">
                          {img.action}
                        </div>
                        <p className="text-xs text-gray-700 dark:text-white/80 line-clamp-2 mb-3 bg-black/40 p-2 rounded-sm border border-black/10 dark:border-white/10 font-light">
                          {img.prompt}
                        </p>
                        <button 
                          onClick={() => handleReusePrompt(img.prompt)}
                          className="w-full flex items-center justify-center gap-2 py-2 bg-black/10 dark:bg-white/10 hover:bg-white/20 border border-black/20 dark:border-white/20 text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white transition-colors rounded-sm"
                        >
                          <Sparkles className="w-3 h-3" />
                          Reuse Prompt
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
