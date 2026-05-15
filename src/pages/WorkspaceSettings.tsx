import React, { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { useAuth } from "../context/AuthContext";
import { Users, Mail, Plus, X, Shield, ArrowRight } from "lucide-react";

export function WorkspaceSettings() {
  const { currentWorkspace, updateCollaborators, workspaces, setCurrentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"editor" | "viewer">("editor");
  const [isAdding, setIsAdding] = useState(false);

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">載入中...</p>
      </div>
    );
  }

  const isOwner = currentWorkspace.ownerId === user?.uid;

const currentCollaboratorEmails = currentWorkspace.collaboratorEmails || [];
  const currentViewerEmails = currentWorkspace.viewerEmails || [];

  const handleAddCollaborator = async () => {
    if (!newEmail.trim() || !newEmail.includes("@")) return;
    const email = newEmail.trim();
    if (currentCollaboratorEmails.includes(email) || currentViewerEmails.includes(email)) return;
    
    setIsAdding(true);
    let editors = [...currentCollaboratorEmails];
    let viewers = [...currentViewerEmails];
    if (newRole === "editor") {
       editors.push(email);
    } else {
       viewers.push(email);
    }
    
    await updateCollaborators(currentWorkspace.id, editors, viewers);
    setNewEmail("");
    setIsAdding(false);
  };

  const handleRemoveCollaborator = async (emailToRemove: string, role: "editor" | "viewer") => {
    let editors = [...currentCollaboratorEmails];
    let viewers = [...currentViewerEmails];
    
    if (role === "editor") {
       editors = editors.filter(e => e !== emailToRemove);
    } else {
       viewers = viewers.filter(e => e !== emailToRemove);
    }
    await updateCollaborators(currentWorkspace.id, editors, viewers);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 w-full">
      <div className="mb-8">
         <h2 className="text-3xl font-bold tracking-tight text-slate-900">團隊協作</h2>
         <p className="text-slate-500 mt-2">管理您的工作區及協作成員。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Left Column: Current Workspace Info & Members */}
         <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
               <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{currentWorkspace.name}</h3>
                    <p className="text-sm text-slate-500">擁有者: {currentWorkspace.ownerEmail}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                     <h4 className="font-bold text-slate-700">協作成員</h4>
                     <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                       共 {currentCollaboratorEmails.length + currentViewerEmails.length + 1} 人
                     </span>
                  </div>

                  <div className="space-y-3">
                     {/* Owner */}
                     <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                             {currentWorkspace.ownerEmail.substring(0, 2)}
                           </div>
                           <div>
                             <p className="text-sm font-bold text-slate-800">{currentWorkspace.ownerEmail}</p>
                             <p className="text-[10px] text-slate-500">管理員</p>
                           </div>
                        </div>
                        <Shield className="w-4 h-4 text-indigo-600" />
                     </div>

                     {/* Editors */}
                     {currentCollaboratorEmails.map(email => (
                       <div key={email} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                               {email.substring(0, 2)}
                             </div>
                             <div>
                               <p className="text-sm font-semibold text-slate-700">{email}</p>
                               <p className="text-[10px] text-slate-500">編輯者</p>
                             </div>
                          </div>
                          {isOwner && (
                            <button 
                              onClick={() => handleRemoveCollaborator(email, "editor")}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="移除協作者"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                       </div>
                     ))}
                     
                     {/* Viewers */}
                     {currentViewerEmails.map(email => (
                       <div key={email} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                               {email.substring(0, 2)}
                             </div>
                             <div>
                               <p className="text-sm font-semibold text-slate-700">{email}</p>
                               <p className="text-[10px] text-slate-500">檢視者</p>
                             </div>
                          </div>
                          {isOwner && (
                            <button 
                              onClick={() => handleRemoveCollaborator(email, "viewer")}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="移除協作者"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                       </div>
                     ))}
                     
                     {(currentCollaboratorEmails.length === 0 && currentViewerEmails.length === 0) && (
                       <div className="text-center py-6 text-sm text-slate-500 border border-dashed border-slate-300 rounded-2xl">
                         目前無其他協作者
                       </div>
                     )}
                  </div>

                  {isOwner && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                       <h4 className="font-bold text-slate-700 mb-3 text-sm">邀請新成員</h4>
                       <div className="flex gap-2">
                          <div className="relative flex-1">
                             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                             <input 
                               type="email" 
                               value={newEmail}
                               onChange={(e) => setNewEmail(e.target.value)}
                               placeholder="輸入電子郵件信箱..."
                               className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium placeholder:font-normal"
                               onKeyDown={e => {
                                 if (e.key === 'Enter') handleAddCollaborator();
                               }}
                             />
                          </div>
                          <select 
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as "editor" | "viewer")}
                            className="bg-white border flex-shrink-0 border-slate-300 text-sm rounded-xl px-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          >
                             <option value="editor">編輯者</option>
                             <option value="viewer">檢視者</option>
                          </select>
                          <button 
                             onClick={handleAddCollaborator}
                             disabled={isAdding || !newEmail.includes('@')}
                             className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold transition-colors shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">新增協作</span>
                          </button>
                       </div>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Right Column: Switch Workspaces */}
         <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
               <h3 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100">您的工作區</h3>
               
               <div className="space-y-2">
                 {workspaces.map(ws => (
                   <button 
                     key={ws.id}
                     onClick={() => setCurrentWorkspace(ws)}
                     className={`w-full flex items-center justify-between p-3 rounded-2xl transition-colors text-left ${
                       ws.id === currentWorkspace.id 
                         ? 'bg-slate-900 text-white' 
                         : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                     }`}
                   >
                     <div className="min-w-0 pr-2">
                       <p className={`font-bold text-sm truncate ${ws.id === currentWorkspace.id ? 'text-white' : 'text-slate-800'}`}>
                         {ws.name}
                       </p>
                       <p className={`text-[10px] truncate ${ws.id === currentWorkspace.id ? 'text-slate-400' : 'text-slate-500'}`}>
                         {ws.ownerEmail}
                       </p>
                     </div>
                     {ws.id === currentWorkspace.id && (
                       <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                     )}
                   </button>
                 ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
