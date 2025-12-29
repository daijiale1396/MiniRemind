
import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Flag, Clock, RefreshCw, Timer, Droplets, Move, Eye, Coffee, Bell, Music, Upload, Volume2 } from 'lucide-react';
import { Reminder, Priority, ReminderCategory, RepeatType } from '../types';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData: Reminder | null;
}

const PRESET_SOUNDS = [
  { name: '默认', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { name: '清脆', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  { name: '数码', url: 'https://assets.mixkit.co/active_storage/sfx/1003/1003-preview.mp3' },
  { name: '灵动', url: 'https://assets.mixkit.co/active_storage/sfx/999/999-preview.mp3' },
];

const CATEGORY_CONFIG: Record<string, { label: string; keywords: string[] }> = {
  water: { label: '喝水', keywords: ['水', '渴', '饮', 'water'] },
  stretch: { label: '动一下', keywords: ['动', '站', '走', '运动', '伸展', 'stretch'] },
  eye: { label: '护眼', keywords: ['眼', '看', '视', '绿', 'eye'] },
  break: { label: '休息', keywords: ['休', '息', '停', '茶', '咖啡', 'break', 'coffee'] },
};

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        title: initialData.title,
        category: initialData.category || 'general',
        mode: initialData.mode || 'once',
        repeatType: initialData.repeatType || 'none',
        time: initialData.time || '',
        startTime: initialData.startTime || '09:00',
        endTime: initialData.endTime || '18:00',
        intervalMinutes: initialData.intervalMinutes || 30,
        priority: initialData.priority,
        soundUrl: initialData.soundUrl || PRESET_SOUNDS[0].url,
      };
    }
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    return {
      title: '',
      category: 'general' as ReminderCategory,
      mode: 'once' as 'once' | 'interval',
      repeatType: 'none' as RepeatType,
      time: localTime,
      startTime: '09:00',
      endTime: '18:00',
      intervalMinutes: 30,
      priority: Priority.Medium,
      soundUrl: PRESET_SOUNDS[0].url,
    };
  });

  const [isCustomTitleMode, setIsCustomTitleMode] = useState(false);
  const userManuallySelected = useRef(!!initialData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'general', label: '通用', icon: <Bell className="w-4 h-4" /> },
    { id: 'water', label: '喝水', icon: <Droplets className="w-4 h-4 text-blue-500" /> },
    { id: 'stretch', label: '动一下', icon: <Move className="w-4 h-4 text-orange-500" /> },
    { id: 'eye', label: '护眼', icon: <Eye className="w-4 h-4 text-green-500" /> },
    { id: 'break', label: '休息', icon: <Coffee className="w-4 h-4 text-amber-600" /> },
  ];

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setIsCustomTitleMode(true);
    
    setFormData(prev => {
      let nextCategory = prev.category;
      let matchFound = false;

      for (const [id, config] of Object.entries(CATEGORY_CONFIG)) {
        if (config.keywords.some(kw => newTitle.toLowerCase().includes(kw))) {
          nextCategory = id as ReminderCategory;
          matchFound = true;
          break;
        }
      }

      if (!matchFound && newTitle.trim() !== '') {
        nextCategory = 'general';
      }

      return { ...prev, title: newTitle, category: nextCategory };
    });
  };

  const handleCategoryClick = (catId: ReminderCategory, catLabel: string) => {
    setIsCustomTitleMode(false);
    userManuallySelected.current = true;
    setFormData(prev => ({
      ...prev,
      category: catId,
      title: catId === 'general' ? (isCustomTitleMode ? prev.title : '') : catLabel
    }));
  };

  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({ ...prev, soundUrl: base64 }));
        const audio = new Audio(base64);
        audio.play();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{initialData ? '修改提醒' : '新建任务'}</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">任务分类</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {categories.map(cat => {
                const isMatch = Object.entries(CATEGORY_CONFIG).some(([id, cfg]) => 
                  id === cat.id && cfg.keywords.some(kw => formData.title.toLowerCase().includes(kw))
                );
                const isActive = formData.category === cat.id && (!isCustomTitleMode || isMatch || cat.id !== 'general' || formData.title === '');
                
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id as any, cat.label)}
                    className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all border-2 shrink-0 ${
                      isActive ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {cat.icon}
                    <span className="text-xs font-bold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">任务名称</label>
            <input
              type="text"
              required
              placeholder="例如：准备会议资料..."
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm"
              value={formData.title}
              onChange={handleTitleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, mode: 'once' }))}
              className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all font-bold text-sm ${
                formData.mode === 'once' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'
              }`}
            >
              <Clock className="w-4 h-4" /> 单次提醒
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, mode: 'interval' }))}
              className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all font-bold text-sm ${
                formData.mode === 'interval' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'
              }`}
            >
              <RefreshCw className="w-4 h-4" /> 周期重复
            </button>
          </div>

          {formData.mode === 'once' ? (
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">触发时间</label>
              <input
                type="datetime-local"
                required
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          ) : (
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">开始</label>
                  <input type="time" className="w-full bg-transparent font-bold outline-none" value={formData.startTime} onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">结束</label>
                  <input type="time" className="w-full bg-transparent font-bold outline-none" value={formData.endTime} onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))} />
                </div>
              </div>
              <div className="pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">频率: {formData.intervalMinutes}分钟</label>
                <input 
                  type="range" 
                  min="1" 
                  max="120" 
                  step="1" 
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2" 
                  value={formData.intervalMinutes} 
                  onChange={(e) => setFormData(prev => ({ ...prev, intervalMinutes: parseInt(e.target.value) }))} 
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
             <div className="flex items-center justify-between ml-1">
               <label className="text-xs font-black text-slate-400 uppercase tracking-widest">提示音</label>
               <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-blue-600 flex items-center gap-1">
                 <Upload className="w-3 h-3" /> 自定义音频
               </button>
               <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleSoundUpload} />
             </div>
             <div className="grid grid-cols-2 gap-2">
               {PRESET_SOUNDS.slice(0, 2).map(sound => (
                 <button
                   key={sound.name}
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, soundUrl: sound.url }))}
                   className={`px-4 py-3 rounded-xl border-2 text-xs font-bold transition-all ${formData.soundUrl === sound.url ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'}`}
                 >
                   {sound.name}
                 </button>
               ))}
             </div>
          </div>

          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all mt-4 text-sm">
            {initialData ? '确认修改' : '立即创建任务'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;
