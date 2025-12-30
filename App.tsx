
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ReminderCard from './components/ReminderCard';
import ReminderModal from './components/ReminderModal';
import HealthInsights from './components/HealthInsights';
import FloatingWidget from './components/FloatingWidget';
import NotificationBanner from './components/NotificationBanner';
import { Reminder, HealthGoal, WidgetTheme, ReminderCategory } from './types';

const STORAGE_KEY = 'miniremind_pro_v3_colorful_stable';

const App: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'completed' | 'dashboard' | 'all'>('upcoming');
  const [windowMode, setWindowMode] = useState<'main' | 'widget'>('main');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [activeAlert, setActiveAlert] = useState<Reminder | null>(null);
  const [widgetTheme, setWidgetTheme] = useState<WidgetTheme>('glass');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const handleToggle = () => {
      setWindowMode(prev => {
        const next = prev === 'main' ? 'widget' : 'main';
        window.electronAPI?.setWindowMode(next);
        return next;
      });
    };
    window.electronAPI?.onToggleWidgetMode(handleToggle);
  }, []);

  // 核心轮询：1秒一次，确保精准
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let hasTriggered = false;
      
      const updated = reminders.map(r => {
        if (r.isCompleted && r.mode === 'once') return r;
        
        let shouldTrigger = false;
        if (r.mode === 'once') {
          shouldTrigger = !r.isCompleted && new Date(r.time).getTime() <= now;
        } else if (r.mode === 'interval') {
          const [startH, startM] = (r.startTime || '00:00').split(':').map(Number);
          const [endH, endM] = (r.endTime || '23:59').split(':').map(Number);
          const nowObj = new Date();
          const currentMins = nowObj.getHours() * 60 + nowObj.getMinutes();
          const startMinsTotal = startH * 60 + startM;
          const endMinsTotal = endH * 60 + endM;

          if (currentMins >= startMinsTotal && currentMins <= endMinsTotal) {
            const lastTime = r.lastTriggeredAt || r.createdAt;
            const intervalMs = (r.intervalMinutes || 30) * 60000;
            shouldTrigger = now >= lastTime + intervalMs && activeAlert?.id !== r.id;
          }
        }
        
        if (shouldTrigger && activeAlert?.id !== r.id) {
          setActiveAlert(r);
          hasTriggered = true;
          new Audio(r.soundUrl || 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
          window.electronAPI?.sendNotification({ title: '提醒', body: r.title });
          return { ...r, lastTriggeredAt: now };
        }
        return r;
      });
      
      if (hasTriggered) setReminders(updated);
    }, 1000); 
    return () => clearInterval(timer);
  }, [reminders, activeAlert]);

  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      
      if (activeFilter === 'upcoming') {
        return !r.isCompleted || r.mode === 'interval';
      }
      if (activeFilter === 'completed') {
        return r.isCompleted && r.mode === 'once';
      }
      return true;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [reminders, activeFilter, searchQuery]);

  const healthGoals: HealthGoal[] = useMemo(() => {
    const cats: {category: ReminderCategory, label: string, target: number}[] = [
      { category: 'water', label: '补水', target: 8 },
      { category: 'stretch', label: '拉伸', target: 4 },
      { category: 'eye', label: '护眼', target: 6 },
      { category: 'break', label: '间歇', target: 2 },
    ];
    return cats.map(cat => ({
      ...cat,
      current: reminders.filter(r => r.category === cat.category).reduce((acc, curr) => acc + (curr.completedCount || 0), 0),
    }));
  }, [reminders]);

  const handleAddOrEdit = (data: Partial<Reminder>) => {
    if (editingReminder) {
      setReminders(prev => prev.map(r => 
        r.id === editingReminder.id ? { ...r, ...data } : r
      ));
    } else {
      const newReminder: Reminder = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        isCompleted: false,
        completedCount: 0,
        ...data,
      } as Reminder;
      setReminders(prev => [newReminder, ...prev]);
    }
    setIsModalOpen(false);
    setEditingReminder(null);
  };

  const handleComplete = (reminder: Reminder) => {
    setReminders(prev => prev.map(r => {
      if (r.id === reminder.id) {
        const now = Date.now();
        if (r.mode === 'once') {
          return { ...r, isCompleted: true, lastCompletedAt: now, completedCount: (r.completedCount || 0) + 1 };
        } else {
          return { ...r, lastTriggeredAt: now, lastCompletedAt: now, completedCount: (r.completedCount || 0) + 1 };
        }
      }
      return r;
    }));
    if (activeAlert?.id === reminder.id) setActiveAlert(null);
  };

  if (windowMode === 'widget') {
    return (
      <FloatingWidget 
        reminder={reminders.filter(r => !r.isCompleted || r.mode === 'interval')[0] || null} 
        theme={widgetTheme} 
        setTheme={setWidgetTheme} 
        onExpand={() => { setWindowMode('main'); window.electronAPI?.setWindowMode('main'); }}
        activeAlert={activeAlert} 
        onCompleteAlert={() => activeAlert && handleComplete(activeAlert)} 
        onCloseAlert={() => setActiveAlert(null)}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans select-none">
      {activeAlert && (
        <NotificationBanner 
          reminder={activeAlert} 
          onClose={() => setActiveAlert(null)} 
          onComplete={() => handleComplete(activeAlert)} 
        />
      )}

      <Sidebar 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter} 
        stats={{ 
          total: reminders.length, 
          upcoming: reminders.filter(r => !r.isCompleted || r.mode === 'interval').length, 
          completed: reminders.filter(r => r.isCompleted).length 
        }} 
        onToggleWidget={() => { setWindowMode('widget'); window.electronAPI?.setWindowMode('widget'); }}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        <header className="px-10 py-8 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md">
          <div className="flex-1 max-w-md relative group no-drag">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="寻找你的计划..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingReminder(null); setIsModalOpen(true); }}
            className="ml-6 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all no-drag"
          >
            <Plus className="w-5 h-5" /> 新建任务
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-10 no-scrollbar">
          {activeFilter === 'dashboard' ? (
            <HealthInsights goals={healthGoals} />
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {activeFilter === 'upcoming' ? '正在进行' : activeFilter === 'completed' ? '已完成' : '全部'}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-amber-400" /> 保持节奏，成就自我
                  </p>
                </div>
              </div>
              
              {filteredReminders.length > 0 ? (
                <div className="grid gap-4">
                  {filteredReminders.map(reminder => (
                    <ReminderCard 
                      key={reminder.id} 
                      reminder={reminder} 
                      onToggle={() => handleComplete(reminder)}
                      onDelete={() => setReminders(prev => prev.filter(r => r.id !== reminder.id))}
                      onEdit={() => { setEditingReminder(reminder); setIsModalOpen(true); }}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-32 flex flex-col items-center justify-center text-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Plus className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-bold text-xs uppercase tracking-widest text-slate-400">还没有任何提醒</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <ReminderModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingReminder(null); }} 
        onSubmit={handleAddOrEdit} 
        initialData={editingReminder} 
      />
    </div>
  );
};

export default App;
