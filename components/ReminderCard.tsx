
import React from 'react';
import { Clock, RefreshCw, Bell, Droplets, Move, Eye, Coffee, CheckCircle2 } from 'lucide-react';
import { Reminder } from '../types';

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onToggle, onEdit }) => {
  const isInterval = reminder.mode === 'interval';
  const isOnceCompleted = reminder.isCompleted && !isInterval;

  const categoryIcons = {
    general: <Bell className="w-4 h-4 text-slate-400" />,
    water: <Droplets className="w-4 h-4 text-blue-500" />,
    stretch: <Move className="w-4 h-4 text-orange-500" />,
    eye: <Eye className="w-4 h-4 text-emerald-500" />,
    break: <Coffee className="w-4 h-4 text-amber-600" />,
  };

  return (
    <div className={`group bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex items-center gap-6 ${isOnceCompleted ? 'opacity-40 grayscale' : ''}`}>
      <button 
        onClick={onToggle}
        className={`w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 ${
          isOnceCompleted 
            ? 'bg-blue-600 border-blue-600 text-white' 
            : 'border-slate-100 hover:border-blue-400 bg-slate-50'
        }`}
      >
        {isOnceCompleted ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-3 h-3 rounded-lg bg-transparent group-hover:bg-blue-100 transition-colors" />}
      </button>

      <div className="flex-1 flex items-center gap-6 cursor-pointer" onClick={onEdit}>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
             <div className="shrink-0">{categoryIcons[reminder.category || 'general']}</div>
             <h3 className="font-black text-slate-800 text-base truncate">{reminder.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isInterval ? `累计打卡 · ${reminder.completedCount || 0} 次` : '单次任务'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-black text-slate-500 tabular-nums uppercase tracking-wider">
              {reminder.mode === 'once' 
                ? new Date(reminder.time).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                : `${reminder.startTime}-${reminder.endTime}`}
            </span>
          </div>

          {isInterval && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl">
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
                每{reminder.intervalMinutes}分钟
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderCard;
