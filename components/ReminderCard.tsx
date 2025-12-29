
import React from 'react';
import { Clock, CheckCircle2, Circle, Trash2, Droplets, Move, Eye, Coffee, Bell, RefreshCw, MoreVertical } from 'lucide-react';
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
    <div className={`group bg-white border border-black/5 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all ${
      reminder.isCompleted ? 'opacity-50' : ''
    }`}>
      <div className="flex gap-4">
        <button 
          onClick={onToggle}
          className={`shrink-0 mt-1 transition-transform active:scale-75 ${reminder.isCompleted ? 'text-green-500' : 'text-slate-200 hover:text-blue-500'}`}
        >
          {reminder.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 stroke-[2.5px]" />}
        </button>
        
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="shrink-0 opacity-80">{categoryIcons[reminder.category || 'general']}</span>
            <h3 className={`font-bold text-slate-800 text-sm truncate ${reminder.isCompleted ? 'line-through text-slate-400' : ''}`}>
              {reminder.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${isPast ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-50'}`}>
              <Clock className="w-3 h-3" />
              {reminder.mode === 'once' 
                ? new Date(reminder.time).toLocaleString('zh-CN', { hour: 'numeric', minute: '2-digit' })
                : `${reminder.startTime}-${reminder.endTime}`}
            </div>
            {reminder.mode === 'interval' && (
              <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                <RefreshCw className="w-3 h-3" />
                {repeatLabel} · 每{reminder.intervalMinutes}分
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderCard;
