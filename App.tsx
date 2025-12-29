
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Bell, Calendar, CheckCircle2, Clock, Plus, Search, Filter, Trash2, CalendarDays, RefreshCw, Settings, Info, ShieldCheck, Database, LayoutDashboard, TrendingUp, Target, Minimize2, Maximize2, Activity, Palette, Github } from 'lucide-react';
import { Reminder, Priority, HealthGoal, WidgetTheme } from './types';
import ReminderCard from './components/ReminderCard';
import ReminderModal from './components/ReminderModal';
import NotificationBanner from './components/NotificationBanner';
import HealthInsights from './components/HealthInsights';
import FloatingWidget from './components/FloatingWidget';

const STORAGE_KEY = 'miniremind_data_v3';
const THEME_KEY = 'miniremind_theme';
const DEFAULT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

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
  const [notificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const remindersRef = useRef(reminders);
  useEffect(() => { remindersRef.current = reminders; }, [reminders]);

  const showNativeNotification = useCallback((reminder: Reminder) => {
    if (notificationPermission === 'granted') {
      try {
        const n = new Notification(reminder.title, {
          body: `提醒时间已到！⏰`,
          icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png',
          tag: reminder.id,
          requireInteraction: true 
        });
        n.onclick = () => { window.focus(); setActiveAlert(reminder); n.close(); };
      } catch (e) { console.error(e); }
    }
  }, [notificationPermission]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, widgetTheme);
  }, [widgetTheme]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nowTs = now.getTime();
      const currentHHmm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const isWorkday = now.getDay() >= 1 && now.getDay() <= 5;

      let hasChanges = false;
      const nextReminders = remindersRef.current.map(r => {
        if (r.isCompleted) return r;
        if (r.mode === 'interval' && r.repeatType === 'workdays' && !isWorkday) return r;

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
          showNativeNotification(r);
          new Audio(r.soundUrl || DEFAULT_SOUND).play().catch(() => {});
          return { ...r, lastTriggeredAt: nowTs, completionCount: (r.completionCount || 0) + 1 };
        }
        return r;
      });

      if (hasChanges) setReminders(nextReminders);
    }, 1000);
    return () => clearInterval(interval);
  }, [showNativeNotification]);

  const healthGoals = useMemo((): HealthGoal[] => {
    const today = new Date().setHours(0,0,0,0);
    const getCount = (cat: string) => {
      return reminders
        .filter(r => r.category === cat)
        .reduce((sum, r) => {
          if (r.mode === 'once' && r.isCompleted && r.createdAt >= today) return sum + 1;
          return sum + (r.completionCount || 0); 
        }, 0);
    };
    return [
      { category: 'water', label: '每日饮水', target: 8, current: getCount('water') },
      { category: 'stretch', label: '起身活动', target: 4, current: getCount('stretch') },
      { category: 'eye', label: '缓解视疲劳', target: 6, current: getCount('eye') },
      { category: 'break', label: '正念休息', target: 2, current: getCount('break') },
    ];
  }, [reminders]);

  const nextReminder = useMemo(() => {
    const active = reminders.filter(r => !r.isCompleted);
    if (active.length === 0) return null;
    return active.sort((a, b) => {
      const getTime = (r: Reminder) => {
        if (r.mode === 'once') return new Date(r.time).getTime();
        const interval = (r.intervalMinutes || 30) * 60000;
        return (r.lastTriggeredAt || r.createdAt) + interval;
      };
      return getTime(a) - getTime(b);
    })[0];
  }, [reminders]);

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const updateReminderStatus = (id: string, updates: Partial<Reminder>) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

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
    <div className="w-full h-full relative">
      {isFloating ? (
        <FloatingWidget 
          reminder={nextReminder} 
          theme={widgetTheme}
          setTheme={setWidgetTheme}
          onExpand={() => setIsFloating(false)} 
        />
      ) : (
        <div className="flex w-full h-full bg-[#f3f3f3] text-slate-900 mica-effect select-none">
          <aside className="w-72 flex flex-col border-r border-black/5 qt-sidebar p-6 shrink-0">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-base leading-tight">微提醒 Pro</h1>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Standalone v1.2</p>
                </div>
              </div>
              <button 
                onClick={() => setIsFloating(true)}
                className="p-2 hover:bg-black/5 rounded-xl transition-colors text-slate-400"
                title="开启挂件模式"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-1.5 flex-1">
              <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">任务管理</p>
              {[
                { id: 'upcoming', label: '正在进行', icon: Clock },
                { id: 'health', label: '健康看板', icon: Activity },
                { id: 'all', label: '所有提醒', icon: Calendar },
                { id: 'completed', label: '任务归档', icon: CheckCircle2 }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveFilter(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeFilter === item.id ? 'bg-white shadow-sm text-blue-600 border border-black/5' : 'text-slate-500 hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-black/5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                <ShieldCheck className="w-5 h-5" />
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-tighter">隐私保护中</p>
                    <p className="text-[9px] opacity-70">数据仅存放于此设备</p>
                </div>
              </div>
              
              <a 
                href="https://github.com/daijiale1396/MiniRemind" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest group"
              >
                <Github className="w-3 h-3 group-hover:rotate-[360deg] transition-transform duration-500" />
                <span>View on GitHub</span>
              </a>
            </div>
          </aside>

          <main className="flex-1 flex flex-col min-0 bg-white/50 overflow-hidden">
            <header className="p-8 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 max-w-md relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="搜索任务..."
                    className="w-full pl-11 pr-4 py-3 bg-black/5 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-sm font-medium outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => { setEditingReminder(null); setIsModalOpen(true); }}
                  className="ml-4 flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  新建提醒
                </button>
              </div>
              <div className="h-px bg-black/5 w-full mt-4"></div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-4 no-scrollbar">
              {activeFilter === 'health' ? (
                <HealthInsights goals={healthGoals} />
              ) : filteredReminders.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredReminders.map(reminder => (
                    <div key={reminder.id} className="animate-slide-in">
                      <ReminderCard 
                        reminder={reminder}
                        onToggle={() => updateReminderStatus(reminder.id, { isCompleted: !reminder.isCompleted })}
                        onDelete={() => deleteReminder(reminder.id)}
                        onEdit={() => { setEditingReminder(reminder); setIsModalOpen(true); }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-10 py-20 grayscale">
                  <LayoutDashboard className="w-20 h-20 mb-4" />
                  <p className="text-xl font-black tracking-widest">目前暂无数据</p>
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {isModalOpen && (
        <ReminderModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => {
            const now = Date.now();
            if (editingReminder) {
              setReminders(prev => prev.map(r => r.id === editingReminder.id ? { 
                ...r, 
                ...data, 
                createdAt: now, 
                lastTriggeredAt: undefined 
              } : r));
            } else {
              setReminders(prev => [{ 
                ...data, 
                id: crypto.randomUUID(), 
                createdAt: now, 
                isCompleted: false 
              }, ...prev]);
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
            if (activeAlert.mode === 'once') updateReminderStatus(activeAlert.id, { isCompleted: true });
            setActiveAlert(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
