
import React from 'react';
import { Clock, CheckCircle2, Circle, Trash2, Droplets, Move, Eye, Coffee, Bell, RefreshCw } from 'lucide-react';
import { Reminder, Priority } from '../types';

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onToggle, onDelete, onEdit }) => {
  const isPast = reminder.mode === 'once' && new Date(reminder.time) < new Date() && !reminder.isCompleted;
  
  const categoryIcons = {
    general: <Bell className="w-4 h-4" />,
    water: <Droplets className="w-4 h-4 text-blue-500" />,
    stretch: <Move className="w-4 h-4 text-orange-500" />,
    eye: <Eye className="w-4 h-4 text-green-500" />,
    break: <Coffee className="w-4 h-4 text-amber-600" />,
  };

  const repeatLabel = reminder.repeatType === 'workdays' ? '工作日' : '每天';

  return (
    <div className={`group bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all ${
      reminder.isCompleted ? 'opacity-40 grayscale-[0.5]' : ''
    }`}>
      <div className="flex gap-4">
        <button 
          onClick={onToggle}
          className={`shrink-0 mt-1 transition-transform active:scale-75 ${reminder.isCompleted ? 'text-green-500' : 'text-slate-200 hover:text-blue-500'}`}
        >
          {reminder.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6 stroke-[3px]" />}
        </button>
        
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
          <div className="flex items-center gap-2 mb-1">
            <span className="shrink-0">{categoryIcons[reminder.category || 'general']}</span>
            <h3 className={`font-black text-slate-800 text-base truncate ${reminder.isCompleted ? 'line-through text-slate-400' : ''}`}>
              {reminder.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 ${isPast ? 'text-red-500 bg-red-50' : 'text-slate-400'}`}>
              <Clock className="w-3 h-3" />
              {reminder.mode === 'once' 
                ? new Date(reminder.time).toLocaleString('zh-CN', { hour: 'numeric', minute: '2-digit' })
                : `${reminder.startTime}-${reminder.endTime}`}
            </div>
            {reminder.mode === 'interval' && (
              <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                <RefreshCw className="w-3 h-3" />
                {repeatLabel} · 每{reminder.intervalMinutes}分
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ReminderCard;
