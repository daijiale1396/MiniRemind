
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

type CatMood = 'chill' | 'alert' | 'urgent' | 'triggered';

const FloatingWidget: React.FC<FloatingWidgetProps> = ({ reminder, theme, setTheme, onExpand }) => {
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  const [mood, setMood] = useState<CatMood>('chill');
  const [isBlinking, setIsBlinking] = useState(false);
  
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!reminder) { 
        setTimeLeft('--:--'); 
        setMood('chill');
        return; 
      }
      const now = Date.now();
      const target = reminder.mode === 'once' 
        ? new Date(reminder.time).getTime() 
        : (reminder.lastTriggeredAt || reminder.createdAt) + (reminder.intervalMinutes || 30) * 60000;
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('!!!');
        setMood('triggered');
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        
        if (mins < 1) setMood('urgent');
        else if (mins < 5) setMood('alert');
        else setMood('chill');
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
    <div 
      className="w-full h-full flex flex-col items-center justify-center select-none relative animate-in fade-in zoom-in-95 duration-500"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* 动态情绪猫咪 */}
      <div className={`relative mb-[-6px] z-10 pointer-events-none transition-transform duration-500 ${mood === 'triggered' ? 'animate-cat-jump' : ''}`}>
        <svg width="100" height="60" viewBox="0 0 100 60" className={`drop-shadow-lg overflow-visible ${mood === 'urgent' ? 'animate-cat-shiver' : ''}`}>
          {/* 身体 - 呼吸速度随情绪变化 */}
          <rect 
            x="20" y="20" width="60" height="40" rx="25" fill={catColor} 
            className={`origin-bottom ${mood === 'chill' ? 'animate-breathing-slow' : mood === 'alert' ? 'animate-breathing-fast' : 'animate-breathing-urgent'}`} 
          />
          
          {/* 耳朵 */}
          <path d="M30 22 L22 10 L38 20 Z" fill={catColor} className={mood !== 'chill' ? 'animate-ear-twitch-fast' : 'animate-ear-twitch'} />
          <path d="M70 22 L78 10 L62 20 Z" fill={catColor} className={mood !== 'chill' ? 'animate-ear-twitch-fast' : ''} />
          
          {/* 眼睛 */}
          {!isBlinking ? (
            <g>
              <circle cx="42" cy="35" r={mood === 'triggered' ? "5" : "3.5"} fill="white" />
              <circle cx="58" cy="35" r={mood === 'triggered' ? "5" : "3.5"} fill="white" />
              <circle cx="42" cy="35" r={mood === 'triggered' ? "2.5" : "1.5"} fill="black" />
              <circle cx="58" cy="35" r={mood === 'triggered' ? "2.5" : "1.5"} fill="black" />
              {mood === 'triggered' && <path d="M40 33 L44 37 M44 33 L40 37" stroke="white" strokeWidth="1" />}
            </g>
          ) : (
            <g stroke="white" strokeWidth="2" strokeLinecap="round">
              <line x1="38" y1="35" x2="46" y2="35" />
              <line x1="54" y1="35" x2="62" y2="35" />
            </g>
          )}

          {/* 腮红 - 紧张或兴奋时颜色加深 */}
          <circle cx="35" cy="42" r="3" fill="#fda4af" opacity={mood === 'chill' ? "0.4" : "0.8"} />
          <circle cx="65" cy="42" r="3" fill="#fda4af" opacity={mood === 'chill' ? "0.4" : "0.8"} />
          
          {/* 尾巴 - 摆动速度随情绪变化 */}
          <path 
            d="M80 45 C95 45 95 30 90 20" 
            stroke={catColor} strokeWidth="8" strokeLinecap="round" 
            className={`origin-left ${mood === 'urgent' || mood === 'triggered' ? 'animate-tail-wag-fast' : 'animate-tail-wag'}`} 
          />
        </svg>
      </div>

      {/* 挂件主体卡片 */}
      <div 
        className={`flex items-center gap-3 px-4 py-3 rounded-3xl border ${THEMES[theme]} transition-all duration-300 shadow-xl ${mood === 'triggered' ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
      >
        <div className="flex items-center gap-2 pr-3 border-r border-current/10 pointer-events-none">
          <div className={`transition-transform duration-300 ${mood === 'triggered' ? 'scale-125 animate-bounce' : ''}`}>
            {reminder ? icons[reminder.category] : icons.general}
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[8px] font-black opacity-40 mb-1">TIMER</span>
            <span className={`text-sm font-black tabular-nums ${mood === 'triggered' ? 'text-red-500 animate-pulse' : ''}`}>{timeLeft}</span>
          </div>
        </div>
        
        <div className="flex gap-1.5" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button onClick={() => {
            const list: WidgetTheme[] = ['glass', 'cyber', 'retro', 'sakura'];
            setTheme(list[(list.indexOf(theme) + 1) % list.length]);
          }} className="p-1.5 hover:bg-black/10 rounded-full outline-none transition-colors">
            <Palette className="w-3.5 h-3.5 opacity-70" />
          </button>
          <button onClick={onExpand} className="p-1.5 bg-blue-600/10 text-blue-600 rounded-full hover:bg-blue-600/20 outline-none transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes breathing-slow { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.05); } }
        @keyframes breathing-fast { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.1); } }
        @keyframes breathing-urgent { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.15); } }
        
        @keyframes ear-twitch { 0%, 90%, 100% { transform: rotate(0); } 95% { transform: rotate(-10deg); } }
        @keyframes ear-twitch-fast { 0%, 50%, 100% { transform: rotate(0); } 25%, 75% { transform: rotate(-15deg); } }
        
        @keyframes tail-wag { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(15deg); } }
        @keyframes tail-wag-fast { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(30deg); } }
        
        @keyframes cat-shiver { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-0.5px); } 75% { transform: translateX(0.5px); } }
        @keyframes cat-jump { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

        .animate-breathing-slow { animation: breathing-slow 4s infinite ease-in-out; }
        .animate-breathing-fast { animation: breathing-fast 2s infinite ease-in-out; }
        .animate-breathing-urgent { animation: breathing-urgent 0.8s infinite ease-in-out; }
        
        .animate-ear-twitch { animation: ear-twitch 3s infinite; }
        .animate-ear-twitch-fast { animation: ear-twitch-fast 1s infinite; }
        
        .animate-tail-wag { animation: tail-wag 2s infinite ease-in-out; }
        .animate-tail-wag-fast { animation: tail-wag-fast 0.5s infinite ease-in-out; }
        
        .animate-cat-shiver { animation: cat-shiver 0.1s infinite; }
        .animate-cat-jump { animation: cat-jump 0.6s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default FloatingWidget;
