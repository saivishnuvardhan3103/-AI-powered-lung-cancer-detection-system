import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Layers } from 'lucide-react';

interface Detection {
  center: [number, number, number];
  score: number;
  radius: number;
}

interface SliceViewerProps {
  filename: string;
  numSlices: number;
  detections: Detection[];
}

const SliceViewer: React.FC<SliceViewerProps> = ({ filename, numSlices, detections }) => {
  const [currentSlice, setCurrentSlice] = useState(Math.floor(numSlices / 2));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAndDrawSlice = async (idx: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/slice/${filename}/${idx}`);
      const data = await response.json();
      const slice = data.slice; // 2D array [H, W] normalized 0-1
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const height = slice.length;
      const width = slice[0].length;
      
      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      const imageData = ctx.createImageData(width, height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const val = Math.floor(slice[y][x] * 255);
          const idx = (y * width + x) * 4;
          imageData.data[idx] = val;     // R
          imageData.data[idx + 1] = val; // G
          imageData.data[idx + 2] = val; // B
          imageData.data[idx + 3] = 255; // A
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // Draw detections if on this slice (within radius)
      detections.forEach((det) => {
        const [z, y, x] = det.center;
        const dist = Math.abs(z - currentSlice);
        if (dist < det.radius) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Draw circle based on intersection with slice
          const sliceRadius = Math.sqrt(Math.max(0, det.radius ** 2 - dist ** 2));
          ctx.arc(x, y, sliceRadius + 2, 0, Math.PI * 2);
          ctx.stroke();
          
          // Draw label
          ctx.fillStyle = '#ef4444';
          ctx.font = '10px Inter';
          ctx.fillText(`Nodule ${Math.round(det.score * 100)}%`, x + 5, y - 5);
        }
      });

    } catch (err) {
      console.error("Error drawing slice:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndDrawSlice(currentSlice);
  }, [currentSlice, filename]);

  return (
    <div className="bg-panel p-6 rounded-2xl border border-slate-800 flex flex-col gap-6">
      <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg">
        <div className="flex items-center gap-2 text-slate-400">
          <Layers size={18} />
          <span className="text-sm font-medium">Slice {currentSlice + 1} / {numSlices}</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setCurrentSlice(s => Math.max(0, s - 1))}
             className="p-1 hover:bg-slate-700 rounded transition-colors"
           >
             <ChevronLeft size={20} />
           </button>
           <button 
             onClick={() => setCurrentSlice(s => Math.min(numSlices - 1, s + 1))}
             className="p-1 hover:bg-slate-700 rounded transition-colors"
           >
             <ChevronRight size={20} />
           </button>
        </div>
      </div>

      <div className="relative aspect-square bg-black rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <canvas 
          ref={canvasRef} 
          className="max-w-full max-h-full image-render-pixelated"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Scroll through volume</label>
        <input 
          type="range"
          min={0}
          max={numSlices - 1}
          value={currentSlice}
          onChange={(e) => setCurrentSlice(parseInt(e.target.value))}
          className="w-full accent-primary h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default SliceViewer;
