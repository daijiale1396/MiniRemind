
import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Calendar, CheckCircle2, Clock, Plus, Search, Filter, Trash2, CalendarDays, RefreshCw } from 'lucide-react';
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const nowTs = now.getTime();
      const day = now.getDay(); // 0 是周日, 1-5 是工作日
      const isWorkday = day >= 1 && day <= 5;
      const currentHHmm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      setReminders(prevReminders => {
        let changed = false;
        const newReminders = prevReminders.map(reminder => {
          if (reminder.isCompleted) return reminder;

          // 周期检查：如果设为工作日但今天不是，则跳过
          if (reminder.mode === 'interval' && reminder.repeatType === 'workdays' && !isWorkday) {
            return reminder;
          }

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
            // Use custom sound if available, otherwise default
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

    const interval = setInterval(checkReminders, 5000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 flex flex-col max-w-2xl mx-auto shadow-xl">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">微提醒 Pro</h1>
          </div>
          <button 
            onClick={() => { setEditingReminder(null); setIsModalOpen(true); }}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-transform active:scale-95 shadow-md"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索你的任务..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100/50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'upcoming', label: '进行中' },
            { id: 'all', label: '全部' },
            { id: 'completed', label: '已完成' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`text-sm font-medium whitespace-nowrap px-1 pb-2 border-b-2 transition-colors ${
                activeFilter === f.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {filteredReminders.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredReminders.map(reminder => (
              <ReminderCard 
                key={reminder.id}
                reminder={reminder}
                onToggle={() => updateReminderStatus(reminder.id, { isCompleted: !reminder.isCompleted })}
                onDelete={() => deleteReminder(reminder.id)}
                onEdit={() => { setEditingReminder(reminder); setIsModalOpen(true); }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <CalendarDays className="w-12 h-12 mb-2" />
            <p className="text-sm">空空如也，添加一个提醒吧</p>
          </div>
        )}
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
