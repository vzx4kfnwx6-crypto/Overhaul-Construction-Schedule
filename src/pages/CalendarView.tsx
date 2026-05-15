import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, parseISO, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Plus, Save } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';

export function CalendarView() {
  const { projects, updateProject } = useProjects();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date("2026-03-01")); // default to March 2026 for mock data
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [newTaskProjectId, setNewTaskProjectId] = useState<string>("");
  const [newTaskContent, setNewTaskContent] = useState<string>("");

  const handleSaveRemark = () => {
    if (!selectedDate || !newTaskProjectId || !newTaskContent.trim()) return;
    const project = projects.find(p => p.id === newTaskProjectId);
    if (!project) return;
    
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const updatedTasks = { ...project.dailyTasks, [dateKey]: newTaskContent };
    
    updateProject({ ...project, dailyTasks: updatedTasks });
    setNewTaskProjectId("");
    setNewTaskContent("");
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = monthStart; // we can pad with previous month days too, but keeping simple
  const endDate = monthEnd;

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Map tasks and projects to dates
  const eventsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    
    projects.forEach(project => {
      // Add daily tasks
      if (project.dailyTasks) {
        Object.entries(project.dailyTasks).forEach(([dateStr, task]) => {
          if (typeof task !== 'string' || task.trim() === '') return;
          if (!map.has(dateStr)) map.set(dateStr, []);
          map.get(dateStr)!.push({ type: 'task', project, task });
        });
      }
      
      // Also maybe add project phases/durations? For now mostly the special tasks.
    });
    
    return map;
  }, [projects]);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleCellClick = (day: Date) => {
    setSelectedDate(day);
  };

  const selectedEvents = selectedDate ? (eventsByDate.get(format(selectedDate, "yyyy-MM-dd")) || []) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <CalendarIcon className="w-7 h-7 text-indigo-600" />
          工程行事曆
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
            <button 
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 font-bold text-slate-800 tabular-nums">
              {format(currentMonth, "yyyy 年 MM 月")}
            </span>
            <button 
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-[120px] divide-x divide-y divide-slate-100 border-l border-t border-slate-100">
          {/* Pad the first week */}
          {Array.from({ length: startDate.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-slate-50/50"></div>
          ))}
          
          {days.map(day => {
            const dateKey = format(day, "yyyy-MM-dd");
            const events = eventsByDate.get(dateKey) || [];
            const isTodayDate = isToday(day);
            const hasEvents = events.length > 0;
            
            return (
              <div 
                key={day.toString()} 
                onClick={() => handleCellClick(day)}
                className={`p-2 flex flex-col relative transition-colors cursor-pointer hover:bg-slate-50 ${isTodayDate ? 'bg-indigo-50/20' : ''}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                    isTodayDate ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700'
                  }`}>
                    {format(day, "d")}
                  </span>
                  {hasEvents && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 rounded-full">
                      {events.length}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 overflow-hidden space-y-1 mt-1 opacity-70 hover:opacity-100 pointer-events-none">
                  {events.slice(0, 3).map((evt, idx) => (
                    <div 
                      key={idx}
                      className="text-xs bg-amber-50 border border-amber-200 text-amber-800 p-1 rounded shadow-sm w-full truncate"
                    >
                      <span className="font-bold">{evt.project.name || evt.project.unit}</span>
                      <span className="mx-1">-</span>
                      <span>{evt.task}</span>
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-xs text-slate-500 font-medium pl-1">
                      + {events.length - 3} 事項...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Modal */}
        {selectedDate && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-10 flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm">
               <div>
                 <h3 className="text-xl font-bold text-slate-900">{format(selectedDate, "yyyy年 MM月 dd日")}</h3>
                 <p className="text-sm font-medium text-slate-500">當日工程事項列表</p>
               </div>
               <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                 <X className="w-5 h-5 text-slate-500" />
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Form to add new remark */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm mb-6 flex flex-col gap-3">
                <h4 className="font-bold text-slate-800 text-sm">新增工程備註</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select 
                    value={newTaskProjectId} 
                    onChange={e => setNewTaskProjectId(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 min-w-[150px]"
                  >
                    <option value="">選擇專案...</option>
                    {projects.filter(p => !p.archived).map(p => (
                      <option key={p.id} value={p.id}>{p.unit} ({p.plant || '一廠'})</option>
                    ))}
                  </select>
                  <input 
                    type="text"
                    value={newTaskContent}
                    onChange={e => setNewTaskContent(e.target.value)}
                    placeholder="輸入工程備註..."
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                  <button 
                    onClick={handleSaveRemark}
                    disabled={!newTaskProjectId || !newTaskContent.trim()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    儲存
                  </button>
                </div>
              </div>

              {selectedEvents.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-medium bg-slate-50 rounded-2xl border border-slate-100">
                  當日尚無工程事項
                </div>
              ) : (
                selectedEvents.map((evt: any, i: number) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-colors flex justify-between items-center group cursor-pointer" onClick={() => navigate(`/project/${evt.project.id}`)}>
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{evt.project.plant}</span>
                         <h4 className="text-lg font-bold text-slate-900">{evt.project.name || evt.project.unit}</h4>
                       </div>
                       <p className="text-slate-600 font-medium">{evt.task}</p>
                     </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="text-indigo-600 text-sm font-bold bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                         查看專案
                       </button>
                     </div>
                  </div>
               ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
