
import React from 'react';
import { Clock, BarChart2, List, History, Zap, ShieldCheck, Github, Bell } from 'lucide-react';

interface SidebarProps {
  activeFilter: 'all' | 'upcoming' | 'completed' | 'dashboard';
  setActiveFilter: (filter: 'all' | 'upcoming' | 'completed' | 'dashboard') => void;
  stats: { total: number; upcoming: number; completed: number };
  onToggleWidget: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeFilter, setActiveFilter, stats, onToggleWidget }) => {
  const menuItems = [
    { id: 'upcoming', label: '正在进行', icon: Clock },
    { id: 'dashboard', label: '健康统计', icon: BarChart2 },
    { id: 'all', label: '所有任务', icon: List },
    { id: 'completed', label: '历史归档', icon: History },
  ];

  return (
    <aside className="w-[280px] bg-slate-50 border-r border-slate-100 flex flex-col shrink-0 p-8 h-full">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">微提醒 Pro</h1>
          <p className="text-[9px] font-black text-slate-300 mt-1 uppercase tracking-[0.2em]">Minimal Design</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id as any)}
              className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm transition-all group ${
                isActive 
                ? 'bg-white text-blue-600 font-bold shadow-sm border border-slate-100' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-500'}`} />
              {item.label}
              {item.id === 'upcoming' && stats.upcoming > 0 && (
                <span className="ml-auto bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-black">
                  {stats.upcoming}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-10">
        <button 
          onClick={onToggleWidget}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 shadow-xl hover:bg-black transition-all active:scale-95 no-drag"
        >
          <Zap className="w-3.5 h-3.5" /> 挂件模式
        </button>

        <div className="flex items-center gap-2 text-slate-300 px-2 justify-center group">
          <Github className="w-4 h-4 group-hover:text-slate-600 transition-colors" />
          <a 
            href="https://github.com/daijiale1396/MiniRemind" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-bold tracking-widest hover:text-slate-600 transition-colors"
          >
            VIEW ON GITHUB
          </a>
        </div>
        
        <div className="text-center">
          <span className="text-[8px] font-black text-slate-200 tracking-[0.3em]">STABLE v3.1</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
