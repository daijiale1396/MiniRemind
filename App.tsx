
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Bell, Calendar, CheckCircle2, Clock, Plus, Search, Trash2, ShieldCheck, Minimize2, Activity, X, Minus, Square } from 'lucide-react';
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

  // 重要：使用 Ref 解决定时器闭包导致的时间获取不到/ reminders 不更新问题
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
          // 容错范围：当前分钟内且未触发过
          if (nowTs >= rTime.getTime() && (nowTs - rTime.getTime() < 60000) && !r.lastTriggeredAt) shouldTrigger = true;
        } else if (r.mode === 'interval' && r.startTime && r.endTime && r.intervalMinutes) {
          if (currentHHmm >= r.startTime && currentHHmm <= r.endTime) {
            const lastReference = r.lastTriggeredAt || r.createdAt;
            const diffMs = nowTs - lastReference;
            // 达到间隔时间
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

  const healthGoals = useMemo((): HealthGoal[] => {
    const today = new Date().setHours(0,0,0,0);
    const getCount = (cat: string) => reminders.filter(r => r.category === cat).reduce((sum, r) => {
      if (r.mode === 'once' && r.isCompleted && r.createdAt >= today) return sum + 1;
      return sum + (r.completionCount || 0); 
    }, 0);
    return [
      { category: 'water', label: '每日饮水', target: 8, current: getCount('water') },
      { category: 'stretch', label: '起身活动', target: 4, current: getCount('stretch') },
      { category: 'eye', label: '护眼频率', target: 6, current: getCount('eye') },
      { category: 'break', label: '午间/晚间休息', target: 2, current: getCount('break') },
    ];
  }, [reminders]);

  return (
    <div className="w-full h-full relative flex flex-col bg-white overflow-hidden">
      {/* 沉浸式标题栏：这里是关键，-webkit-app-region: drag 让它可以被拖动 */}
      <header 
        className="h-10 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-black/5 shrink-0 z-[1000] select-none"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        <div className="flex items-center gap-2 pl-4">
           <Bell className="w-3.5 h-3.5 text-blue-600" />
           <span className="text-[11px] font-bold text-slate-500 tracking-tight">微提醒 Pro</span>
        </div>
        
        {/* 控制按钮区域必须设置为 no-drag 否则点击无效 */}
        <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button onClick={() => handleWindowControl('minimize')} className="w-11 h-full flex items-center justify-center hover:bg-black/5 text-slate-400 transition-colors">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleWindowControl('maximize')} className="w-11 h-full flex items-center justify-center hover:bg-black/5 text-slate-400 transition-colors">
            <Square className="w-3 h-3" />
          </button>
          <button onClick={() => handleWindowControl('close')} className="w-11 h-full flex items-center justify-center hover:bg-red-500 hover:text-white text-slate-400 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        {isFloating ? (
          <FloatingWidget 
            reminder={reminders.find(r => !r.isCompleted) || null} 
            theme={widgetTheme}
            setTheme={setWidgetTheme}
            onExpand={() => setIsFloating(false)} 
          />
        ) : (
          <div className="flex w-full h-full bg-[#f9fafb] text-slate-900 select-none">
            <aside className="w-60 flex flex-col border-r border-black/5 p-5 shrink-0 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="font-black text-sm text-slate-800">控制台</h1>
                </div>
                <button onClick={() => setIsFloating(true)} className="p-1.5 hover:bg-black/5 rounded-lg text-slate-300 transition-colors">
                  <Minimize2 className="w-3.5 h-3.5" />
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
                      activeFilter === item.id ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <p className="text-[10px] font-bold">本地运行，隐私无忧</p>
                </div>
              </div>
            </aside>

            <main className="flex-1 flex flex-col bg-white overflow-hidden">
              <header className="px-8 py-6 flex items-center justify-between border-b border-black/5">
                <div className="flex-1 max-w-xs relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="搜索任务..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => { setEditingReminder(null); setIsModalOpen(true); }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加任务
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                {activeFilter === 'health' ? (
                  <HealthInsights goals={healthGoals} />
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredReminders.map(reminder => (
                      <ReminderCard 
                        key={reminder.id}
                        reminder={reminder}
                        onToggle={() => setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, isCompleted: !r.isCompleted } : r))}
                        onDelete={() => setReminders(prev => prev.filter(r => r.id !== reminder.id))}
                        onEdit={() => { setEditingReminder(reminder); setIsModalOpen(true); }}
                      />
                    ))}
                    {filteredReminders.length === 0 && (
                       <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300">
                          <Clock className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-sm font-bold opacity-30">暂无待办任务</p>
                       </div>
                    )}
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
              setReminders(prev => [{ ...data, id: crypto.randomUUID(), createdAt: now, isCompleted: false, completionCount: 0 }, ...prev]);
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
