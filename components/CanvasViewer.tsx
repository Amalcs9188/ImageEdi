import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, Move, Upload, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { CanvasState } from '../types';
import { fileToBase64 } from '../utils';

interface CanvasViewerProps {
  imageUrl: string | null;
  isLoading?: boolean;
  onImageDrop?: (base64: string) => void;
}

export const CanvasViewer: React.FC<CanvasViewerProps> = ({ imageUrl, isLoading = false, onImageDrop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CanvasState>({
    scale: 1,
    position: { x: 0, y: 0 },
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset view when image changes
  useEffect(() => {
    setState({ scale: 1, position: { x: 0, y: 0 } });
  }, [imageUrl]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAdjustment = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.1, state.scale + scaleAdjustment), 5);
    setState(prev => ({ ...prev, scale: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageUrl) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - state.position.x, y: e.clientY - state.position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setState(prev => ({
      ...prev,
      position: {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (onImageDrop && e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        try {
          const base64 = await fileToBase64(file);
          onImageDrop(base64);
        } catch (error) {
          console.error("Failed to process dropped image", error);
        }
      }
    }
  };

  const zoomIn = () => setState(prev => ({ ...prev, scale: Math.min(prev.scale + 0.2, 5) }));
  const zoomOut = () => setState(prev => ({ ...prev, scale: Math.max(prev.scale - 0.2, 0.1) }));
  const resetView = () => setState({ scale: 1, position: { x: 0, y: 0 } });

  if (!imageUrl) {
    return (
      <div 
        className={`flex-1 h-full flex flex-col items-center justify-center bg-surface text-text-dim transition-colors ${isDragOver ? 'bg-surface-highlight border-2 border-primary-light border-dashed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={`w-24 h-24 border-2 border-dashed ${isDragOver ? 'border-primary-light bg-primary/10' : 'border-border'} rounded-xl flex items-center justify-center mb-4 transition-all`}>
          {isDragOver ? <Upload className="w-10 h-10 text-primary-light" /> : <Move className="w-8 h-8 opacity-50" />}
        </div>
        <p className={`text-lg font-medium ${isDragOver ? 'text-primary-light' : ''}`}>
          {isDragOver ? 'Drop Image Here' : 'No Image Loaded'}
        </p>
        <p className="text-sm mt-2 max-w-md text-center">
          Ask Gemini to generate an image or drag and drop one here to start editing.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 h-full overflow-hidden bg-canvas-bg select-none cursor-move"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--text-main) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      {/* Drag Over Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-primary/20 border-4 border-primary-light border-dashed flex items-center justify-center backdrop-blur-sm pointer-events-none">
          <div className="bg-surface/90 px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl">
            <Upload className="w-6 h-6 text-primary-light" />
            <span className="text-text font-medium">Drop to replace image</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity">
          <div className="bg-surface rounded-full p-4 shadow-2xl mb-4 border border-border">
            <Loader2 className="w-8 h-8 text-primary-light animate-spin" />
          </div>
          <span className="text-text font-medium bg-surface/80 px-4 py-2 rounded-lg backdrop-blur-md">Processing image...</span>
        </div>
      )}

      {/* Image Content */}
      <div 
        className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${state.position.x}px, ${state.position.y}px) scale(${state.scale})`
        }}
      >
        <img 
          src={imageUrl} 
          alt="Canvas content" 
          className="max-w-none shadow-2xl shadow-black/50"
          draggable={false}
        />
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-surface/90 backdrop-blur-md rounded-full border border-border/50 shadow-xl z-30">
        <Button variant="icon" onClick={zoomOut} title="Zoom Out">
          <ZoomOut className="w-5 h-5" />
        </Button>
        <span className="text-xs font-mono text-text-muted min-w-[3rem] text-center">
          {Math.round(state.scale * 100)}%
        </span>
        <Button variant="icon" onClick={zoomIn} title="Zoom In">
          <ZoomIn className="w-5 h-5" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="icon" onClick={resetView} title="Reset View">
          <Maximize className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};