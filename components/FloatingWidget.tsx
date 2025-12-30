
import React, { useState, useEffect, useMemo } from 'react';
import { Maximize2, Bell, Droplets, Move, Eye, Coffee, Palette } from 'lucide-react';
import { Reminder, WidgetTheme } from '../types';

interface FloatingWidgetProps {
  reminder: Reminder | null;
  theme: WidgetTheme;
  setTheme: (theme: WidgetTheme) => void;
  onExpand: () => void;
}

const THEMES: Record<WidgetTheme, string> = {
  glass: 'bg-white/70 backdrop-blur-2xl border-white/40 text-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.1)] ring-1 ring-black/5',
  cyber: 'bg-slate-900/80 backdrop-blur-xl border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
  retro: 'bg-[#d0d0d0] border-[3px] border-t-white border-l-white border-r-gray-700 border-b-gray-700 text-black font-mono',
  sakura: 'bg-rose-50/80 backdrop-blur-xl border-rose-200 text-rose-500 shadow-lg shadow-rose-200/40',
};

const FloatingWidget: React.FC<FloatingWidgetProps> = ({ reminder, theme, setTheme, onExpand }) => {
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  const [isBlinking, setIsBlinking] = useState(false);
  
  // 随机眨眼逻辑
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!reminder) { setTimeLeft('--:--'); return; }
      const now = Date.now();
      const target = reminder.mode === 'once' 
        ? new Date(reminder.time).getTime() 
        : (reminder.lastTriggeredAt || reminder.createdAt) + (reminder.intervalMinutes || 30) * 60000;
      const diff = target - now;
      if (diff <= 0) { setTimeLeft('!!!'); }
      else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [reminder]);

  const catColor = useMemo(() => {
    const colors = { glass: '#64748b', cyber: '#22d3ee', retro: '#4b5563', sakura: '#fb7185' };
    return colors[theme];
  }, [theme]);

  const icons: any = {
    water: <Droplets className="w-4 h-4" />,
    stretch: <Move className="w-4 h-4" />,
    eye: <Eye className="w-4 h-4" />,
    break: <Coffee className="w-4 h-4" />,
    general: <Bell className="w-4 h-4" />,
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center select-none relative animate-in fade-in zoom-in-95 duration-500">
      {/* 核心猫咪形象 - 稍微居中调整 */}
      <div className="relative mb-[-6px] z-10">
        <svg width="100" height="60" viewBox="0 0 100 60" className="drop-shadow-lg overflow-visible">
          {/* 身体 */}
          <rect x="20" y="20" width="60" height="40" rx="25" fill={catColor} className="animate-breathing origin-bottom" />
          {/* 耳朵 */}
          <path d="M30 22 L22 10 L38 20 Z" fill={catColor} className="animate-ear-twitch" />
          <path d="M70 22 L78 10 L62 20 Z" fill={catColor} />
          {/* 眼睛 */}
          {!isBlinking ? (
            <g>
              <circle cx="42" cy="35" r="3.5" fill="white" />
              <circle cx="58" cy="35" r="3.5" fill="white" />
              <circle cx="42" cy="35" r="1.5" fill="black" />
              <circle cx="58" cy="35" r="1.5" fill="black" />
            </g>
          ) : (
            <g>
              <line x1="38" y1="35" x2="46" y2="35" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="54" y1="35" x2="62" y2="35" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}
          {/* 腮红 */}
          <circle cx="35" cy="42" r="3" fill="#fda4af" opacity="0.4" />
          <circle cx="65" cy="42" r="3" fill="#fda4af" opacity="0.4" />
          {/* 尾巴 */}
          <path d="M80 45 C95 45 95 30 90 20" stroke={catColor} strokeWidth="8" strokeLinecap="round" className="animate-tail-wag origin-left" />
        </svg>
      </div>

      {/* 挂件主体卡片 */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-3xl border ${THEMES[theme]} transition-all duration-300`}>
        <div className="flex items-center gap-2 pr-3 border-r border-current/10">
          <div className="text-current/80">{reminder ? icons[reminder.category] : icons.general}</div>
          <div className="flex flex-col leading-none">
            <span className="text-[8px] font-black opacity-40 mb-1">TIMER</span>
            <span className="text-sm font-black tabular-nums">{timeLeft}</span>
          </div>
        </div>
        
        <div className="flex gap-1.5">
          <button onClick={() => {
            const list: WidgetTheme[] = ['glass', 'cyber', 'retro', 'sakura'];
            setTheme(list[(list.indexOf(theme) + 1) % list.length]);
          }} className="p-1.5 hover:bg-black/5 rounded-full outline-none"><Palette className="w-3.5 h-3.5 opacity-60" /></button>
          <button onClick={onExpand} className="p-1.5 bg-blue-600/10 text-blue-600 rounded-full hover:bg-blue-600/20 outline-none"><Maximize2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <style>{`
        @keyframes breathing {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.05); }
        }
        @keyframes ear-twitch {
          0%, 90%, 100% { transform: rotate(0); }
          95% { transform: rotate(-10deg); }
        }
        @keyframes tail-wag {
          0%, 100% { transform: rotate(0); }
          50% { transform: rotate(15deg); }
        }
        .animate-breathing { animation: breathing 4s infinite ease-in-out; }
        .animate-ear-twitch { animation: ear-twitch 3s infinite; }
        .animate-tail-wag { animation: tail-wag 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default FloatingWidget;
