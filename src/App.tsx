/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import Experience from './components/Experience';
import Overlay from './components/Overlay';
import { Leva } from 'leva';
import confetti from 'canvas-confetti';

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [audioPulse, setAudioPulse] = useState(0);
  const [imageData, setImageData] = useState<{ positions: Float32Array; colors: Float32Array } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate audio input rhythm
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (isListening) {
        const time = Date.now() * 0.005;
        const pulse = Math.sin(time) * 0.5 + 0.5;
        const jitters = Math.random() * 0.2;
        setAudioPulse(pulse + jitters);
      } else {
        setAudioPulse(0);
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isListening]);

  const handleToggleListen = () => {
    setIsListening(!isListening);
  };

  const handleSave = () => {
    if (isListening) setIsListening(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#ffcc00', '#ffffff', '#ffaa00']
    });
    alert('记忆已保存。');
  };

  const handleCancel = () => {
    setIsListening(false);
    setAudioPulse(0);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 150; // Resolution of the particle image
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        const count = 50000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
          const x = Math.floor(Math.random() * size);
          const y = Math.floor(Math.random() * size);
          const index = (y * size + x) * 4;

          // Mapping image coordinates to 3D space
          positions[i * 3] = (x / size - 0.5) * 20;
          positions[i * 3 + 1] = (0.5 - y / size) * 20;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

          colors[i * 3] = data[index] / 255;
          colors[i * 3 + 1] = data[index + 1] / 255;
          colors[i * 3 + 2] = data[index + 2] / 255;
        }

        setImageData({ positions, colors });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black selection:bg-white/10">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
      
      {/* 3D Scene */}
      <Experience audioPulse={audioPulse} imageData={imageData} />

      {/* Control Panel (Leva) */}
      <div className="fixed top-8 right-8 z-50">
        <Leva 
          flat 
          titleBar={{ title: 'SYSTEM PARAMETERS', drag: false }} 
          theme={{
            sizes: { rootWidth: '280px' },
            colors: {
              accent1: '#eab308',
              elevation1: 'rgba(24, 24, 27, 0.5)',
              elevation2: 'rgba(39, 39, 42, 0.8)',
              elevation3: '#27272a',
              highlight1: '#fff',
              highlight2: '#eab308',
              highlight3: '#fff',
            }
          }}
        />
      </div>

      {/* UI HUD */}
      <Overlay 
        isListening={isListening} 
        onToggleListen={handleToggleListen}
        onSave={handleSave}
        onCancel={handleCancel}
        onUpload={handleUploadClick}
      />

      {/* Background Vignette & Blur */}
      <div className="absolute inset-0 pointer-events-none bg-radial-[circle_at_center,_transparent_0%,_black_90%] opacity-80" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />
    </div>
  );
}
