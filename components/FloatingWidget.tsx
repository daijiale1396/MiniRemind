
import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Palette, Check, X, Coffee, Droplets, Move, Eye, Bell } from 'lucide-react';
import { Reminder, WidgetTheme } from '../types';

interface FloatingWidgetProps {
  reminder: Reminder | null;
  theme: WidgetTheme;
  setTheme: (theme: WidgetTheme) => void;
  onExpand: () => void;
  activeAlert: Reminder | null;
  onCompleteAlert: () => void;
  onCloseAlert: () => void;
}

type CatState = 'sleeping' | 'chill' | 'active' | 'reminding' | 'triggered';

// 将样式移出组件，解决编译时的字符串解析问题
const WIDGET_ANIMATIONS = `
  @keyframes sleep-breath { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08, 1.02); } }
  @keyframes normal-breath { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.05); } }
  @keyframes cat-jump { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
  @keyframes bubble-in { 
    0% { transform: translate(-50%, 30px) scale(0.85); opacity: 0; } 
    100% { transform: translate(-50%, 0) scale(1); opacity: 1; } 
  }
  .animate-sleep-breath { animation: sleep-breath 4s infinite ease-in-out; transform-origin: bottom; }
  .animate-normal-breath { animation: normal-breath 3.5s infinite ease-in-out; transform-origin: bottom; }
  .animate-cat-jump { animation: cat-jump 0.5s infinite ease-in-out; }
  .animate-bubble-in { animation: bubble-in 0.6s cubic-bezier(0.2, 1.2, 0.4, 1) forwards; }
`;

const FloatingWidget: React.FC<FloatingWidgetProps> = ({ 
  reminder, theme, setTheme, onExpand, activeAlert, onCompleteAlert, onCloseAlert 
}) => {
  const [timeLeft, setTimeLeft] = useState('--:--');
  const [catState, setCatState] = useState<CatState>('chill');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const lastInteractionRef = useRef(Date.now());

  const categoryConfigs: any = {
    water: { icon: <Droplets className="w-6 h-6" />, color: "bg-blue-500", label: "补水计划", msg: "摄入水分，保持细胞活力。" },
    stretch: { icon: <Move className="w-6 h-6" />, color: "bg-orange-500", label: "该运动了", msg: "监测到久坐，请起立活动。" },
    eye: { icon: <Eye className="w-6 h-6" />, color: "bg-emerald-500", label: "护眼时刻", msg: "远眺远方，缓解视觉疲劳。" },
    break: { icon: <Coffee className="w-6 h-6" />, color: "bg-[#FF9F00]", label: "小憩充电", msg: "正在进入休眠模式，请暂停所有线程。" },
    general: { icon: <Bell className="w-6 h-6" />, color: "bg-slate-800", label: "特别提醒", msg: "计划时间已到，请确认执行。" }
  };

  const currentAlertConfig = activeAlert ? categoryConfigs[activeAlert.category || 'general'] : null;

  const themes = {
    glass: { cat: "#475569", accent: "text-slate-700" },
    cyber: { cat: "#1e293b", accent: "text-blue-400" },
    retro: { cat: "#57534e", accent: "text-stone-700" },
    sakura: { cat: "#db2777", accent: "text-pink-600" }
  };
  const currentTheme = themes[theme] || themes.glass;

  useEffect(() => {
    const handleActivity = () => {
      lastInteractionRef.current = Date.now();
      if (isCollapsed) setIsCollapsed(false);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);

    const timer = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastInteractionRef.current;
      
      if (idleTime > 30000 && !activeAlert && !isCollapsed) {
        setIsCollapsed(true);
      }

      if (reminder && !activeAlert) {
        let target: number;
        if (reminder.mode === 'once') {
          target = new Date(reminder.time).getTime();
        } else {
          const lastTime = reminder.lastTriggeredAt || reminder.createdAt;
          target = lastTime + (reminder.intervalMinutes || 30) * 60000;
        }
        
        const diffSecs = Math.max(0, Math.floor((target - now) / 1000));
        const m = Math.floor(diffSecs / 60);
        const s = diffSecs % 60;
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        
        if (diffSecs <= 0) setCatState('triggered');
        else if (diffSecs < 60) setCatState('reminding');
        else if (diffSecs < 600) setCatState('active');
        else setCatState('chill');
      } else if (!reminder) {
        setTimeLeft('Zzz');
        setCatState('sleeping');
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      clearInterval(timer);
    };
  }, [reminder, activeAlert, isCollapsed]);

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const themeList: WidgetTheme[] = ['glass', 'cyber', 'retro', 'sakura'];
    const currentIndex = themeList.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeList.length;
    setTheme(themeList[nextIndex]);
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center bg-transparent overflow-visible"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <style dangerouslySetInnerHTML={{ __html: WIDGET_ANIMATIONS }} />
      
      {activeAlert && (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[380px] bg-white rounded-full shadow-[0_25px_60px_rgba(0,0,0,0.12)] p-2.5 flex items-center gap-4 animate-bubble-in z-[100] border border-white/50 no-drag">
          <div className={`w-14 h-14 rounded-full ${currentAlertConfig?.color} flex items-center justify-center text-white shrink-0 shadow-lg shadow-black/10`}>
            {currentAlertConfig?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
               <span className="text-blue-500 font-black text-[10px] flex items-center gap-1 uppercase tracking-wider">
                 <Sparkles className="w-3.5 h-3.5" /> {currentAlertConfig?.label}
               </span>
            </div>
            <h3 className="text-[15px] font-black text-slate-800 leading-tight truncate">{activeAlert.title}</h3>
            <p className="text-[11px] text-slate-400 font-bold truncate opacity-90">{currentAlertConfig?.msg}</p>
          </div>
          <div className="flex items-center gap-2 pr-2.5">
            <button 
              onClick={(e) => { e.stopPropagation(); onCompleteAlert(); }}
              className="w-11 h-11 bg-[#2B6CFF] text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-all active:scale-90 shadow-md shadow-blue-200"
            >
              <Check className="w-6 h-6" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onCloseAlert(); }}
              className="w-9 h-9 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className={`flex flex-col items-center group transition-all duration-1000 cubic-bezier(0.23, 1, 0.32, 1) ${isCollapsed ? 'translate-x-[62px] opacity-70 hover:translate-x-[45px] hover:opacity-100' : 'translate-x-0 opacity-100'}`}>
        <div className={`relative mb-[-10px] transition-transform duration-500 ${catState === 'triggered' ? 'animate-cat-jump' : ''}`}>
           <svg width="90" height="58" viewBox="0 0 100 60">
              <rect x="20" y="20" width="60" height="40" rx="25" fill={currentTheme.cat} className={catState === 'sleeping' ? 'animate-sleep-breath' : 'animate-normal-breath'} />
              <path d="M30 22 L22 10 L38 20 Z" fill={currentTheme.cat} />
              <path d="M70 22 L78 10 L62 20 Z" fill={currentTheme.cat} />
              <g opacity="0.9">
                {catState === 'sleeping' ? (
                  <path d="M38 35 Q42 38 46 35 M54 35 Q58 38 62 35" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                ) : (
                  <g fill="white">
                    <circle cx="42" cy="35" r="4.5" />
                    <circle cx="58" cy="35" r="4.5" />
                    <circle cx="42" cy="35" r="2" fill="black" />
                    <circle cx="58" cy="35" r="2" fill="black" />
                  </g>
                )}
              </g>
           </svg>
        </div>

        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border bg-white border-slate-100 shadow-2xl transition-all duration-700 ${isCollapsed ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100 shadow-black/5'}`}>
          <div className="flex flex-col pr-3 border-r border-slate-100 leading-tight">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">NEXT</span>
            <span className={`text-xs font-black tabular-nums tracking-tight ${currentTheme.accent}`}>{timeLeft}</span>
          </div>
          <div className="flex gap-1.5 no-drag">
            <button onClick={toggleTheme} className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors group/btn relative z-[110]" title="切换主题">
              <Palette className="w-4 h-4 text-slate-300 group-hover/btn:text-slate-600" />
            </button>
            <button onClick={onExpand} className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors group/btn relative z-[110]" title="回到主界面">
              <Maximize2 className="w-4 h-4 text-slate-300 group-hover/btn:text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l.5 2.5L8 6l-2.5.5L5 9l-.5-2.5L2 6l2.5-.5L5 3zM19 15l.5 2.5L22 18l-2.5.5L19 21l-.5-2.5L16 18l2.5-.5L19 15zM14 7l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4z" />
  </svg>
);

export default FloatingWidget;
