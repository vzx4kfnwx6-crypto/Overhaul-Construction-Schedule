import React, { useMemo } from 'react';
import { useProjects } from '../context/ProjectContext';
import { differenceInDays, isAfter, isBefore, parseISO, format, startOfToday } from 'date-fns';
import { Users, AlertCircle, Clock, Activity, ArrowRight, CheckCircle2, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  const { projects } = useProjects();
  const today = startOfToday();

  // 1. Calculate personnel workload (active projects per manager)
  const managerStats = useMemo(() => {
    const stats: Record<string, typeof projects> = {};
    projects.forEach(p => {
      if (p.archived) return;
      if (!p.startDate || !p.endDate) return;
      const endDate = parseISO(p.endDate);
      if (isAfter(endDate, today) || endDate.getTime() === today.getTime() || p.status === '進行中') {
        const manager = p.manager || '未指派';
        if (!stats[manager]) stats[manager] = [];
        stats[manager].push(p);
      }
    });
    return Object.entries(stats).sort((a, b) => b[1].length - a[1].length);
  }, [projects, today]);

  // 2. Upcoming & Ongoing projects
  const statusProjects = useMemo(() => {
    let ongoing: any[] = [];
    let upcoming: any[] = [];
    let completed: any[] = [];

    projects.forEach(p => {
      if (p.archived) return;
      if (!p.startDate || !p.endDate) return;
      
      const start = parseISO(p.startDate);
      const end = parseISO(p.endDate);

      if (isBefore(end, today)) {
        completed.push({ ...p, daysAgo: differenceInDays(today, end) });
      } else if ((isBefore(start, today) || start.getTime() === today.getTime()) && (isAfter(end, today) || end.getTime() === today.getTime()) || p.status === '進行中') {
        ongoing.push({ ...p, daysLeft: differenceInDays(end, today) });
      } else if (isAfter(start, today)) {
        upcoming.push({ ...p, daysUntil: differenceInDays(start, today) });
      }
    });

    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
    completed.sort((a, b) => a.daysAgo - b.daysAgo);
    return { ongoing, upcoming, completed };
  }, [projects, today]);

  // 3. Recently updated projects
  const recentProjects = [...projects].filter(p => !p.archived && p.startDate).sort((a, b) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  }).slice(0, 5);

  const archivedProjectsLocal = useMemo(() => projects.filter(p => p.archived), [projects]);

  const [isExpanded, setIsExpanded] = React.useState(false);

  const allStatusProjects = [
    ...statusProjects.ongoing.map(p => ({ ...p, type: 'ongoing' })),
    ...statusProjects.upcoming.map(p => ({ ...p, type: 'upcoming' })),
    ...statusProjects.completed.map(p => ({ ...p, type: 'completed' }))
  ];

  const displayedStatusProjects = isExpanded ? allStatusProjects : allStatusProjects.slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">總覽首頁</h2>
        <p className="text-slate-500 mt-2">監控所有廠區與單元的定檢與工程時程。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Ongoing & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-500" />
              進行中與即將到來
            </h3>
            <div className="space-y-4">
              {displayedStatusProjects.map(p => {
                if (p.type === 'ongoing') {
                  return (
                    <Link to={`/project/${p.id}`} key={`ongoing-${p.id}`} className="block group">
                      <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:border-emerald-300 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <div>
                            <h4 className="font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">{p.name || p.unit} 定檢 <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-200 text-emerald-800 ml-2 shadow-sm">進行中</span></h4>
                            <p className="text-xs text-emerald-700 mt-1">{p.plant || '一廠'} | 負責人: {p.manager || '未指派'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-emerald-600 tracking-wide uppercase">距定檢結束剩餘</span>
                          <div className="text-2xl font-black text-emerald-700 tracking-tighter">{p.daysLeft > 0 ? p.daysLeft : 0} <span className="text-sm font-bold opacity-75 tracking-normal">天</span></div>
                        </div>
                      </div>
                    </Link>
                  );
                } else if (p.type === 'upcoming') {
                  return (
                    <Link to={`/project/${p.id}`} key={`upcoming-${p.id}`} className="block group">
                      <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200 hover:border-amber-300 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" />
                          <div>
                            <h4 className="font-bold text-amber-900 group-hover:text-amber-700 transition-colors">{p.name || p.unit} 定檢 <span className="px-2 py-0.5 rounded text-[10px] bg-amber-200 text-amber-800 ml-2 shadow-sm">即將到來</span></h4>
                            <p className="text-xs text-amber-700 mt-1">{p.plant || '一廠'} | 預計開始: <span className="font-bold text-amber-800">{format(parseISO(p.startDate), 'MM/dd')}</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-amber-600 tracking-wide uppercase">距定檢開始剩餘</span>
                          <div className="text-2xl font-black text-amber-700 tracking-tighter">{p.daysUntil} <span className="text-sm font-bold opacity-75 tracking-normal">天</span></div>
                        </div>
                      </div>
                    </Link>
                  );
                } else {
                  return (
                    <Link to={`/project/${p.id}`} key={`completed-${p.id}`} className="block group">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-slate-400 shadow-sm" />
                          <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-slate-600 transition-colors">{p.name || p.unit} 定檢 <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-600 ml-2 shadow-sm">已完工</span></h4>
                            <p className="text-xs text-slate-500 mt-1">{p.plant || '一廠'} | 結束日期: <span className="font-bold text-slate-600">{format(parseISO(p.endDate), 'MM/dd')}</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">已完工</span>
                          <div className="text-2xl font-black text-slate-500 tracking-tighter">{p.daysAgo} <span className="text-sm font-bold opacity-75 tracking-normal">天前</span></div>
                        </div>
                      </div>
                    </Link>
                  );
                }
              })}

              {allStatusProjects.length > 6 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                >
                  {isExpanded ? '收合名單' : `展開其餘 ${allStatusProjects.length - 6} 筆`}
                </button>
              )}

              {allStatusProjects.length === 0 && (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                  <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <span className="text-slate-500 font-medium">目前無工程項目</span>
                </div>
              )}
            </div>
          </div>

          {/* Widget 2: Recent Projects */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-500" />
                工程項目總覽
              </h3>
              <Link to="/tasks" className="text-sm text-slate-500 font-bold hover:text-slate-700 flex items-center gap-1 group">
                查看全部 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentProjects.map(p => (
                <Link to={`/project/${p.id}`} key={p.id} className="block group">
                  <div className="flex items-center p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                        {p.unit.substring(0,3)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                           <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">{p.unit} <span className="text-xs text-slate-500 font-normal ml-1">在 {p.plant || '一廠'}</span></h4>
                           <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{p.status}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 pr-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                            <div className="h-full bg-indigo-500 rounded-full relative" style={{ width: `${p.progress || 0}%` }}>
                               <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 font-bold tabular-nums w-8 text-right">{p.progress || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right side widgets wrapper */}
        <div className="col-span-1 space-y-6 flex flex-col">
          {/* Widget 3: Personnel Load */}
          <div className="border border-slate-200 bg-white rounded-3xl p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-slate-500" />
              人員負責工程
            </h3>
            <div className="space-y-4 flex-1">
              {managerStats.map(([manager, managerProjects], idx) => (
                <div key={manager} className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white text-slate-600 font-bold flex items-center justify-center text-sm border border-slate-200 shadow-sm shadow-slate-200/50">
                        {manager.substring(0, 1)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 text-sm block">{manager}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs shadow-sm">
                      {managerProjects.length} 項專案
                    </div>
                  </div>
                  <div className="divide-y divide-slate-50 bg-white px-1">
                    {managerProjects.map((p) => (
                      <Link key={p.id} to={`/project/${p.id}`} className="block border-l-[3px] border-transparent hover:border-indigo-500 hover:bg-slate-50 transition-colors px-3 py-2.5 rounded-r-lg my-1">
                         <div className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-700 transition-colors">{p.unit} <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-1 font-normal">{p.status}</span></div>
                         <div className="text-[11px] text-slate-500 truncate mt-1 flex items-center gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                           {p.plant || '一廠'} • {format(parseISO(p.startDate), 'MM/dd')} - {format(parseISO(p.endDate), 'MM/dd')}
                         </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              {managerStats.length === 0 && (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-sm font-medium">
                  目前無進行中之指派工程
                </div>
              )}
            </div>
          </div>

          {/* Widget 4: Archived Projects */}
          <div className="border border-slate-200 bg-white rounded-3xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Archive className="w-5 h-5 text-slate-500" />
                封存項目
              </h3>
              <Link to="/archived" className="text-sm text-slate-500 font-bold hover:text-slate-700 flex items-center gap-1 group">
                查看全部 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            
            <div className="space-y-2">
              {archivedProjectsLocal.slice(0, 3).map(p => (
                <Link to={`/project/${p.id}`} key={p.id} className="block group">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                       <h4 className="font-bold text-slate-700 text-sm truncate group-hover:text-indigo-700">{p.unit} <span className="text-xs text-slate-500 font-normal ml-1 pr-2">({p.plant || '一廠'})</span></h4>
                    </div>
                    <p className="text-[11px] text-slate-500">
                       {p.startDate ? format(parseISO(p.startDate), 'yyyy-MM-dd') : '-'} ~ {p.endDate ? format(parseISO(p.endDate), 'yyyy-MM-dd') : '-'}
                    </p>
                  </div>
                </Link>
              ))}
              {archivedProjectsLocal.length === 0 && (
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-sm font-medium">
                  目前無封存項目
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
