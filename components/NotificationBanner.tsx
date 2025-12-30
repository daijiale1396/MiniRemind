
import React, { useState, useEffect } from 'react';
import { X, Check, Coffee, Zap, Droplets, Move, Eye, Sparkles, BellRing } from 'lucide-react';
import { Reminder } from '../types';

interface NotificationBannerProps {
  reminder: Reminder;
  onClose: () => void;
  onComplete: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ reminder, onClose, onComplete }) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // 猫咪眨眼动画
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3500);
    return () => clearInterval(blinkInterval);
  }, []);

  const categoryConfig = {
    water: { icon: <Droplets />, title: "该喝水啦", color: "from-blue-400 to-indigo-600", accent: "text-blue-500", catColor: "#3b82f6" },
    stretch: { icon: <Move />, title: "活动筋骨", color: "from-orange-400 to-rose-500", accent: "text-orange-500", catColor: "#f97316" },
    eye: { icon: <Eye />, title: "远眺远方", color: "from-emerald-400 to-teal-600", accent: "text-emerald-500", catColor: "#10b981" },
    break: { icon: <Coffee />, title: "小憩片刻", color: "from-amber-400 to-orange-600", accent: "text-amber-500", catColor: "#f59e0b" },
    general: { icon: <BellRing />, title: "新的提醒", color: "from-slate-600 to-slate-800", accent: "text-slate-600", catColor: "#64748b" }
  };

  const config = categoryConfig[reminder.category || 'general'];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 select-none">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose}></div>
      
      <div className="relative w-full max-w-[380px] bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.25)] border border-white overflow-hidden animate-in zoom-in-90 slide-in-from-bottom-20 duration-500">
        
        <div className={`h-40 bg-gradient-to-br ${config.color} relative flex items-center justify-center overflow-hidden`}>
          <Sparkles className="absolute left-4 top-4 w-6 h-6 text-white/20 animate-pulse" />
          <div className="absolute -right-6 -bottom-6 opacity-10">
            {React.cloneElement(config.icon as React.ReactElement<any>, { size: 140 })}
          </div>

          <div className="relative z-10 translate-y-4 animate-cat-jump-banner">
             <svg width="120" height="80" viewBox="0 0 100 60" className="drop-shadow-2xl">
                <rect x="20" y="20" width="60" height="40" rx="25" fill="white" />
                <path d="M30 22 L20 8 L40 20 Z" fill="white" />
                <path d="M70 22 L80 8 L60 20 Z" fill="white" />
                {!isBlinking ? (
                  <g>
                    <circle cx="42" cy="38" r="4.5" fill={config.catColor} />
                    <circle cx="58" cy="38" r="4.5" fill={config.catColor} />
                    <circle cx="43" cy="37" r="1.5" fill="white" />
                    <circle cx="59" cy="37" r="1.5" fill="white" />
                  </g>
                ) : (
                  <g stroke={config.catColor} strokeWidth="3" strokeLinecap="round">
                    <line x1="38" y1="38" x2="46" y2="38" />
                    <line x1="54" y1="38" x2="62" y2="38" />
                  </g>
                )}
                <path d="M46 45 Q50 48 54 45" stroke={config.catColor} fill="none" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="32" cy="42" r="3.5" fill="#fda4af" opacity="0.6" />
                <circle cx="68" cy="42" r="3.5" fill="#fda4af" opacity="0.6" />
                <path d="M80 45 C95 45 95 30 90 20" stroke="white" strokeWidth="6" strokeLinecap="round" className="animate-tail-wag-banner origin-left" />
             </svg>
          </div>
        </div>
        
        <div className="px-10 pt-8 pb-10 text-center">
          <div className={`inline-block px-4 py-1.5 rounded-full bg-slate-100 mb-4`}>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.accent}`}>
              {config.title}
            </span>
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 mb-3 leading-tight drop-shadow-sm">
            {reminder.title}
          </h2>
          
          <p className="text-slate-500 text-sm font-medium leading-relaxed px-2 mb-10">
            主人，时间到了哦！<br/>暂时放下手中的活儿，来个深呼吸吧。
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={onComplete}
              className={`flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm shadow-xl hover:bg-black active:scale-95 transition-all group`}
            >
              <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
              立即完成
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-4 bg-slate-100 text-slate-500 rounded-[1.5rem] font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all"
            >
              稍后
            </button>
          </div>
        </div>

        <div className={`h-1.5 w-full bg-gradient-to-r ${config.color} opacity-20`}></div>
      </div>

      <style>{`
        @keyframes cat-jump-banner {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes tail-wag-banner {
          0%, 100% { transform: rotate(0); }
          50% { transform: rotate(20deg); }
        }
        .animate-cat-jump-banner {
          animation: cat-jump-banner 0.6s infinite ease-in-out;
        }
        .animate-tail-wag-banner {
          animation: tail-wag-banner 0.4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationBanner;
