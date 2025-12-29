
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Bell, Calendar, CheckCircle2, Clock, Plus, Search, Filter, Trash2, CalendarDays, RefreshCw, Settings, Info, ShieldCheck, Database } from 'lucide-react';
import { Reminder, Priority } from './types';
import ReminderCard from './components/ReminderCard';
import ReminderModal from './components/ReminderModal';
import NotificationBanner from './components/NotificationBanner';

const STORAGE_KEY = 'miniremind_data_v3';
const DEFAULT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const App: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [activeAlert, setActiveAlert] = useState<Reminder | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  }, []);

  const showNativeNotification = useCallback((reminder: Reminder) => {
    if (notificationPermission === 'granted') {
      const n = new Notification(reminder.title, {
        body: `提醒时间已到！分类: ${reminder.category === 'general' ? '通用任务' : reminder.category}`,
        icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png',
        tag: reminder.id,
        requireInteraction: true 
      });
      n.onclick = () => {
        window.focus();
        setActiveAlert(reminder);
        n.close();
      };
    }
  }, [notificationPermission]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const nowTs = now.getTime();
      const day = now.getDay();
      const isWorkday = day >= 1 && day <= 5;
      const currentHHmm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      setReminders(prevReminders => {
        let changed = false;
        const newReminders = prevReminders.map(reminder => {
          if (reminder.isCompleted) return reminder;
          if (reminder.mode === 'interval' && reminder.repeatType === 'workdays' && !isWorkday) return reminder;

          let shouldTrigger = false;
          if (reminder.mode === 'once') {
            const reminderTime = new Date(reminder.time);
            if (nowTs >= reminderTime.getTime() && (nowTs - reminderTime.getTime() < 60000) && !reminder.lastTriggeredAt) {
              shouldTrigger = true;
            }
          } else if (reminder.mode === 'interval' && reminder.startTime && reminder.endTime && reminder.intervalMinutes) {
            if (currentHHmm >= reminder.startTime && currentHHmm <= reminder.endTime) {
              const lastTs = reminder.lastTriggeredAt || 0;
              const diffMinutes = (nowTs - lastTs) / 60000;
              if (diffMinutes >= reminder.intervalMinutes) {
                shouldTrigger = true;
              }
            }
          }

          if (shouldTrigger) {
            setActiveAlert(reminder);
            showNativeNotification(reminder);
            const soundSrc = reminder.soundUrl || DEFAULT_SOUND;
            const audio = new Audio(soundSrc);
            audio.play().catch(() => {});
            changed = true;
            return { ...reminder, lastTriggeredAt: nowTs };
          }
          return reminder;
        });
        return changed ? newReminders : prevReminders;
      });
    };

    // 提升扫描频率至 5秒 每次
    const interval = setInterval(checkReminders, 5000);
    return () => clearInterval(interval);
  }, [showNativeNotification]);

  const addOrUpdateReminder = (data: any) => {
    if (editingReminder) {
      setReminders(prev => prev.map(r => r.id === editingReminder.id ? { ...r, ...data } : r));
    } else {
      const newReminder: Reminder = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        isCompleted: false,
      };
      setReminders(prev => [newReminder, ...prev]);
    }
    setIsModalOpen(false);
    setEditingReminder(null);
  };

  const updateReminderStatus = (id: string, updates: Partial<Reminder>) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const filteredReminders = useMemo(() => {
    return reminders
      .filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' ? true :
                            activeFilter === 'upcoming' ? !r.isCompleted : r.isCompleted;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [reminders, searchQuery, activeFilter]);

  return (
    <div className="flex w-full h-full bg-[#f3f3f3] text-slate-900 mica-effect">
      <aside className="w-64 flex flex-col border-r border-black/5 qt-sidebar p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">微提醒</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Professional Edition</p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">我的视图</p>
          {[
            { id: 'upcoming', label: '待办任务', icon: Clock },
            { id: 'all', label: '所有任务', icon: Calendar },
            { id: 'completed', label: '已完成', icon: CheckCircle2 }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeFilter === item.id ? 'bg-white shadow-sm text-blue-600 border border-black/5' : 'text-slate-500 hover:bg-black/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold border border-emerald-100">
             <Database className="w-3.5 h-3.5" />
             本地模式：数据无需登录
          </div>
          {notificationPermission !== 'granted' && (
            <button 
              onClick={requestNotificationPermission}
              className="w-full flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-xl text-[11px] font-bold border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              开启 Windows 系统通知
            </button>
          )}
          <div className="p-4 bg-white/40 rounded-2xl border border-white/60">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-2">
              <Info className="w-3 h-3" />
              运行状态
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              高精度扫描已开启。系统将每 5 秒检测一次，支持 1 分钟短频提醒。
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white/50">
        <header className="p-8 pb-4 flex items-center justify-between">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索任务或分类..."
              className="w-full pl-11 pr-4 py-3 bg-black/5 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-sm font-medium outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingReminder(null); setIsModalOpen(true); }}
            className="ml-4 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            新建提醒
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-4 no-scrollbar">
          {filteredReminders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
              <CalendarDays className="w-16 h-16 mb-4" />
              <p className="text-lg font-bold">暂无相关提醒</p>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <ReminderModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={addOrUpdateReminder}
          initialData={editingReminder}
        />
      )}

      {activeAlert && (
        <NotificationBanner 
          reminder={activeAlert} 
          onClose={() => setActiveAlert(null)}
          onComplete={() => {
            if (activeAlert.mode === 'once') {
              updateReminderStatus(activeAlert.id, { isCompleted: true });
            }
            setActiveAlert(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
