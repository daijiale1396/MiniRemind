
export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export type ReminderCategory = 'general' | 'water' | 'stretch' | 'eye' | 'break';
export type RepeatType = 'none' | 'daily' | 'workdays';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  category: ReminderCategory;
  mode: 'once' | 'interval';
  repeatType: RepeatType;
  time: string; // ISO string (用于单次模式)
  startTime?: string; // 周期开始时间 (HH:mm)
  endTime?: string;   // 周期结束时间 (HH:mm)
  intervalMinutes?: number; // 间隔分钟
  lastTriggeredAt?: number; // 上次触发的时间戳
  priority: Priority;
  isCompleted: boolean;
  createdAt: number;
}

export interface AppState {
  reminders: Reminder[];
  isSidebarOpen: boolean;
  filter: 'all' | 'upcoming' | 'completed';
}
