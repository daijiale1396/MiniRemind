
import React from 'react';
import { X, Check, PartyPopper, Coffee, Rocket, Zap, Droplets, Move, Eye } from 'lucide-react';
import { Reminder } from '../types';

interface NotificationBannerProps {
  reminder: Reminder;
  onClose: () => void;
  onComplete: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ reminder, onClose, onComplete }) => {
  const categoryConfig = {
    water: {
      icon: <Droplets />,
      title: "咕嘟时间",
      messages: ["该补充水分啦，吨吨吨~", "你是水做的，快去喝杯水！", "水是生命之源，喝点水清醒一下。"],
      theme: "from-blue-400 to-cyan-500"
    },
    stretch: {
      icon: <Move />,
      title: "动一动",
      messages: ["站起来扭扭腰，别当‘久坐族’！", "伸个大懒腰，活动下筋骨吧。", "起立！走两步，看看窗外。"],
      theme: "from-orange-400 to-red-500"
    },
    eye: {
      icon: <Eye />,
      title: "给眼放假",
      messages: ["闭目养神 30 秒，放松眼球。", "看看远方的绿植，缓解视疲劳。", "眨眨眼，拒绝‘干眼症’。"],
      theme: "from-green-400 to-emerald-600"
    },
    break: {
      icon: <Coffee />,
      title: "休息一下",
      messages: ["深呼吸三次，清空脑袋。", "喝杯茶或咖啡，小憩片刻。", "工作是做不完的，休息是为了走更远。"],
      theme: "from-amber-400 to-yellow-600"
    },
    general: {
      icon: <Zap />,
      title: "别忘记啦",
      messages: ["时候不早了，该去处理这事了。", "记得这件事吗？现在是时候了！", "嘿！看这里，有个任务该动身了。"],
      theme: "from-slate-700 to-slate-900"
    }
  };

  const config = categoryConfig[reminder.category || 'general'];
  const randomMsg = config.messages[Math.floor(Math.random() * config.messages.length)];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-sm rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-90 slide-in-from-bottom-20 duration-500">
        <div className={`h-32 bg-gradient-to-br ${config.theme} flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 scale-150 rotate-12">
             {React.cloneElement(config.icon as React.ReactElement<any>, { size: 120 })}
          </div>
          <div className="bg-white/20 p-5 rounded-[2rem] text-white shadow-inner backdrop-blur-md animate-bounce">
            {React.cloneElement(config.icon as React.ReactElement<any>, { size: 40 })}
          </div>
        </div>
        
        <div className="p-10 flex flex-col items-center text-center">
          <span className="text-slate-400 font-black text-[10px] mb-2 tracking-[0.3em] uppercase">{config.title}</span>
          <h2 className="text-2xl font-black text-slate-800 mb-4">{reminder.title}</h2>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
            "{randomMsg}"
          </p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={onComplete}
              className="flex-1 flex items-center justify-center gap-2 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl active:scale-95 transition-all"
            >
              好滴，搞定
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-5 bg-slate-100 text-slate-500 rounded-[1.5rem] font-bold hover:bg-slate-200 active:scale-95 transition-all"
            >
              等会
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
