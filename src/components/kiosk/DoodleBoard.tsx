'use client';

import { useRef, useState, useEffect, TouchEvent, MouseEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paintbrush, Eraser, Trash2, Download } from 'lucide-react';

export function DoodleBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');

  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Cyan
    '#45B7D1', // Blue
    '#FFA07A', // Orange
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Light Blue
    '#F8B500', // Gold
    '#2ECC71', // Green
  ];

  const brushSizes = [3, 5, 8, 12, 20];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (x: number, y: number) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (x: number, y: number) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = mode === 'erase' ? 'white' : color;
    ctx.lineWidth = mode === 'erase' ? brushSize * 2 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    startDrawing(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    draw(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    draw(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `doodle-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Card className="shadow-lg hover:shadow-2xl transition-all hover:scale-105 duration-300 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 border-4 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="h-6 w-6 text-purple-600 animate-pulse" />
          <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-black text-xl">
            Doodle Board
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Canvas */}
          <div className="relative bg-white rounded-lg border-4 border-purple-300 shadow-inner overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full touch-none cursor-crosshair"
              style={{ height: '500px' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>

          {/* Tools */}
          <div className="space-y-3">
            {/* Mode and Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={mode === 'draw' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('draw')}
                className="flex-1 min-w-[80px]"
              >
                <Paintbrush className="h-4 w-4 mr-1" />
                Draw
              </Button>
              <Button
                variant={mode === 'erase' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('erase')}
                className="flex-1 min-w-[80px]"
              >
                <Eraser className="h-4 w-4 mr-1" />
                Erase
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="flex-1 min-w-[80px]"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadDrawing}
                className="flex-1 min-w-[80px]"
              >
                <Download className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>

            {/* Color Palette */}
            {mode === 'draw' && (
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">Colors:</p>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c}
                      className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                        color === c ? 'border-gray-800 scale-110' : 'border-white'
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Brush Size */}
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">
                {mode === 'draw' ? 'Brush' : 'Eraser'} Size:
              </p>
              <div className="flex gap-2">
                {brushSizes.map((size) => (
                  <button
                    key={size}
                    className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                      brushSize === size
                        ? 'border-purple-600 bg-purple-100'
                        : 'border-gray-300 bg-white'
                    }`}
                    onClick={() => setBrushSize(size)}
                  >
                    <div
                      className="rounded-full bg-gray-800"
                      style={{ width: `${size * 2}px`, height: `${size * 2}px` }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
