import React, { useState, useRef, useEffect } from 'react';

export interface CropBox {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface GridCropperProps {
  imageUrl: string;
  rows: number;
  cols: number;
  expectedCount: number;
  onComplete: (boxes: CropBox[]) => void;
  onCancel: () => void;
}

export default function GridCropper({ imageUrl, rows, cols, expectedCount, onComplete, onCancel }: GridCropperProps) {
  const [boxes, setBoxes] = useState<CropBox[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [dragState, setDragState] = useState<{
    index: number;
    type: 'move' | string;
    startX: number;
    startY: number;
    initBox: CropBox;
  } | null>(null);

  useEffect(() => {
    const newBoxes: CropBox[] = [];
    const cellW = 100 / cols;
    const cellH = 100 / rows;
    
    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (count >= expectedCount) break;
        // make it slightly smaller than cell to show gaps
        newBoxes.push({
          id: count,
          x: c * cellW + Math.min(2, cellW * 0.1),
          y: r * cellH + Math.min(2, cellH * 0.1),
          w: cellW - Math.min(4, cellW * 0.2),
          h: cellH - Math.min(4, cellH * 0.2)
        });
        count++;
      }
    }
    setBoxes(newBoxes);
  }, [rows, cols, expectedCount]);

  const handlePointerDown = (e: React.PointerEvent, index: number, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState({
      index,
      type,
      startX: e.clientX,
      startY: e.clientY,
      initBox: { ...boxes[index] }
    });
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    const deltaXPercent = ((e.clientX - dragState.startX) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragState.startY) / rect.height) * 100;
    
    const newBoxes = [...boxes];
    const box = { ...dragState.initBox };
    
    if (dragState.type === 'move') {
      box.x += deltaXPercent;
      box.y += deltaYPercent;
    } else {
      if (dragState.type.includes('w')) {
        box.x += deltaXPercent;
        box.w -= deltaXPercent;
      }
      if (dragState.type.includes('e')) {
        box.w += deltaXPercent;
      }
      if (dragState.type.includes('n')) {
        box.y += deltaYPercent;
        box.h -= deltaYPercent;
      }
      if (dragState.type.includes('s')) {
        box.h += deltaYPercent;
      }
    }
    
    // Limits
    const MIN_SIZE = 5; // 5%
    if (box.w < MIN_SIZE) {
       if (dragState.type.includes('w')) box.x -= (MIN_SIZE - box.w);
       box.w = MIN_SIZE;
    }
    if (box.h < MIN_SIZE) {
       if (dragState.type.includes('n')) box.y -= (MIN_SIZE - box.h);
       box.h = MIN_SIZE;
    }
    
    // Bounds checking
    box.x = Math.max(0, Math.min(100 - box.w, box.x));
    box.y = Math.max(0, Math.min(100 - box.h, box.y));
    box.w = Math.min(100 - box.x, box.w);
    box.h = Math.min(100 - box.y, box.h);

    newBoxes[dragState.index] = box;
    setBoxes(newBoxes);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragState) {
      if (e.target instanceof HTMLElement && e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
      }
      setDragState(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-100 dark:bg-[#111] border border-black/5 dark:border-white/5 relative">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 shrink-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
        <div>
          <h3 className="text-sm font-bold text-lime-600 dark:text-[#CBFF00] uppercase tracking-widest">Alignment Tool</h3>
          <p className="text-[10px] text-gray-600 dark:text-white/50 uppercase tracking-wider">Drag and resize individual boxes to isolate content.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="text-xs uppercase font-bold tracking-widest text-white/60 hover:text-gray-900 dark:text-white"
          >
            Cancel
          </button>
          <button 
            onClick={() => onComplete(boxes)}
            className="bg-[#CBFF00] text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all"
          >
            Confirm Crop
          </button>
        </div>
      </div>
      
      {/* Cropper Workspace */}
      <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
        <div 
          ref={containerRef}
          className="relative max-w-full max-h-full aspect-square select-none touch-none shadow-2xl"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <img 
            src={imageUrl} 
            alt="Generated Grid" 
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />

          {/* Draggable Boxes */}
          {boxes.map((box, i) => (
            <div
              key={box.id}
              className="absolute border border-[#CBFF00] group z-10"
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
                backgroundColor: 'rgba(203, 255, 0, 0.05)'
              }}
            >
              {/* Move Layer */}
              <div 
                className="absolute inset-0 cursor-move"
                onPointerDown={(e) => handlePointerDown(e, i, 'move')}
              />

              {/* Edge Handles */}
              <div 
                className="absolute top-0 left-0 right-0 h-2 -translate-y-1 cursor-ns-resize"
                onPointerDown={(e) => handlePointerDown(e, i, 'n')}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 h-2 translate-y-1 cursor-ns-resize"
                onPointerDown={(e) => handlePointerDown(e, i, 's')}
              />
              <div 
                className="absolute top-0 bottom-0 left-0 w-2 -translate-x-1 cursor-ew-resize"
                onPointerDown={(e) => handlePointerDown(e, i, 'w')}
              />
              <div 
                className="absolute top-0 bottom-0 right-0 w-2 translate-x-1 cursor-ew-resize"
                onPointerDown={(e) => handlePointerDown(e, i, 'e')}
              />

              {/* Corner Handles */}
              <div 
                className="absolute top-0 left-0 w-3 h-3 bg-white border border-black cursor-nwse-resize -translate-x-1.5 -translate-y-1.5"
                onPointerDown={(e) => handlePointerDown(e, i, 'nw')}
              />
              <div 
                className="absolute top-0 right-0 w-3 h-3 bg-white border border-black cursor-nesw-resize translate-x-1.5 -translate-y-1.5"
                onPointerDown={(e) => handlePointerDown(e, i, 'ne')}
              />
              <div 
                className="absolute bottom-0 left-0 w-3 h-3 bg-white border border-black cursor-nesw-resize -translate-x-1.5 translate-y-1.5"
                onPointerDown={(e) => handlePointerDown(e, i, 'sw')}
              />
              <div 
                className="absolute bottom-0 right-0 w-3 h-3 bg-white border border-black cursor-nwse-resize translate-x-1.5 translate-y-1.5"
                onPointerDown={(e) => handlePointerDown(e, i, 'se')}
              />
              
              <div className="absolute top-1 left-1 bg-black/50 text-lime-600 dark:text-[#CBFF00] text-[8px] font-mono px-1 rounded-sm pointer-events-none">
                {box.id + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
