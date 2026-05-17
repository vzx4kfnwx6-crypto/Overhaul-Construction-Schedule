import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjects } from "../context/ProjectContext";
import { PhaseType, ProjectPhase, OtherPhase } from "../types";
import { ArrowLeft, Plus, Trash2, Save, X, Edit2 } from "lucide-react";

// predefined parts from user's request
const PREDEFINED_PARTS = [
  "馬達", "馬達驅動器", "馬達電源供應器", "反饋迴路電路板", "CPU板", 
  "蓄壓控制板", "蓄壓器", "彈性聯軸器", "齒輪泵", "電位計", 
  "保險絲", "注油閥", "溢流閥", "高壓電磁閥", "吸入單向閥", 
  "動力模組油封", "油缸襯套油封與活塞環", "三輪出電源供應器總成", "FMV", 
  "馬達組列", "動力組列", "油壓缸組列", "控制箱總成", "控制箱總成含蓄壓控制系統",
  "修理包"
];

export function ProjectEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, globalSettings } = useProjects();

  const project = projects.find((p) => p.id === id);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [type, setType] = useState("");
  const [plant, setPlant] = useState("");
  const [caseNumbersInput, setCaseNumbersInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [constructionStartDate, setConstructionStartDate] = useState("");
  const [constructionEndDate, setConstructionEndDate] = useState("");
  const [otherPhases, setOtherPhases] = useState<OtherPhase[]>([]);
  const [manager, setManager] = useState("");
  const [maintenanceCount, setMaintenanceCount] = useState<number | ''>("");
  const [newInstallCount, setNewInstallCount] = useState<number | ''>("");
  const [equipments, setEquipments] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<string[]>([]);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setUnit(project.unit);
      setType(project.type);
      setPlant(project.plant || "");
      setCaseNumbersInput(project.caseNumbers?.join(", ") || "");
      setStartDate(project.startDate);
      setEndDate(project.endDate || "");
      setConstructionStartDate(project.constructionStartDate || "");
      setConstructionEndDate(project.constructionEndDate || "");
      setOtherPhases(project.otherPhases ? [...project.otherPhases] : []);
      setManager(project.manager || "");
      setMaintenanceCount(project.maintenanceCount ?? "");
      setNewInstallCount(project.newInstallCount ?? "");
      setEquipments(project.equipments ? [...project.equipments] : []);
      setRemarks([...project.remarks]);
      setPhases(project.phases ? [...project.phases] : []);
    }
  }, [project]);

  if (!project)
    return <div className="p-8 text-center text-gray-500">找不到該專案。</div>;

  const handleSave = () => {
    // update
    updateProject({
      ...project,
      name,
      unit,
      type,
      plant,
      caseNumbers: caseNumbersInput.split(",").map(c => c.trim()).filter(Boolean),
      startDate,
      endDate: endDate || project.endDate,
      constructionStartDate,
      constructionEndDate,
      otherPhases,
      manager,
      maintenanceCount: maintenanceCount === '' ? undefined : Number(maintenanceCount),
      newInstallCount: newInstallCount === '' ? undefined : Number(newInstallCount),
      equipments,
      phases,
      remarks,
    });

    navigate(`/project/${project.id}`);
  };

  const addOtherPhase = () => {
    setOtherPhases([...otherPhases, { id: Date.now().toString(), name: "其他段", startDate: startDate, endDate: endDate }]);
  };

  const updateOtherPhase = (idx: number, field: string, val: string) => {
    const updated = [...otherPhases];
    (updated[idx] as any)[field] = val;
    setOtherPhases(updated);
  };

  const removeOtherPhase = (idx: number) => {
    setOtherPhases(otherPhases.filter((_, i) => i !== idx));
  };

  const addEquipment = () => {
    const newEq = {
      id: Math.random().toString(36).substring(7),
      name: "",
      model: "",
      tagNo: "",
      isNew: false,
      partsRequired: ""
    };
    setEquipments([...equipments, newEq]);
  };

  const removeEquipment = (idx: number) => {
    setEquipments(equipments.filter((_, i) => i !== idx));
  };

  const updateEquipment = (idx: number, field: string, value: any) => {
    const newEqs = [...equipments];
    newEqs[idx] = { ...newEqs[idx], [field]: value };
    setEquipments(newEqs);
  };

  const togglePart = (eqIdx: number, part: string) => {
    const eq = equipments[eqIdx];
    const currentParts = eq.selectedParts || [];
    let newParts;
    if (currentParts.includes(part)) {
      newParts = currentParts.filter((p: string) => p !== part);
    } else {
      newParts = [...currentParts, part];
    }
    updateEquipment(eqIdx, 'selectedParts', newParts);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 bg-white border border-slate-200 shadow-sm shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center bg-white border border-transparent hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 rounded-xl px-3 py-1 transition-all">
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-2xl font-bold text-slate-900 bg-transparent border-none focus:outline-none placeholder:text-slate-300"
            placeholder="請輸入專案名稱..."
          />
          <Edit2 className="w-5 h-5 text-slate-400 shrink-0 ml-2 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              廠區
            </label>
            <input
              type="text"
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 hover:bg-white focus:bg-white"
              placeholder="例如: 一廠、二廠..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              案號 (可填寫多個，使用逗號分隔)
            </label>
            <input
              type="text"
              value={caseNumbersInput}
              onChange={(e) => setCaseNumbersInput(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 hover:bg-white focus:bg-white"
              placeholder="例如: PRJ-2026-001, PRJ-2026-002"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              定檢單元 / 機組
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 hover:bg-white focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              類型
            </label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 hover:bg-white focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              施工負責人
            </label>
            <input
              type="text"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 hover:bg-white focus:bg-white"
              placeholder="請輸入負責人姓名"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">工程時程設定</h3>
          
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6 space-y-5">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-5 border-b border-slate-200">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    停俥段 - 起始日期
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors mb-1"
                  />
                  <p className="text-xs text-slate-500 mt-2">專案總長度的起點</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    停俥段 - 結束日期
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors mb-1"
                  />
                  <p className="text-xs text-slate-500 mt-2">專案總長度的終點</p>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-amber-700 mb-1">
                    可施工段 - 起始日期
                  </label>
                  <input
                    type="date"
                    value={constructionStartDate}
                    min={startDate}
                    max={endDate || undefined}
                    onChange={(e) => setConstructionStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-amber-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 transition-colors mb-1 text-amber-900"
                  />
                  <p className="text-xs text-amber-600/70 mt-2">施工段包含於停俥期間內</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-amber-700 mb-1">
                    可施工段 - 結束日期
                  </label>
                  <input
                    type="date"
                    value={constructionEndDate}
                    min={constructionStartDate || startDate}
                    max={endDate || undefined}
                    onChange={(e) => setConstructionEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-amber-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 transition-colors mb-1 text-amber-900"
                  />
                  <p className="text-xs text-amber-600/70 mt-2">施工段包含於停俥期間內</p>
                </div>
             </div>
          </div>

          <div className="flex justify-between items-center mb-4 mt-8">
            <h4 className="text-md font-bold text-slate-900">其他時程區段 (補充選項)</h4>
            <button
              onClick={addOtherPhase}
              className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700 font-bold bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新增其他階段</span>
            </button>
          </div>
          <div className="space-y-3">
            <datalist id="custom-phases-list">
              {globalSettings.customPhases.map(cp => (
                <option key={cp.id} value={cp.name} />
              ))}
            </datalist>
            {otherPhases.map((phase, idx) => (
              <div key={phase.id} className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition-colors">
                <input
                  type="text"
                  list="custom-phases-list"
                  value={phase.name}
                  onChange={(e) => updateOtherPhase(idx, 'name', e.target.value)}
                  placeholder="階段名稱 (自訂)"
                  className="w-full sm:w-1/3 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="date"
                  value={phase.startDate}
                  onChange={(e) => updateOtherPhase(idx, 'startDate', e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <span className="text-slate-400 font-medium">至</span>
                <input
                  type="date"
                  value={phase.endDate}
                  onChange={(e) => updateOtherPhase(idx, 'endDate', e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <button
                  onClick={() => removeOtherPhase(idx)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto flex-shrink-0"
                  title="刪除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {otherPhases.length === 0 && (
              <div className="text-center py-6 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-slate-500 text-sm">
                尚未新增其他補充階段
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              保養機台總數量
            </label>
            <input
              type="number"
              min="0"
              value={maintenanceCount}
              onChange={(e) => setMaintenanceCount(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 hover:bg-white focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              新機安裝總數量
            </label>
            <input
              type="number"
              min="0"
              value={newInstallCount}
              onChange={(e) => setNewInstallCount(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 hover:bg-white focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">設備列表清單</h3>
            <button
              onClick={addEquipment}
              className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700 font-bold bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新增設備</span>
            </button>
          </div>

          <div className="space-y-4">
            {equipments.map((eq, idx) => (
              <div
                key={eq.id}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-slate-700">設備 #{idx + 1}</h4>
                  <button
                    onClick={() => removeEquipment(idx)}
                    className="text-red-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">設備名稱</label>
                    <input
                      type="text"
                      value={eq.name}
                      onChange={(e) => updateEquipment(idx, "name", e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="例如: 主換熱器"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">設備機型</label>
                    <input
                      type="text"
                      value={eq.model}
                      onChange={(e) => updateEquipment(idx, "model", e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">設備 Tag No.</label>
                    <input
                      type="text"
                      value={eq.tagNo}
                      onChange={(e) => updateEquipment(idx, "tagNo", e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">任務類型 (保養/新裝機)</label>
                    <select
                      value={eq.isNew ? "new" : "maintenance"}
                      onChange={(e) => updateEquipment(idx, "isNew", e.target.value === "new")}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="maintenance">設備保養</option>
                      <option value="new">新機安裝</option>
                    </select>
                  </div>
                  
                  {!eq.isNew && (
                    <div className="sm:col-span-2 mt-2">
                      <label className="block text-xs font-medium text-slate-500 mb-2 border-t border-slate-100 pt-3">設備保養需求零件表</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm max-h-64 overflow-y-auto w-full">
                        {PREDEFINED_PARTS.map((part) => {
                          const isSelected = (eq.selectedParts || []).includes(part);
                          return (
                            <label key={part} className="flex items-start space-x-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors group">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => togglePart(idx, part)}
                                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4 cursor-pointer"
                              />
                              <span className={`text-sm select-none ${isSelected ? 'text-indigo-700 font-medium' : 'text-slate-600 group-hover:text-slate-800'}`}>
                                {part}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">其他補充說明 (非必填)</label>
                    <textarea
                      value={eq.partsRequired}
                      onChange={(e) => updateEquipment(idx, "partsRequired", e.target.value)}
                      rows={2}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
                      placeholder="填寫其他特殊需求或備註..."
                    />
                  </div>
                </div>
              </div>
            ))}
            {equipments.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                目前沒有填寫具體設備項目。
              </p>
            )}
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-100">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-slate-900">專案備註</h3>
             <button
               onClick={() => setRemarks([...remarks, ""])}
               className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
             >
               <Plus className="w-4 h-4" />
               <span>新增備註</span>
             </button>
           </div>
           
           <div className="space-y-3">
             {remarks.map((remark, idx) => (
                <div key={idx} className="flex items-center gap-2">
                   <span className="text-sm font-bold text-slate-400 w-6 text-center">{idx + 1}.</span>
                   <input 
                     type="text"
                     value={remark}
                     onChange={(e) => {
                       const newRemarks = [...remarks];
                       newRemarks[idx] = e.target.value;
                       setRemarks(newRemarks);
                     }}
                     className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                     placeholder="輸入備註內容..."
                   />
                   <button
                     onClick={() => setRemarks(remarks.filter((_, i) => i !== idx))}
                     className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             ))}
             {remarks.length === 0 && (
               <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                 目前無備註事項。
               </p>
             )}
           </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-indigo-200 transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:-translate-y-0.5"
        >
          <Save className="w-5 h-5" />
          <span>儲存變更</span>
        </button>
      </div>
    </div>
  );
}
