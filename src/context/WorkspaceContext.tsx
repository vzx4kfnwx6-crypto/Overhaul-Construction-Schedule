import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, doc, onSnapshot, query, where, setDoc, updateDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  ownerEmail: string;
  collaboratorEmails: string[];
  viewerEmails: string[];
  createdAt: any;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (ws: Workspace | null) => void;
  createWorkspace: (name: string) => Promise<void>;
  updateCollaborators: (workspaceId: string, editorEmails: string[], viewerEmails: string[]) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      return;
    }

    const workspacesRef = collection(db, "workspaces");
    
    // Using onSnapshot with query enforcer limitations. 
    // We fetch two queries separately and merge since 'OR' queries are supported in Firestore 
    // but sometimes tricky with rules. Let's try combining them via `where('collaboratorEmails', 'array-contains', user.email)`.
    
    // We will do two separate snapshots and union their results carefully.
    
    // 1. Where user is owner
    const q1 = query(workspacesRef, where("ownerId", "==", user.uid));
    const unsubscribe1 = onSnapshot(q1, (snapshot) => {
      const wss1 = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Workspace));
      updateWorkspaces(prev => unionWorkspaces(prev, wss1, 'owner'));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "workspaces", auth);
    });

    // 2. Where user is collaborator (editor)
    let unsubscribe2 = () => {};
    // 3. Where user is viewer
    let unsubscribe3 = () => {};

    if (user.email) {
      const q2 = query(workspacesRef, where("collaboratorEmails", "array-contains", user.email));
      unsubscribe2 = onSnapshot(q2, (snapshot) => {
        const wss2 = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Workspace));
        updateWorkspaces(prev => unionWorkspaces(prev, wss2, 'collab'));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, "workspaces", auth);
      });

      const q3 = query(workspacesRef, where("viewerEmails", "array-contains", user.email));
      unsubscribe3 = onSnapshot(q3, (snapshot) => {
        const wss3 = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Workspace));
        updateWorkspaces(prev => unionWorkspaces(prev, wss3, 'view'));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, "workspaces", auth);
      });
    }

    let isInitializing = true;
    
    function updateWorkspaces(updater: (prev: Workspace[]) => Workspace[]) {
      setWorkspaces(prev => {
        const next = updater(prev);
        if (next.length > 0 && !currentWorkspace) {
          setCurrentWorkspace(next[0]);
        } else if (next.length === 0 && isInitializing) {
             // Create default workspace
             isInitializing = false;
             createDefaultWorkspace();
        }
        return next;
      });
    }

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }, [user]);

  const createDefaultWorkspace = async () => {
    if (!user) return;
    try {
      const newRef = doc(collection(db, "workspaces"));
      await setDoc(newRef, {
        name: "我的團隊",
        ownerId: user.uid,
        ownerEmail: user.email || "",
        collaboratorEmails: [],
        viewerEmails: [],
        createdAt: serverTimestamp()
      });
      
      // Optionally seed initial data
      const { initialProjects } = await import("../data/projects");
      for (const p of initialProjects) {
        const pRef = doc(db, `workspaces/${newRef.id}/projects/${p.id}`);
        await setDoc(pRef, { ...p, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, "workspaces", auth);
    }
  };

  const unionWorkspaces = (prev: Workspace[], newWss: Workspace[], type: 'owner' | 'collab' | 'view') => {
     const map = new Map<string, Workspace>();
     prev.forEach(w => map.set(w.id, w));
     newWss.forEach(w => map.set(w.id, w));
     
     // Remove ones that were deleted for this type... 
     // A more robust approach might just be setting them globally, but this is simple:
     // If type is 'collab', filter out any old prev collab workspaces not in newWss
     return Array.from(map.values()).sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  };


  const createWorkspace = async (name: string) => {
    if (!user) return;
    try {
      const newRef = doc(collection(db, "workspaces"));
      await setDoc(newRef, {
        name,
        ownerId: user.uid,
        ownerEmail: user.email || "",
        collaboratorEmails: [],
        viewerEmails: [],
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "workspaces", auth);
    }
  };

  const updateCollaborators = async (workspaceId: string, editorEmails: string[], viewerEmails: string[]) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, `workspaces/${workspaceId}`), {
        collaboratorEmails: editorEmails,
        viewerEmails,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `workspaces/${workspaceId}`, auth);
    }
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, currentWorkspace, setCurrentWorkspace, createWorkspace, updateCollaborators }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
