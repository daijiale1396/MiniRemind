
import React from 'react';
import { Calendar, List, CheckCircle2, LayoutDashboard, Clock, Bell } from 'lucide-react';

interface SidebarProps {
  activeFilter: 'all' | 'upcoming' | 'completed';
  setActiveFilter: (filter: 'all' | 'upcoming' | 'completed') => void;
  stats: { total: number; upcoming: number; completed: number };
}

const Sidebar: React.FC<SidebarProps> = ({ activeFilter, setActiveFilter, stats }) => {
  const menuItems = [
    { id: 'all', label: 'All Reminders', icon: List, count: stats.total },
    { id: 'upcoming', label: 'Upcoming', icon: Clock, count: stats.upcoming },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: stats.completed },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 text-blue-600 mb-8">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">WinRemind <span className="text-blue-600 font-black">PRO</span></span>
        </div>

        <nav className="space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id as any)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                activeFilter === item.id 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeFilter === item.id ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {item.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-600">Active Monitoring</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Reminders are checked every 10 seconds. Ensure browser notifications are enabled.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
