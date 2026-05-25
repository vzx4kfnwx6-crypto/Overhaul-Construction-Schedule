import React, { useEffect, useRef, useState } from "react";
import { useProjects } from "../context/ProjectContext";
import {
  eachDayOfInterval,
  format,
  parseISO,
  isSameDay,
  addDays,
} from "date-fns";
import { zhTW } from "date-fns/locale";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn, getProjectTimelineStatus } from "../lib/utils";
import { X, Save, Plus, Settings } from "lucide-react";

export function ScheduleGuide() {
  const { projects, updateProject, addProject, globalSettings, updateGlobalSettings } = useProjects();
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [selectedTask, setSelectedTask] = useState<{ projectId: string, date: string, task: string, unit: string } | null>(null);

  // Filters
  const [filterPlant, setFilterPlant] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterManager, setFilterManager] = useState("");

  // Unique plants for dropdown
  const uniquePlants = Array.from(new Set(projects.map(p => p.plant).filter(Boolean))) as string[];

  const filteredProjects = projects.filter(p => {
    if (p.archived) return false;
    if (filterPlant && p.plant !== filterPlant) return false;
    if (filterUnit && !p.unit.toLowerCase().includes(filterUnit.toLowerCase())) return false;
    if (filterManager && !p.manager?.toLowerCase().includes(filterManager.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    if (location.hash && containerRef.current) {
      const id = location.hash.replace("#project-", "");
      const element = document.getElementById(`schedule-row-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.style.backgroundColor = "#EFF6FF";
        setTimeout(() => {
          element.style.backgroundColor = "";
        }, 2000);
      }
    }
  }, [location.hash]);

  const [zoomLevel, setZoomLevel] = useState<"day" | "week" | "month">("day");

  // Define the overall grid interval
  const now = new Date();
  const startDateObj = new Date(now.getFullYear(), now.getMonth(), 1); 
  const endDateObj = addDays(startDateObj, 365); // 1 full year roughly
  const allDays = eachDayOfInterval({ start: startDateObj, end: endDateObj });

  // Compute time slots based on zoom level
  let timeSlots: Date[] = [];
  let topHeaders: { label: string, colSpan: number }[] = [];
  let bottomHeaders: { label: string, date: Date }[] = [];

  if (zoomLevel === "day") {
    timeSlots = allDays;
    const daysByMonth: Record<string, Date[]> = {};
    allDays.forEach((day) => {
      const month = format(day, "yyyy年 MM月");
      if (!daysByMonth[month]) daysByMonth[month] = [];
      daysByMonth[month].push(day);
    });
    topHeaders = Object.entries(daysByMonth).map(([month, days]) => ({ label: month, colSpan: days.length }));
    bottomHeaders = allDays.map(day => ({ label: format(day, "d"), date: day }));
  } else if (zoomLevel === "week") {
    // Generate weeks (starting Mondays)
    const weeks: Date[] = [];
    let current = startDateObj;
    // Walk to first Monday
    while (current.getDay() !== 1) current = addDays(current, 1);
    while (current <= endDateObj) {
      weeks.push(current);
      current = addDays(current, 7);
    }
    timeSlots = weeks;
    const weeksByMonth: Record<string, Date[]> = {};
    weeks.forEach((week) => {
      const month = format(week, "yyyy年 MM月");
      if (!weeksByMonth[month]) weeksByMonth[month] = [];
      weeksByMonth[month].push(week);
    });
    topHeaders = Object.entries(weeksByMonth).map(([month, wks]) => ({ label: month, colSpan: wks.length }));
    bottomHeaders = weeks.map((week, i) => ({ label: `W${i+1}`, date: week }));
  } else {
    // Month
    const months: Date[] = [];
    let current = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), 1);
    while (current <= endDateObj) {
      months.push(current);
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
    timeSlots = months;
    const monthsByYear: Record<string, Date[]> = {};
    months.forEach((month) => {
      const year = format(month, "yyyy年");
      if (!monthsByYear[year]) monthsByYear[year] = [];
      monthsByYear[year].push(month);
    });
    topHeaders = Object.entries(monthsByYear).map(([year, mths]) => ({ label: year, colSpan: mths.length }));
    bottomHeaders = months.map(month => ({ label: format(month, "MM月"), date: month }));
  }

  const columnWidth = 20; // fixed minimum acceptable width for days

  const phaseColors = {
    stop: "bg-slate-400 text-transparent",
    construction: "bg-amber-500 text-transparent",
    other: "bg-indigo-400 text-transparent",
  };
  
  const handleCellClick = (projectId: string, date: string, unit: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent row click navigate
    const project = projects.find(p => p.id === projectId);
    const existingTask = project?.dailyTasks?.[date] || "";
    setSelectedTask({ projectId, date, task: existingTask, unit });
  };
  
  const saveTask = () => {
    if (!selectedTask) return;
    const project = projects.find(p => p.id === selectedTask.projectId);
    if (project) {
      const newTasks = { ...project.dailyTasks };
      if (!selectedTask.task.trim()) {
        delete newTasks[selectedTask.date];
      } else {
        newTasks[selectedTask.date] = selectedTask.task;
      }
      updateProject({
        ...project,
        dailyTasks: newTasks
      });
    }
    setSelectedTask(null);
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [tempSettings, setTempSettings] = useState(globalSettings);

  const saveSettings = () => {
    updateGlobalSettings(tempSettings);
    setShowSettingsModal(false);
  };

  const addCustomPhase = () => {
    setTempSettings({
      ...tempSettings,
      customPhases: [
        ...tempSettings.customPhases,
        { id: Date.now().toString(), name: "新階段", color: "#8b5cf6" }
      ]
    });
  };

  const updateCustomPhase = (id: string, field: string, val: string) => {
    setTempSettings({
      ...tempSettings,
      customPhases: tempSettings.customPhases.map(p => 
        p.id === id ? { ...p, [field]: val } : p
      )
    });
  };

  const removeCustomPhase = (id: string) => {
    setTempSettings({
      ...tempSettings,
      customPhases: tempSettings.customPhases.filter(p => p.id !== id)
    });
  };

  const [newProjectData, setNewProjectData] = useState({
    unit: "",
    factory: "",
    startDate: format(new Date(), "yyyy-MM-dd"), // Stop start
    endDate: format(new Date(), "yyyy-MM-dd"),   // Stop end
    constructionStartDate: format(new Date(), "yyyy-MM-dd"),
    constructionEndDate: format(new Date(), "yyyy-MM-dd")
  });

  const handleCreateProject = () => {
    if (!newProjectData.unit) return alert("請輸入單元名稱");
    
    const newId = Date.now().toString();

    addProject({
      id: newId,
      order: projects.length + 1,
      unit: newProjectData.unit,
      plant: newProjectData.factory || "未指定",
      type: "計修",
      startDate: newProjectData.startDate,
      endDate: newProjectData.endDate,
      constructionStartDate: newProjectData.constructionStartDate,
      constructionEndDate: newProjectData.constructionEndDate,
      status: "計畫中",
      phases: [],
      remarks: [],
      equipments: []
    });
    
    setShowAddModal(false);
    setNewProjectData({
      unit: "",
      factory: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      constructionStartDate: format(new Date(), "yyyy-MM-dd"),
      constructionEndDate: format(new Date(), "yyyy-MM-dd")
    });
    
    // Attempt scroll after adding
    setTimeout(() => {
      window.location.hash = `#project-${newId}`;
    }, 100);
  };

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[500px] flex flex-col w-full" ref={containerRef}>
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 shadow-xl max-w-sm w-full border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">直接新增專案時程</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
                 <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">廠部</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="例: 一廠"
                    value={newProjectData.factory}
                    onChange={e => setNewProjectData({...newProjectData, factory: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">單元機組</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="例: CDU2"
                    value={newProjectData.unit}
                    onChange={e => setNewProjectData({...newProjectData, unit: e.target.value})}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">停俥段起始</label>
                    <input 
                      type="date" 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                      value={newProjectData.startDate}
                      onChange={e => setNewProjectData({...newProjectData, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">停俥段結束</label>
                    <input 
                      type="date" 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                      value={newProjectData.endDate}
                      min={newProjectData.startDate}
                      onChange={e => setNewProjectData({...newProjectData, endDate: e.target.value})}
                    />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-amber-700 mb-1">施工段起始</label>
                    <input 
                      type="date" 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                      value={newProjectData.constructionStartDate}
                      min={newProjectData.startDate}
                      max={newProjectData.endDate || undefined}
                      onChange={e => setNewProjectData({...newProjectData, constructionStartDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-amber-700 mb-1">施工段結束</label>
                    <input 
                      type="date" 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                      value={newProjectData.constructionEndDate}
                      min={newProjectData.constructionStartDate || newProjectData.startDate}
                      max={newProjectData.endDate || undefined}
                      onChange={e => setNewProjectData({...newProjectData, constructionEndDate: e.target.value})}
                    />
                  </div>
               </div>
               
               <div className="pt-4 mt-2">
                 <button onClick={handleCreateProject} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">
                   確定新增
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden relative">
        <div className="flex justify-between items-center mb-6 shrink-0 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              年度定檢計劃時程
            </h2>
            <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm mr-4">
              <button onClick={() => setZoomLevel('day')} className={cn("px-3 py-1.5 text-xs font-bold transition-colors", zoomLevel === 'day' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}>日</button>
              <button onClick={() => setZoomLevel('week')} className={cn("px-3 py-1.5 text-xs font-bold transition-colors border-l border-r border-slate-200", zoomLevel === 'week' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}>週</button>
              <button onClick={() => setZoomLevel('month')} className={cn("px-3 py-1.5 text-xs font-bold transition-colors", zoomLevel === 'month' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}>月</button>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors border border-indigo-200"
            >
              <Plus className="w-4 h-4" />
              新增排程
            </button>
            <button
              onClick={() => {
                setTempSettings(globalSettings);
                setShowSettingsModal(true);
              }}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors border border-slate-200"
            >
              <Settings className="w-4 h-4" />
              設定顏色區段
            </button>
          </div>
          <div className="flex gap-4 text-xs font-medium text-slate-600 hidden sm:flex">
            <div className="flex items-center gap-1.5">
               <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: globalSettings.stopColor }}></div> 停車段
            </div>
            <div className="flex items-center gap-1.5">
               <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: globalSettings.constructionColor }}></div> 施工段
            </div>
            {globalSettings.customPhases.map(phase => (
              <div key={phase.id} className="flex items-center gap-1.5">
                 <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: phase.color }}></div> {phase.name}
              </div>
            ))}
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex flex-wrap gap-3 mb-4 shrink-0 justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
          <div className="flex flex-wrap gap-3 items-center">
            <select 
              value={filterPlant}
              onChange={(e) => setFilterPlant(e.target.value)}
              className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">全部廠區</option>
              {uniquePlants.map(plant => (
                <option key={plant} value={plant}>{plant}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="搜尋單元/機組..."
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 w-40"
            />
            <input
              type="text"
              placeholder="搜尋負責人..."
              value={filterManager}
              onChange={(e) => setFilterManager(e.target.value)}
              className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 w-32"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto border-t border-slate-100 pt-4 hide-scrollbar">
          <table className="w-full border-collapse min-w-max text-sm relative">
            <thead>
              {/* Months Header */}
              <tr>
                <th
                  className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px] p-2 min-w-[80px] max-w-[80px] w-20 text-center sticky left-0 z-30 shadow-[1px_0_0_0_#e2e8f0]"
                  rowSpan={2}
                >
                  案號
                </th>
                <th
                  className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px] p-2 min-w-[64px] max-w-[64px] w-16 text-center sticky left-[80px] z-30 shadow-[1px_0_0_0_#e2e8f0] border-l border-white"
                  rowSpan={2}
                >
                  廠區
                </th>
                <th
                  className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px] p-2 min-w-[112px] max-w-[112px] w-28 text-left sticky left-[144px] z-30 shadow-[1px_0_0_0_#e2e8f0] border-l border-white"
                  rowSpan={2}
                >
                  單元/機組
                </th>
                <th
                  className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px] p-2 min-w-[80px] max-w-[80px] w-20 text-center sticky left-[256px] z-30 shadow-[1px_0_0_0_#e2e8f0] border-l border-white"
                  rowSpan={2}
                >
                  負責人
                </th>
                <th
                  className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px] p-2 min-w-[48px] max-w-[48px] w-12 text-center sticky left-[336px] z-30 shadow-[1px_0_0_0_#e2e8f0] border-l border-white"
                  rowSpan={2}
                >
                  保養
                </th>
                <th
                  className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px] p-2 min-w-[48px] max-w-[48px] w-12 text-center sticky left-[384px] z-30 shadow-[1px_0_0_0_#e2e8f0] border-l border-white"
                  rowSpan={2}
                >
                  新裝
                </th>
                {topHeaders.map((header, i) => (
                  <th
                    key={i}
                    colSpan={header.colSpan}
                    className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px] p-1 text-center border-l border-white"
                  >
                    {header.label}
                  </th>
                ))}
                <th
                  className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px] px-2 py-1 text-center w-12 border-l border-white"
                  rowSpan={2}
                >
                  預計
                </th>
              </tr>
              {/* Days Header */}
              <tr>
                {bottomHeaders.map((header, i) => (
                  <th
                    key={i}
                    className="bg-slate-50/50 text-slate-500 text-[10px] w-6 p-0 text-center font-normal min-w-[24px] border-l border-white"
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 relative">
              {filteredProjects.map((project) => {
                const projectStart = project.startDate ? parseISO(project.startDate) : null;
                const projectEnd = project.endDate ? parseISO(project.endDate) : null;
                const consStart = project.constructionStartDate ? parseISO(project.constructionStartDate) : null;
                const consEnd = project.constructionEndDate ? parseISO(project.constructionEndDate) : null;

                const slotToPhaseMap: Record<string, { type: string; label: string; customColor?: string }> = {};

                // Use the new fields to determine overlapping phases
                timeSlots.forEach((slot) => {
                   const dateStr = format(slot, "yyyy-MM-dd");
                   const slotStart = slot.getTime();
                   const slotEnd = zoomLevel === 'day' ? slotStart : 
                                   zoomLevel === 'week' ? addDays(slot, 6).getTime() : 
                                   new Date(slot.getFullYear(), slot.getMonth() + 1, 0).getTime();
                   
                   let phaseType = null;
                   let customColor = undefined;
                   
                   // Check 'otherPhases' first (highest visual priority if mapped)
                   if (project.otherPhases) {
                     const otherPhase = project.otherPhases.find(p => {
                       if (!p.startDate || !p.endDate) return false;
                       const s = parseISO(p.startDate).getTime();
                       const e = parseISO(p.endDate).getTime();
                       return Math.max(slotStart, s) <= Math.min(slotEnd, e);
                     });
                     if (otherPhase) {
                       phaseType = "other";
                       const matchedGlobal = globalSettings.customPhases.find(cp => cp.name === otherPhase.name);
                       customColor = matchedGlobal ? matchedGlobal.color : "#818cf8"; // fallback color
                     }
                   }

                   // Check construction
                   if (!phaseType && consStart && consEnd) {
                     if (Math.max(slotStart, consStart.getTime()) <= Math.min(slotEnd, consEnd.getTime())) {
                       phaseType = "construction";
                       customColor = globalSettings.constructionColor;
                     }
                   }

                   // Check stop
                   if (!phaseType && projectStart && projectEnd) {
                     if (Math.max(slotStart, projectStart.getTime()) <= Math.min(slotEnd, projectEnd.getTime())) {
                       phaseType = "stop";
                       customColor = globalSettings.stopColor;
                     }
                   }
                   
                   if (phaseType) {
                     slotToPhaseMap[dateStr] = {
                       type: phaseType,
                       label: "",
                       customColor: customColor
                     };
                   }
                });

                let totalDays = 0;
                if (projectStart && projectEnd) {
                  totalDays = Math.ceil(Math.abs(projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                }

                return (
                  <tr
                    key={project.id}
                    id={`schedule-row-${project.id}`}
                    className="hover:bg-slate-50 group transition-colors h-10"
                    
                  >
                    <td className="p-1 px-2 text-center text-xs font-semibold text-slate-700 sticky left-0 z-20 bg-white group-hover:bg-slate-50 shadow-[1px_0_0_0_#e2e8f0] min-w-[80px] max-w-[80px] w-20">
                      <input 
                        type="text" 
                        value={project.caseNumbers?.join(', ') || ''} 
                        onChange={(e) => {
                          const newCaseNumbers = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          updateProject({...project, caseNumbers: newCaseNumbers});
                        }}
                        placeholder="輸入案號"
                        className="w-full text-center text-[10px] bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 outline-none transition-all placeholder:text-slate-300"
                      />
                    </td>
                    <td className="p-2 text-center text-xs font-medium text-emerald-600 sticky left-[80px] z-20 bg-white group-hover:bg-slate-50 shadow-[1px_0_0_0_#e2e8f0] border-l border-white min-w-[64px] max-w-[64px] w-16">
                      {project.plant || '-'}
                    </td>
                    <td 
                        className="p-2 text-left font-bold text-slate-700 text-sm sticky left-[144px] z-20 bg-white group-hover:bg-slate-50 cursor-pointer hover:text-indigo-600 shadow-[1px_0_0_0_#e2e8f0] border-l border-white min-w-[150px] max-w-[150px] w-[150px]"
                        onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <div className="flex flex-col gap-1 items-start">
                        <span className="truncate w-full hover:underline">{project.name || project.unit}</span>
                        {(() => {
                           const timelineStatus = getProjectTimelineStatus(project);
                           if (timelineStatus.status === 'ongoing') return <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold whitespace-nowrap">進行中</span>;
                           if (timelineStatus.status === 'upcoming') return <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 font-bold whitespace-nowrap">即將到來</span>;
                           if (timelineStatus.status === 'completed') return <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-200 text-slate-700 font-bold whitespace-nowrap">已完結</span>;
                           return null;
                        })()}
                      </div>
                    </td>
                    <td className="p-2 text-center text-xs text-slate-600 sticky left-[256px] z-20 bg-white group-hover:bg-slate-50 shadow-[1px_0_0_0_#e2e8f0] border-l border-white min-w-[80px] max-w-[80px] w-20">
                      {project.manager || '-'}
                    </td>
                    <td className="p-2 text-center text-xs text-slate-600 sticky left-[336px] z-20 bg-white group-hover:bg-slate-50 shadow-[1px_0_0_0_#e2e8f0] border-l border-white min-w-[48px] max-w-[48px] w-12">
                      {project.maintenanceCount ?? '-'}
                    </td>
                    <td className="p-2 text-center text-xs text-slate-600 sticky left-[384px] z-20 bg-white group-hover:bg-slate-50 shadow-[1px_0_0_0_#e2e8f0] border-l border-white min-w-[48px] max-w-[48px] w-12">
                      {project.newInstallCount ?? '-'}
                    </td>
                    {timeSlots.map((slot, i) => {
                      const dateStr = format(slot, "yyyy-MM-dd");
                      const phaseInfo = slotToPhaseMap[dateStr];
                      const hasTask = zoomLevel === 'day' && !!project.dailyTasks?.[dateStr] && project.dailyTasks[dateStr].trim().length > 0;
                      
                      return (
                        <td
                          key={i}
                          onClick={(e) => zoomLevel === 'day' ? handleCellClick(project.id, dateStr, project.unit, e) : undefined}
                          className={cn(
                            "p-1 text-center relative border-l border-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors w-6",
                            zoomLevel === 'day' ? "min-w-[24px]" : zoomLevel === 'week' ? "min-w-[40px]" : "min-w-[64px]",
                            hasTask && "bg-amber-50"
                          )}
                          title={hasTask ? `工程事項: ${project.dailyTasks![dateStr]}` : (zoomLevel === 'day' ? "點擊填寫工程事項" : "")}
                        >
                          {phaseInfo && (
                            <div 
                              className={cn("absolute inset-y-1.5 inset-x-0 w-full rounded-sm", !phaseInfo.customColor && phaseColors[phaseInfo.type as keyof typeof phaseColors])}
                              style={phaseInfo.customColor ? { backgroundColor: phaseInfo.customColor } : undefined}
                            >
                            </div>
                          )}
                          {hasTask && (
                             <div className="absolute inset-0 flex items-center justify-center z-10">
                               <span className="text-red-500 font-black text-sm drop-shadow-sm">!</span>
                             </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-2 text-center font-bold text-slate-700 text-xs border-l border-slate-50/50">
                      {totalDays}d
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Mobile legend */}
        <div className="flex gap-3 mt-6 text-xs font-medium text-slate-500 sm:hidden flex-wrap shrink-0">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-400 rounded-sm"></div> 停車</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded-sm"></div> 施工</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-indigo-400 rounded-sm"></div> 自訂階段(預設)</div>
        </div>
        
        {/* Daily Task Edit Modal */}
        {selectedTask && (
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTask(null)}>
                <div 
                    className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 w-full max-w-sm flex flex-col gap-4 transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">{selectedTask.unit}</h3>
                            <p className="text-sm font-medium text-slate-500">{selectedTask.date} 工程事項</p>
                        </div>
                        <button onClick={() => setSelectedTask(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                             <X className="w-5 h-5" />
                        </button>
                    </div>
                    <textarea 
                        value={selectedTask.task}
                        onChange={(e) => setSelectedTask({...selectedTask, task: e.target.value})}
                        className="w-full h-32 rounded-xl border border-slate-300 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors resize-none"
                        placeholder="請填寫當日工程事項（例如設備拆/安裝/吊車/包商配合）..."
                    />
                    <button 
                        onClick={saveTask}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold transition-all"
                    >
                        <Save className="w-4 h-4" />
                        儲存事項
                    </button>
                </div>
            </div>
        )}

        {/* Global Settings Modal */}
        {showSettingsModal && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowSettingsModal(false)}>
                <div 
                    className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 w-full max-w-md flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 text-xl flex items-center gap-2">
                             <Settings className="w-5 h-5 text-slate-500" /> 設定全域顏色區段
                        </h3>
                        <button onClick={() => setShowSettingsModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                             <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3">預設時程</h4>
                            <div className="flex items-center gap-4 mb-3">
                                <label className="text-sm font-bold text-slate-700 w-20">停車段</label>
                                <input type="color" value={tempSettings.stopColor} onChange={(e) => setTempSettings({...tempSettings, stopColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer border-0 p-0 shadow-sm" />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-bold text-slate-700 w-20">施工段</label>
                                <input type="color" value={tempSettings.constructionColor} onChange={(e) => setTempSettings({...tempSettings, constructionColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer border-0 p-0 shadow-sm" />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-slate-800">自訂時程 (例如: PSSR, 開車段)</h4>
                                <button onClick={addCustomPhase} className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> 新增自訂段
                                </button>
                            </div>
                            <div className="space-y-3">
                                {tempSettings.customPhases.map(phase => (
                                    <div key={phase.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-white shadow-sm">
                                        <input type="color" value={phase.color} onChange={(e) => updateCustomPhase(phase.id, 'color', e.target.value)} className="shrink-0 w-8 h-8 rounded cursor-pointer border-0 p-0 shadow-sm" />
                                        <input type="text" value={phase.name} onChange={(e) => updateCustomPhase(phase.id, 'name', e.target.value)} placeholder="階段名稱" className="flex-1 w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        <button onClick={() => removeCustomPhase(phase.id)} className="shrink-0 p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {tempSettings.customPhases.length === 0 && (
                                    <div className="text-center p-4 text-sm text-slate-500 border border-dashed border-slate-300 rounded-xl">尚未建立自訂時程</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={saveSettings}
                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 font-bold transition-all w-full mt-2 shadow-md"
                    >
                        <Save className="w-4 h-4" />
                        套用並儲存
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
