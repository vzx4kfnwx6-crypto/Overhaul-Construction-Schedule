import React, { useEffect } from "react";
import { useProjects } from "../context/ProjectContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Settings,
  Calendar as CalendarIcon,
  Edit2,
  ArrowRight,
  ArchiveRestore,
} from "lucide-react";
import { cn } from "../lib/utils";

export function ArchivedProjects() {
  const { projects, updateProject } = useProjects();
  const location = useLocation();
  const navigate = useNavigate();

  const archivedProjects = projects.filter(p => p.archived);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#project-", "");
      const element = document.getElementById(`project-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-2", "ring-indigo-500", "ring-offset-2");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-indigo-500", "ring-offset-2");
        }, 2000);
      }
    }
  }, [location.hash]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">封存項目</h2>
          <p className="text-slate-500 mt-2">檢視已封存的工程專案。</p>
        </div>
      </div>

      {archivedProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 font-medium">目前沒有已封存的專案</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedProjects.map((project) => {
            let totalDays = 0;
            if (project.startDate && project.endDate) {
              const start = new Date(project.startDate);
              const end = new Date(project.endDate);
              if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                totalDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              }
            }

            return (
              <div
                key={project.id}
                id={`project-${project.id}`}
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 hover:border-indigo-300 overflow-hidden transition-all duration-300 flex flex-col group cursor-pointer opacity-80 hover:opacity-100"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-2 flex-wrap">
                    {project.caseNumbers && project.caseNumbers.length > 0 ? (
                      project.caseNumbers.map(cn => (
                        <span key={cn} className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                          {cn}
                        </span>
                      ))
                    ) : (
                      <span>#{project.order} - {project.type}</span>
                    )}
                    {project.manager && (
                      <span className="bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded">
                        負責人: {project.manager}
                      </span>
                    )}
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {project.plant || '一廠'}
                    </span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0">
                    {totalDays} 天
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1">
                   <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">
                     {project.name || project.unit}
                   </h3>
                   <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => updateProject({ ...project, archived: false })}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold px-2"
                        title="取消封存"
                      >
                        <ArchiveRestore className="w-4 h-4" />
                        復原
                      </button>
                   </div>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                   <CalendarIcon className="w-3.5 h-3.5" />
                   {project.startDate} ~ {project.endDate}
                </p>
                
                <div className="flex gap-3 text-[10px] text-slate-500 mb-3 font-semibold">
                  {project.maintenanceCount !== undefined && (
                    <span className="bg-slate-50 text-slate-700 px-2 py-1 rounded-md">保養: {project.maintenanceCount}台</span>
                  )}
                  {project.newInstallCount !== undefined && (
                    <span className="bg-slate-50 text-slate-700 px-2 py-1 rounded-md">新機: {project.newInstallCount}台</span>
                  )}
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-100 items-center justify-between">
                   <span className="text-xs font-bold text-slate-600">{project.equipments?.length || 0} 個設備項目</span>
                   <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 -translate-x-2 group-hover:translate-x-0 transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
