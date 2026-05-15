import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { ArrowLeft, Edit2, User, Wrench, Settings, FileText, Tag, CalendarDays } from 'lucide-react';
import { cn } from '../lib/utils';

export function ProjectDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  
  const project = projects.find(p => p.id === id);

  if (!project) return <div className="p-8 text-center text-slate-500">找不到該專案。</div>;

  const start = project.startDate ? new Date(project.startDate) : null;
  const end = project.endDate ? new Date(project.endDate) : null;
  let totalDays = 0;
  if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
    totalDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 bg-white border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 flex-wrap leading-relaxed">
              {project.name || project.unit}
              {project.caseNumbers && project.caseNumbers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.caseNumbers.map(cn => (
                    <span key={cn} className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700/80 rounded border border-indigo-200 uppercase tracking-wider">
                      案號: {cn}
                    </span>
                  ))}
                </div>
              )}
              {project.plant && (
                <span className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                  {project.plant}
                </span>
              )}
              <span className="px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                {project.type}
              </span>
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              計畫日期: {project.startDate} ~ {project.endDate} (共 {totalDays} 天)
            </p>
          </div>
        </div>
        <Link
          to={`/edit/${project.id}`}
          className="flex items-center space-x-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl font-bold transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          <span>編輯專案</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Info Bento */}
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex text-indigo-500 mb-4 bg-indigo-50 w-10 h-10 rounded-xl items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-400 mb-1">施工負責人</h3>
            <p className="text-lg font-bold text-slate-900">{project.manager || '尚未指派'}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex text-amber-500 mb-4 bg-amber-50 w-10 h-10 rounded-xl items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-400 mb-1">設備保養總機台</h3>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-slate-900 leading-none">{project.maintenanceCount ?? 0}</p>
              <p className="text-sm font-bold text-slate-500 mb-1">台</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex text-emerald-500 mb-4 bg-emerald-50 w-10 h-10 rounded-xl items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-400 mb-1">新機安裝總數量</h3>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-slate-900 leading-none">{project.newInstallCount ?? 0}</p>
              <p className="text-sm font-bold text-slate-500 mb-1">台</p>
            </div>
          </div>
        </div>

        {/* Equipment List Section */}
        <div className="col-span-1 md:col-span-3 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-purple-50 text-purple-600 p-2 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">設備清單與保養需求</h3>
          </div>
          
          <div className="space-y-4">
            {project.equipments && project.equipments.length > 0 ? (
               project.equipments.map((eq, i) => (
                 <div key={eq.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 space-y-3">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="font-bold text-slate-900">{eq.name || '未命名設備'}</span>
                           {eq.isNew ? (
                             <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">新裝機</span>
                           ) : (
                             <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">保養</span>
                           )}
                         </div>
                         <p className="text-xs text-slate-500">機型: <span className="font-semibold text-slate-700">{eq.model || '-'}</span></p>
                         <p className="text-xs text-slate-500">Tag No: <span className="font-semibold text-slate-700">{eq.tagNo || '-'}</span></p>
                       </div>
                    </div>
                    <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                       <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                         <FileText className="w-3.5 h-3.5" /> 需求零件
                       </h4>
                       
                       {(eq.selectedParts && eq.selectedParts.length > 0) && (
                         <div className="flex flex-wrap gap-1.5 mb-3">
                           {eq.selectedParts.map(part => (
                             <span key={part} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100">
                               {part}
                             </span>
                           ))}
                         </div>
                       )}

                       {eq.partsRequired && (
                         <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                           <span className="text-xs text-slate-500 block mb-1">補充備註:</span>
                           {eq.partsRequired}
                         </p>
                       )}
                       
                       {(!eq.selectedParts?.length && !eq.partsRequired) && (
                         <p className="text-sm text-slate-400 italic">無需求零件</p>
                       )}
                    </div>
                 </div>
               ))
            ) : (
              // Fallback for legacy data without new equipments array
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row gap-6">
                 <div className="md:w-1/3 space-y-3">
                    <div>
                      <span className="font-bold text-slate-900">舊資料設備</span>
                      <p className="text-xs text-slate-500 mt-1">機型: <span className="font-semibold text-slate-700">{project.equipmentModel || '-'}</span></p>
                      <p className="text-xs text-slate-500">Tag No: <span className="font-semibold text-slate-700">{project.equipmentTagNo || '-'}</span></p>
                    </div>
                 </div>
                 <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                    <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> 需求零件</h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {project.partsRequired || <span className="text-slate-400 italic">無註記</span>}
                    </p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Remarks Section */}
        {project.remarks.length > 0 && (
          <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">專案備註</h3>
            <ul className="space-y-2">
              {project.remarks.map((remark, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                  {remark}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Daily Tasks Section */}
        {project.dailyTasks && Object.entries(project.dailyTasks).filter(([_, task]) => typeof task === 'string' && task.trim().length > 0).length > 0 && (
          <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">工程每日工作備註</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(project.dailyTasks)
                .filter(([_, task]) => typeof task === 'string' && task.trim().length > 0)
                .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                .map(([date, task]) => (
                <div key={date} className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl items-start">
                   <div className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-bold shrink-0">
                     {date}
                   </div>
                   <div className="text-slate-700 text-sm whitespace-pre-wrap pt-1 flex-1">
                     {task}
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
