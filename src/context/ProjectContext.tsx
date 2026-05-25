import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Project } from "../types";
import { useWorkspace } from "./WorkspaceContext";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

export interface CustomPhaseDef {
  id: string;
  name: string;
  color: string;
}

export interface GlobalSettings {
  stopColor: string;
  constructionColor: string;
  customPhases: CustomPhaseDef[];
}

const defaultGlobalSettings: GlobalSettings = {
  stopColor: "#94a3b8", // UI text-slate-400 equivalent
  constructionColor: "#f59e0b", // amber-500
  customPhases: [],
};

interface ProjectContextType {
  projects: Project[];
  updateProject: (project: Project) => void;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  globalSettings: GlobalSettings;
  updateGlobalSettings: (settings: GlobalSettings) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<Project[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(defaultGlobalSettings);

  useEffect(() => {
    if (!currentWorkspace) {
      setProjects([]);
      return;
    }

    const projectsRef = collection(db, `workspaces/${currentWorkspace.id}/projects`);
    const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
      const projData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
      setProjects(projData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `workspaces/${currentWorkspace.id}/projects`, auth);
    });

    return () => unsubscribe();
  }, [currentWorkspace]);

  const updateProject = async (updatedProject: Project) => {
    if (!currentWorkspace) return;
    try {
      const pRef = doc(db, `workspaces/${currentWorkspace.id}/projects/${updatedProject.id}`);
      await updateDoc(pRef, { ...updatedProject, updatedAt: serverTimestamp() });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `workspaces/${currentWorkspace.id}/projects/${updatedProject.id}`, auth);
    }
  };

  const addProject = async (newProject: Project) => {
    if (!currentWorkspace) return;
    try {
      const pRef = doc(db, `workspaces/${currentWorkspace.id}/projects/${newProject.id}`);
      await setDoc(pRef, { ...newProject, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    } catch (e) {
       handleFirestoreError(e, OperationType.CREATE, `workspaces/${currentWorkspace.id}/projects/${newProject.id}`, auth);
    }
  };

  const deleteProject = async (id: string) => {
    if (!currentWorkspace) return;
    try {
      const pRef = doc(db, `workspaces/${currentWorkspace.id}/projects/${id}`);
      await deleteDoc(pRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `workspaces/${currentWorkspace.id}/projects/${id}`, auth);
    }
  };

  const updateGlobalSettings = (settings: GlobalSettings) => {
    setGlobalSettings(settings);
  };

  return (
    <ProjectContext.Provider value={{ projects, updateProject, addProject, deleteProject, globalSettings, updateGlobalSettings }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}

