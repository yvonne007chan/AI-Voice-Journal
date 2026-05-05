/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mic, Volume2, Menu, Share2, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface OverlayProps {
  isListening: boolean;
  onToggleListen: () => void;
  onSave: () => void;
  onCancel: () => void;
  onUpload: () => void;
}

export default function Overlay({ isListening, onToggleListen, onSave, onCancel, onUpload }: OverlayProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      setTime(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-6 font-sans overflow-hidden">
      {/* Top Section */}
      <div className="flex flex-col items-center gap-12 z-20">
        <div className="w-full flex justify-between items-center px-4 pt-4">
          {/* Logo */}
          <div className="text-xl font-serif text-white/90 tracking-widest pl-4">
            小笼包的AI日记
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex gap-10 absolute left-1/2 -translate-x-1/2">
            {['THE GARDEN', 'MEMORY', 'MUSIC', 'INFO'].map((item) => (
              <button 
                key={item} 
                className="text-[11px] uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors pointer-events-auto"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Top Right Icons */}
          <div className="flex items-center gap-6 pr-4 pointer-events-auto text-white/50">
            <button className="hover:text-white transition-colors">
              <Volume2 size={16} strokeWidth={1.5} />
            </button>
            <button className="hover:text-white transition-colors">
              <Menu size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Gemini Status Capsule */}
        <div className="flex items-center gap-3 py-2 px-5 bg-black/40 border border-white/5 rounded-full backdrop-blur-md pointer-events-auto group hover:border-white/10 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="text-[11px] text-white/50 tracking-[0.25em] font-light">Gemini</span>
        </div>
      </div>

      {/* Far Right Share/Settings */}
      <div className="absolute right-8 top-1/3 flex flex-col gap-4 pointer-events-auto">
        <button className="w-9 h-9 rounded-full border border-white/5 bg-black/20 flex items-center justify-center text-white/30 hover:text-white hover:border-white/20 transition-all backdrop-blur-sm">
          <Share2 size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* AI Listening Text */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-32">
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="text-center"
            >
              <h1 className="text-white/50 text-base font-light tracking-widest italic font-serif opacity-80">
                正在倾听你的故事...
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom UI Implementation */}
      <div className="flex flex-col items-center gap-6 pb-6">
        {/* Large Central Mic */}
        <div className="relative group pointer-events-auto mb-4">
          <motion.button
            onClick={onToggleListen}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative w-24 h-24 rounded-full border border-white/5 flex items-center justify-center transition-all duration-700
              ${isListening ? 'bg-white/5 border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.05)]' : 'bg-transparent hover:bg-white/5 hover:border-white/10'}
            `}
          >
            <Mic size={24} className={`${isListening ? 'text-white' : 'text-white/30'} transition-opacity`} strokeWidth={1} />
            {isListening && (
              <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-10" />
            )}
          </motion.button>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-center gap-3 pointer-events-auto">
          {/* Timer box */}
          <div className="px-5 py-2.5 border border-white/5 rounded-xl bg-black/20 backdrop-blur-sm min-w-[70px] text-center">
            <span className="text-white/40 font-mono text-sm tracking-widest">
              {formatTime(time)}
            </span>
          </div>

          {/* Save Memory box */}
          <button 
            onClick={onSave}
            className="group flex items-center gap-4 px-7 py-2.5 border border-white/5 rounded-xl bg-black/20 backdrop-blur-sm hover:border-white/10 hover:bg-white/5 transition-all shadow-lg"
          >
            <span className="text-[10px] text-white/50 uppercase tracking-[0.4em] font-medium group-hover:text-emerald-400/80 transition-colors">
              Save Memory
            </span>
            <ChevronRight size={14} className="text-white/20 group-hover:translate-x-1 group-hover:text-emerald-400/50 transition-all" />
          </button>

          {/* Cancel box */}
          <button 
            onClick={onCancel}
            className="w-11 h-11 border border-white/5 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center text-red-500/30 hover:text-red-500/60 hover:border-red-500/20 hover:bg-red-500/5 transition-all"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Bottom Upload Another */}
        <div className="mt-4 pointer-events-auto opacity-60 hover:opacity-100 transition-opacity">
          <button 
            onClick={onUpload}
            className="flex items-center gap-3 px-8 py-2.5 border border-white/5 rounded-xl bg-black/20 backdrop-blur-sm text-[10px] uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all"
          >
            <ArrowLeft size={12} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
            Upload Another
          </button>
        </div>
      </div>
    </div>
  );
}
