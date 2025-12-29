import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Bell, Calendar, CheckCircle2, Clock, Plus, Search, Trash2, ShieldCheck, LayoutDashboard, Minimize2, Maximize2, Activity, Github, X, Minus, Square } from 'lucide-react';
import { Reminder, Priority, HealthGoal, WidgetTheme } from './types';
import ReminderCard from './components/ReminderCard';
import ReminderModal from './components/ReminderModal';
import NotificationBanner from './components/NotificationBanner';
import HealthInsights from './components/HealthInsights';
import FloatingWidget from './components/FloatingWidget';

const STORAGE_KEY = 'miniremind_data_v3';
const THEME_KEY = 'miniremind_theme';
const DEFAULT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

declare global {
  interface Window {
    electronAPI?: {
      sendNotification: (data: { title: string; body: string }) => void;
      controlWindow: (command: 'minimize' | 'maximize' | 'close') => void;
    };
  }
}

const App: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [widgetTheme, setWidgetTheme] = useState<WidgetTheme>(() => {
    return (localStorage.getItem(THEME_KEY) as WidgetTheme) || 'glass';
  });
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'health'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [activeAlert, setActiveAlert] = useState<Reminder | null>(null);

  const remindersRef = useRef(reminders);
  useEffect(() => { remindersRef.current = reminders; }, [reminders]);

  const triggerSystemNotification = useCallback((reminder: Reminder) => {
    const title = `⏰ 提醒：${reminder.title}`;
    const body = reminder.mode === 'interval' ? '周期任务时间到啦！' : '预定任务时间到啦！';
    window.electronAPI?.sendNotification({ title, body });
  }, []);

  const handleWindowControl = (cmd: 'minimize' | 'maximize' | 'close') => {
    window.electronAPI?.controlWindow(cmd);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nowTs = now.getTime();
      const currentHHmm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      let hasChanges = false;
      const nextReminders = remindersRef.current.map(r => {
        if (r.isCompleted) return r;
        let shouldTrigger = false;
        if (r.mode === 'once') {
          const rTime = new Date(r.time);
          if (nowTs >= rTime.getTime() && (nowTs - rTime.getTime() < 60000) && !r.lastTriggeredAt) shouldTrigger = true;
        } else if (r.mode === 'interval' && r.startTime && r.endTime && r.intervalMinutes) {
          if (currentHHmm >= r.startTime && currentHHmm <= r.endTime) {
            const lastReference = r.lastTriggeredAt || r.createdAt;
            const diffMs = nowTs - lastReference;
            if (diffMs >= r.intervalMinutes * 60000 - 2000) shouldTrigger = true;
          }
        }
        if (shouldTrigger) {
          hasChanges = true;
          setActiveAlert(r);
          triggerSystemNotification(r);
          new Audio(r.soundUrl || DEFAULT_SOUND).play().catch(() => {});
          return { ...r, lastTriggeredAt: nowTs, completionCount: (r.completionCount || 0) + 1 };
        }
        return r;
      });
      if (hasChanges) setReminders(nextReminders);
    }, 1000);
    return () => clearInterval(interval);
  }, [triggerSystemNotification]);

  const healthGoals = useMemo((): HealthGoal[] => {
    const today = new Date().setHours(0,0,0,0);
    const getCount = (cat: string) => reminders.filter(r => r.category === cat).reduce((sum, r) => {
      if (r.mode === 'once' && r.isCompleted && r.createdAt >= today) return sum + 1;
      return sum + (r.completionCount || 0); 
    }, 0);
    return [
      { category: 'water', label: '每日饮水', target: 8, current: getCount('water') },
      { category: 'stretch', label: '起身活动', target: 4, current: getCount('stretch') },
      { category: 'eye', label: '缓解视疲劳', target: 6, current: getCount('eye') },
      { category: 'break', label: '正念休息', target: 2, current: getCount('break') },
    ];
  }, [reminders]);

  const filteredReminders = useMemo(() => {
    return reminders
      .filter(r => {
        if (activeFilter === 'health') return ['water', 'stretch', 'eye', 'break'].includes(r.category);
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' ? true : activeFilter === 'upcoming' ? !r.isCompleted : r.isCompleted;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [reminders, searchQuery, activeFilter]);

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      {/* 顶部自定义标题栏 - 可拖动区域 */}
      <header 
        className="h-10 flex items-center justify-between bg-white border-b border-black/5 shrink-0 z-50"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        <div className="flex items-center gap-2 pl-4">
           <Bell className="w-4 h-4 text-blue-600" />
           <span className="text-xs font-bold text-slate-600">微提醒 Pro</span>
        </div>
        
        {/* 窗口控制按钮 - 不可拖动区域 */}
        <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button onClick={() => handleWindowControl('minimize')} className="w-12 h-full flex items-center justify-center hover:bg-black/5 text-slate-500 transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={() => handleWindowControl('maximize')} className="w-12 h-full flex items-center justify-center hover:bg-black/5 text-slate-500 transition-colors">
            <Square className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleWindowControl('close')} className="w-12 h-full flex items-center justify-center hover:bg-red-500 hover:text-white text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        {isFloating ? (
          <FloatingWidget 
            reminder={null} 
            theme={widgetTheme}
            setTheme={setWidgetTheme}
            onExpand={() => setIsFloating(false)} 
          />
        ) : (
          <div className="flex w-full h-full bg-[#f3f3f3] text-slate-900 select-none">
            <aside className="w-64 flex flex-col border-r border-black/5 p-6 shrink-0 bg-white/40 backdrop-blur-md">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/30">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-sm leading-tight">控制台</h1>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">v1.2 Stable</p>
                  </div>
                </div>
                <button onClick={() => setIsFloating(true)} className="p-2 hover:bg-black/5 rounded-lg text-slate-400">
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1 flex-1">
                {[
                  { id: 'upcoming', label: '正在进行', icon: Clock },
                  { id: 'health', label: '健康看板', icon: Activity },
                  { id: 'all', label: '所有提醒', icon: Calendar },
                  { id: 'completed', label: '任务归档', icon: CheckCircle2 }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveFilter(item.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeFilter === item.id ? 'bg-white shadow-sm text-blue-600 border border-black/5' : 'text-slate-500 hover:bg-white/40'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                  <ShieldCheck className="w-4 h-4" />
                  <p className="text-[10px] font-bold">本地加密存储</p>
                </div>
              </div>
            </aside>

            <main className="flex-1 flex flex-col bg-white/20 overflow-hidden">
              <header className="p-6 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 max-w-xs relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="搜索..."
                      className="w-full pl-9 pr-4 py-2 bg-white/80 border-none rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => { setEditingReminder(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    新建提醒
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {activeFilter === 'health' ? (
                  <HealthInsights goals={healthGoals} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredReminders.map(reminder => (
                      <ReminderCard 
                        key={reminder.id}
                        reminder={reminder}
                        onToggle={() => setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, isCompleted: !r.isCompleted } : r))}
                        onDelete={() => setReminders(prev => prev.filter(r => r.id !== reminder.id))}
                        onEdit={() => { setEditingReminder(reminder); setIsModalOpen(true); }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </main>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ReminderModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => {
            const now = Date.now();
            if (editingReminder) {
              setReminders(prev => prev.map(r => r.id === editingReminder.id ? { ...r, ...data, createdAt: now, lastTriggeredAt: undefined } : r));
            } else {
              setReminders(prev => [{ ...data, id: crypto.randomUUID(), createdAt: now, isCompleted: false }, ...prev]);
            }
            setIsModalOpen(false);
          }}
          initialData={editingReminder}
        />
      )}

      {activeAlert && (
        <NotificationBanner 
          reminder={activeAlert} 
          onClose={() => setActiveAlert(null)}
          onComplete={() => {
            if (activeAlert.mode === 'once') setReminders(prev => prev.map(r => r.id === activeAlert.id ? { ...r, isCompleted: true } : r));
            setActiveAlert(null);
          }}
        />
      )}
    </div>
  );
};

export default App;