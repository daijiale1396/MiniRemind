
import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Bell, Droplets, Move, Eye, Coffee, Palette } from 'lucide-react';
import { Reminder, WidgetTheme } from '../types';

interface FloatingWidgetProps {
  reminder: Reminder | null;
  theme: WidgetTheme;
  setTheme: (theme: WidgetTheme) => void;
  onExpand: () => void;
}

const THEMES: Record<WidgetTheme, string> = {
  glass: 'bg-white/80 backdrop-blur-xl border-white text-slate-800 shadow-2xl ring-4 ring-black/5',
  cyber: 'bg-slate-900 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] border-2 ring-2 ring-cyan-500/20',
  retro: 'bg-[#c0c0c0] border-t-white border-l-white border-b-gray-800 border-r-gray-800 border-[3px] text-black font-mono shadow-[4px_4px_0_rgba(0,0,0,0.5)]',
  sakura: 'bg-rose-50 border-rose-200 text-rose-600 shadow-lg shadow-rose-200/50 border-2 ring-4 ring-rose-100',
};

const FloatingWidget: React.FC<FloatingWidgetProps> = ({ reminder, theme, setTheme, onExpand }) => {
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  const [catPose, setCatPose] = useState<'sleep' | 'nap' | 'alert'>('sleep');
  
  // 拖拽逻辑状态
  const [position, setPosition] = useState({ x: window.innerWidth - 260, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!reminder) {
        setTimeLeft('--:--');
        setCatPose('sleep');
        return;
      }

      const now = new Date().getTime();
      let target: number;
      if (reminder.mode === 'once') {
        target = new Date(reminder.time).getTime();
      } else {
        const interval = (reminder.intervalMinutes || 30) * 60000;
        const last = reminder.lastTriggeredAt || reminder.createdAt;
        target = last + interval;
      }

      const diff = target - now;
      
      if (diff > 0 && diff < 60000) {
        setCatPose('alert'); 
      } else if (diff >= 60000 && diff < 300000) {
        setCatPose('nap'); 
      } else {
        setCatPose('sleep'); 
      }

      if (diff <= 0) {
        setTimeLeft('!!!');
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [reminder]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setIsSnapping(false);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
      
      // 允许稍微超出边界以便更好的拖拽感，实际吸附在 MouseUp 处理
      const boundedX = Math.max(-50, Math.min(window.innerWidth - 150, newX));
      const boundedY = Math.max(40, Math.min(window.innerHeight - 80, newY));
      setPosition({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      setIsSnapping(true);

      // 吸附逻辑
      const threshold = 80; // 吸附阈值
      let finalX = position.x;
      let finalY = position.y;

      // 屏幕尺寸
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const widgetW = 200; // 大致宽度
      const widgetH = 80;  // 大致高度

      // 水平吸附
      if (finalX < threshold) {
        finalX = 16; // 贴左边
      } else if (finalX > screenW - widgetW - threshold) {
        finalX = screenW - widgetW - 16; // 贴右边
      }

      // 垂直吸附
      if (finalY < threshold + 40) {
        finalY = 56; // 贴顶
      } else if (finalY > screenH - widgetH - threshold) {
        finalY = screenH - widgetH - 16; // 贴底
      }

      setPosition({ x: finalX, y: finalY });
      
      // 动画结束后关闭吸附状态
      setTimeout(() => setIsSnapping(false), 300);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

  const toggleTheme = () => {
    const themeList: WidgetTheme[] = ['glass', 'cyber', 'retro', 'sakura'];
    const nextIndex = (themeList.indexOf(theme) + 1) % themeList.length;
    setTheme(themeList[nextIndex]);
  };

  const icons: any = {
    water: <Droplets className="w-4 h-4" />,
    stretch: <Move className="w-4 h-4" />,
    eye: <Eye className="w-4 h-4" />,
    break: <Coffee className="w-4 h-4" />,
    general: <Bell className="w-4 h-4" />,
  };

  const catColors: Record<WidgetTheme, string> = {
    glass: '#475569',
    cyber: '#06b6d4',
    retro: '#404040',
    sakura: '#fb7185',
  };

  return (
    <div 
      ref={widgetRef}
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      className={`fixed z-[200] group select-none ${
        isSnapping ? 'transition-all duration-300 ease-out' : 'transition-none'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* 猫咪容器 */}
      <div className={`absolute -top-[42px] left-6 transition-all duration-700 pointer-events-none ${catPose === 'alert' ? 'scale-110 -translate-y-1' : 'scale-100'}`}>
        <svg width="80" height="45" viewBox="0 0 80 45" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible drop-shadow-md relative z-10">
          {catPose === 'sleep' && (
            <g className="animate-breathing origin-bottom">
              <rect x="10" y="15" width="50" height="30" rx="20" fill={catColors[theme]} />
              <circle cx="20" cy="20" r="10" fill={catColors[theme]} />
              <path d="M12 14L15 6L20 12" stroke={catColors[theme]} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M25 12L30 6L33 14" stroke={catColors[theme]} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 22C17 23 20 23 21 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <path d="M25 22C26 23 29 23 30 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <path d="M55 35C65 35 70 28 68 20" stroke={catColors[theme]} strokeWidth="6" strokeLinecap="round" className="animate-tail-float" />
            </g>
          )}

          {catPose === 'nap' && (
            <g className="animate-nap-sway origin-bottom">
              <rect x="5" y="20" width="60" height="25" rx="12" fill={catColors[theme]} />
              <circle cx="60" cy="25" r="12" fill={catColors[theme]} />
              <path d="M52 18L55 8L60 16" stroke={catColors[theme]} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M65 16L70 8L73 18" stroke={catColors[theme]} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M56 26C57 27 60 27 61 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <path d="M66 26C67 27 70 27 71 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <path d="M15 42V48" stroke={catColors[theme]} strokeWidth="6" strokeLinecap="round" />
              <circle cx="15" cy="48" r="2" fill="white" opacity="0.4" />
              <path d="M5 35C-5 35 -10 25 -8 15" stroke={catColors[theme]} strokeWidth="6" strokeLinecap="round" className="animate-tail-wag-left" />
            </g>
          )}

          {catPose === 'alert' && (
            <g>
              <path d="M20 45C20 20 30 10 50 10C65 10 70 25 70 45H20Z" fill={catColors[theme]} />
              <path d="M42 12L46 2L52 12H42Z" fill={catColors[theme]} className="animate-ear-twitch" />
              <path d="M60 12L64 2L70 12H60Z" fill={catColors[theme]} />
              <circle cx="48" cy="25" r="5" fill="white" />
              <circle cx="62" cy="25" r="5" fill="white" />
              <circle cx="48" cy="25" r="2.5" fill="black" className="animate-pupil" />
              <circle cx="62" cy="25" r="2.5" fill="black" className="animate-pupil" />
              <path d="M40 32H30M40 35H31" stroke="white" strokeWidth="1" opacity="0.4" />
              <path d="M70 32H80M70 35H79" stroke="white" strokeWidth="1" opacity="0.4" />
              <path d="M70 40C80 40 85 30 82 15" stroke={catColors[theme]} strokeWidth="6" strokeLinecap="round" className="animate-tail-alert" />
            </g>
          )}
        </svg>

        {/* 逐个飘散的 Zzz 动画容器 - 移出 SVG 以便正常渲染 HTML */}
        {catPose !== 'alert' && (
           <div 
             className={`absolute transition-all duration-500 pointer-events-none z-20`}
             style={{ 
               left: catPose === 'sleep' ? '20px' : '65px', 
               top: catPose === 'sleep' ? '5px' : '10px' 
             }}
           >
              <span className="absolute text-[12px] font-bold text-slate-400 opacity-0 animate-zzz-float-1">Z</span>
              <span className="absolute text-[10px] font-bold text-slate-400 opacity-0 animate-zzz-float-2">z</span>
              <span className="absolute text-[8px] font-bold text-slate-400 opacity-0 animate-zzz-float-3">z</span>
           </div>
        )}
      </div>

      {/* 悬浮窗主体 */}
      <div className={`relative transition-all duration-300 rounded-full p-2 pl-4 flex items-center gap-3 ${THEMES[theme]} ${isDragging ? 'scale-105 shadow-inner' : 'shadow-2xl'}`}>
        <div className="flex items-center gap-2 pr-2 border-r border-current/20">
          <div className={`${catPose === 'alert' ? 'animate-bounce' : ''}`}>
             {reminder ? icons[reminder.category] : <Bell className="w-4 h-4 opacity-50" />}
          </div>
          <div className="flex flex-col min-w-[55px]">
            <span className={`text-[9px] font-black uppercase leading-none opacity-60 ${theme === 'retro' ? 'font-mono' : ''}`}>
              {timeLeft === '!!!' ? 'TIME UP' : 'NEXT'}
            </span>
            <span className={`text-xs font-black tabular-nums ${theme === 'retro' ? 'font-mono' : ''}`}>{timeLeft}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
            className="p-1.5 hover:bg-black/10 rounded-full transition-colors"
          >
            <Palette className="w-3 h-3" />
          </button>
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onExpand(); }}
            className={`p-2 rounded-full shadow-lg transition-all active:scale-90 ${
              theme === 'cyber' ? 'bg-cyan-500 text-slate-900 shadow-cyan-500/30' : 
              theme === 'retro' ? 'bg-[#c0c0c0] border-t-white border-l-white border-b-gray-800 border-r-gray-800 border-2 text-black' : 
              theme === 'sakura' ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-blue-600 text-white shadow-blue-500/30'
            }`}
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes breathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02, 0.98); }
        }
        @keyframes nap-sway {
          0%, 100% { transform: rotate(-1deg) translateY(0); }
          50% { transform: rotate(1deg) translateY(1px); }
        }
        @keyframes tail-float {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(20deg); }
        }
        @keyframes tail-wag-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
        }
        @keyframes tail-alert {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(35deg); }
        }
        @keyframes ear-twitch {
          0%, 90%, 100% { transform: rotate(0deg); }
          95% { transform: rotate(-15deg); }
        }
        @keyframes pupil-move {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(2px, -1px); }
        }
        
        @keyframes zzz-float {
          0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translate(12px, -40px) scale(1.4); opacity: 0; }
        }
        .animate-zzz-float-1 { animation: zzz-float 4s infinite linear; }
        .animate-zzz-float-2 { animation: zzz-float 4s infinite 1.3s linear; }
        .animate-zzz-float-3 { animation: zzz-float 4s infinite 2.6s linear; }

        .animate-breathing { animation: breathing 3s infinite ease-in-out; }
        .animate-nap-sway { animation: nap-sway 4s infinite ease-in-out; }
        .animate-tail-float { transform-origin: left bottom; animation: tail-float 3s infinite ease-in-out; }
        .animate-tail-wag-left { transform-origin: right bottom; animation: tail-wag-left 2s infinite ease-in-out; }
        .animate-tail-alert { transform-origin: left bottom; animation: tail-alert 0.5s infinite ease-in-out; }
        .animate-ear-twitch { transform-origin: bottom; animation: ear-twitch 4s infinite; }
        .animate-pupil { animation: pupil-move 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default FloatingWidget;
