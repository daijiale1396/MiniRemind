
export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export type ReminderCategory = 'general' | 'water' | 'stretch' | 'eye' | 'break';
export type RepeatType = 'none' | 'daily' | 'workdays';
export type WidgetTheme = 'glass' | 'cyber' | 'retro' | 'sakura';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  category: ReminderCategory;
  mode: 'once' | 'interval';
  repeatType: RepeatType;
  time: string; // ISO string
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  intervalMinutes?: number;
  lastTriggeredAt?: number;
  priority: Priority;
  isCompleted: boolean;
  createdAt: number;
  soundUrl?: string;
  completionCount?: number;
}

export interface HealthGoal {
  category: ReminderCategory;
  target: number;
  current: number;
  label: string;
}
