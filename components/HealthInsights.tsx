
import React from 'react';
import { Droplets, Move, Eye, Coffee, Target, Award, Zap } from 'lucide-react';
import { HealthGoal } from '../types';

interface HealthInsightsProps {
  goals: HealthGoal[];
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ goals }) => {
  const icons: any = {
    water: <Droplets className="text-blue-500" />,
    stretch: <Move className="text-orange-500" />,
    eye: <Eye className="text-emerald-500" />,
    break: <Coffee className="text-amber-500" />,
  };

  const totalTarget = goals.reduce((acc, g) => acc + g.target, 0);
  const totalCurrent = goals.reduce((acc, g) => acc + g.current, 0);
  const overallProgress = Math.min(100, (totalCurrent / totalTarget) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-black mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-300" />
              今日健康达标率
            </h3>
            <div className="flex items-end gap-4">
              <span className="text-6xl font-black">{Math.round(overallProgress)}%</span>
              <span className="text-blue-100 text-sm font-medium mb-2">
                已完成 {totalCurrent} / {totalTarget} 次提醒
              </span>
            </div>
          </div>
          <Zap className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10 rotate-12" />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 flex flex-col justify-center items-center text-center">
          <Target className="w-10 h-10 text-slate-200 mb-4" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">下一个目标</p>
          <p className="text-sm font-bold text-slate-800">
            {overallProgress >= 100 ? "今日大圆满！👏" : "还差几步就满分了！"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals.map(goal => (
          <div key={goal.category} className="bg-white p-6 rounded-3xl border border-black/5 flex items-center gap-6">
            <div className={`p-4 rounded-2xl bg-slate-50`}>
              {icons[goal.category]}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-700">{goal.label}</span>
                <span className="text-xs font-black text-slate-400">{goal.current}/{goal.target}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    goal.current >= goal.target ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-black/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">近七日趋势分析</h3>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-bold text-slate-400">完成度</span>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between h-32 px-4">
          {[40, 65, 30, 85, 95, 70, 100].map((val, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group cursor-help">
              <div 
                className={`w-8 rounded-t-lg transition-all duration-500 bg-blue-100 group-hover:bg-blue-600`}
                style={{ height: `${val}%` }}
              ></div>
              <span className="text-[10px] font-black text-slate-300">03.0{i+1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthInsights;
