
import React, { useState, useEffect } from 'react';
// Added Bell to the import list from lucide-react
import { X, Calendar, Flag, Clock, RefreshCw, Timer, Droplets, Move, Eye, Coffee, Bell } from 'lucide-react';
import { Reminder, Priority, ReminderCategory, RepeatType } from '../types';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData: Reminder | null;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'general' as ReminderCategory,
    mode: 'once' as 'once' | 'interval',
    repeatType: 'none' as RepeatType,
    time: '',
    startTime: '09:00',
    endTime: '18:00',
    intervalMinutes: 30,
    priority: Priority.Medium,
  });

  const categories = [
    { id: 'general', label: '通用', icon: <Bell className="w-4 h-4" /> },
    { id: 'water', label: '喝水', icon: <Droplets className="w-4 h-4 text-blue-500" /> },
    { id: 'stretch', label: '动一下', icon: <Move className="w-4 h-4 text-orange-500" /> },
    { id: 'eye', label: '护眼', icon: <Eye className="w-4 h-4 text-green-500" /> },
    { id: 'break', label: '休息', icon: <Coffee className="w-4 h-4 text-amber-600" /> },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        category: initialData.category || 'general',
        mode: initialData.mode || 'once',
        repeatType: initialData.repeatType || 'none',
        time: initialData.time || '',
        startTime: initialData.startTime || '09:00',
        endTime: initialData.endTime || '18:00',
        intervalMinutes: initialData.intervalMinutes || 30,
        priority: initialData.priority,
      });
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 10);
      const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, title: '', category: 'general', time: localTime, mode: 'once', repeatType: 'none' }));
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{initialData ? '修改提醒' : '新提醒'}</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar">
          {/* 分类选择 */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData(p => ({ ...p, category: cat.id as any, title: p.title || (cat.id !== 'general' ? cat.label : '') }))}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all border-2 shrink-0 ${
                  formData.category === cat.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white'
                }`}
              >
                {cat.icon}
                <span className={`text-[10px] font-bold ${formData.category === cat.id ? 'text-blue-600' : 'text-slate-400'}`}>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">任务名称</label>
            <input 
              required autoFocus
              type="text" 
              placeholder="做什么？"
              className="w-full text-2xl font-bold border-none focus:ring-0 outline-none placeholder:text-slate-200"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, mode: 'once' }))}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.mode === 'once' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              单次
            </button>
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, mode: 'interval' }))}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.mode === 'interval' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              周期重复
            </button>
          </div>

          {formData.mode === 'once' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Calendar className="w-5 h-5 text-blue-500" />
                <input 
                  required
                  type="datetime-local" 
                  className="bg-transparent border-none w-full text-sm font-bold outline-none"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, repeatType: 'daily' }))}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${formData.repeatType === 'daily' || formData.repeatType === 'none' ? 'bg-white text-blue-600' : 'text-slate-500'}`}
                >
                  每天
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, repeatType: 'workdays' }))}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${formData.repeatType === 'workdays' ? 'bg-white text-blue-600' : 'text-slate-500'}`}
                >
                  工作日
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">开始</span>
                  <input type="time" className="bg-transparent text-sm font-bold w-full outline-none" value={formData.startTime} onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))} />
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">结束</span>
                  <input type="time" className="bg-transparent text-sm font-bold w-full outline-none" value={formData.endTime} onChange={e => setFormData(p => ({ ...p, endTime: e.target.value }))} />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Timer className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-bold">间隔分钟</span>
                </div>
                <input 
                  type="number" 
                  className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  value={formData.intervalMinutes}
                  onChange={e => setFormData(p => ({ ...p, intervalMinutes: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 text-white font-black rounded-[2rem] shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
          >
            就这样吧，设好了
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;
