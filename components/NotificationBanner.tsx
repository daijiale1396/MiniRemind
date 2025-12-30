
import React, { useMemo } from 'react';
import { X, Check, Coffee, Zap, Droplets, Move, Eye, Sparkles } from 'lucide-react';
import { Reminder } from '../types';

interface NotificationBannerProps {
  reminder: Reminder;
  onClose: () => void;
  onComplete: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ reminder, onClose, onComplete }) => {
  const categoryConfig = {
    water: { icon: <Droplets />, title: "喝口水吧", color: "from-blue-500 to-indigo-600", bg: "bg-blue-50" },
    stretch: { icon: <Move />, title: "动动身子", color: "from-orange-500 to-amber-600", bg: "bg-orange-50" },
    eye: { icon: <Eye />, title: "护眼时刻", color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50" },
    break: { icon: <Coffee />, title: "休息一下", color: "from-amber-500 to-orange-600", bg: "bg-amber-50" },
    general: { icon: <Zap />, title: "小提醒", color: "from-slate-700 to-slate-900", bg: "bg-slate-50" }
  };

  const config = categoryConfig[reminder.category || 'general'];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-black/5 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className={`h-28 bg-gradient-to-br ${config.color} flex items-center justify-between px-10 relative overflow-hidden`}>
          <div className="text-white z-10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">New Message</p>
            <h3 className="text-2xl font-black">{config.title}</h3>
          </div>
          <div className="bg-white/20 p-4 rounded-3xl text-white backdrop-blur-md z-10">
            {/* 
               Fix: Cast to React.ReactElement<any> to allow additional props in cloneElement. 
               The generic ReactElement defaults to unknown props in some strict environments, 
               which causes an error when passing Lucide-specific props like size.
            */}
            {React.cloneElement(config.icon as React.ReactElement<any>, { size: 32, strokeWidth: 2.5 })}
          </div>
          <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
        </div>
        
        <div className="p-10 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">{reminder.title}</h2>
          <p className="text-slate-400 text-sm font-medium mb-8">嘿！时间到了，完成这个小任务来保持良好的状态吧！</p>
          
          <div className="flex gap-3">
            <button 
              onClick={onComplete}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" /> 完成
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all"
            >
              稍后
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
