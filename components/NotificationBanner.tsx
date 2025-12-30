
import React from 'react';
import { X, Check, Droplets, Move, Eye, Coffee, BellRing, Sparkles } from 'lucide-react';
import { Reminder } from '../types';

interface NotificationBannerProps {
  reminder: Reminder;
  onClose: () => void;
  onComplete: () => void;
}

const FUN_MESSAGES = {
  water: ["该给身体的核心模块进行水冷降温了。", "监测到 H2O 存储过低，请手动补充。", "与其等到口渴，不如现在就吨吨吨。"],
  stretch: ["久坐会导致 CPU 散热不良，请起立活动。", "你的脊椎正在向你发送错误报告。", "站起来呼吸，外面的空气比显示器前的更香。"],
  eye: ["监测到视觉占用率 99%，请强制休息。", "远方的风景比代码和表格更有利于眼部刷新。", "让瞳孔对焦到无限远。"],
  break: ["正在进入休眠模式，请暂停所有线程。", "灵魂需要追上你的身体，歇会儿吧。", "摸鱼不仅是休息，更是一种智慧。"],
  general: ["时间轴已到达指定节点。", "请查看你的待办清单。", "不要拖延，这是最后的通牒。"]
};

const NotificationBanner: React.FC<NotificationBannerProps> = ({ reminder, onClose, onComplete }) => {
  const categoryConfig = {
    water: { icon: <Droplets />, title: "补水计划", color: "bg-blue-500", shadow: "shadow-blue-200" },
    stretch: { icon: <Move />, title: "拒绝久坐", color: "bg-orange-500", shadow: "shadow-orange-200" },
    eye: { icon: <Eye />, title: "护眼卫士", color: "bg-emerald-500", shadow: "shadow-emerald-200" },
    break: { icon: <Coffee />, title: "小憩充电", color: "bg-amber-500", shadow: "shadow-amber-200" },
    general: { icon: <BellRing />, title: "重要提醒", color: "bg-slate-800", shadow: "shadow-slate-300" }
  };

  const config = categoryConfig[reminder.category || 'general'];
  const messages = FUN_MESSAGES[reminder.category || 'general'];
  const randomMsg = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[2000] w-full max-w-[440px] px-6 select-none animate-in slide-in-from-top-12 duration-700">
      <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] overflow-hidden flex items-center p-3 gap-4">
        <div className={`w-14 h-14 rounded-[1.5rem] ${config.color} flex items-center justify-center text-white shrink-0 shadow-lg ${config.shadow} animate-bounce`}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-0.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> {config.title}
          </p>
          <h3 className="text-sm font-black text-slate-800 truncate">{reminder.title}</h3>
          <p className="text-[11px] font-bold text-slate-400 truncate opacity-80">{randomMsg}</p>
        </div>

        <div className="flex gap-2 pr-1">
           <button 
             onClick={onComplete}
             className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all active:scale-90 shadow-md shadow-blue-100"
           >
             <Check className="w-6 h-6" />
           </button>
           <button 
             onClick={onClose}
             className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all active:scale-90"
           >
             <X className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
