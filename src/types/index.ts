export type PhaseType = "stop" | "construction" | "other" | "pssr" | "standby" | "start";

export interface ProjectPhase {
  id: string;
  type: PhaseType;
  days: number;
}

export interface OtherPhase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  model: string;
  tagNo: string;
  isNew: boolean;
  partsRequired: string; // Keep for legacy/custom notes
  selectedParts?: string[]; // Array of selected predefined parts
}

export interface Project {
  id: string;
  order: number;
  name?: string; // 專案名稱
  plant?: string; // 廠區
  unit: string;
  type: string;
  startDate: string; // YYYY-MM-DD (mapped to Stop Start)
  endDate: string; // YYYY-MM-DD (mapped to Stop End)
  constructionStartDate?: string; // YYYY-MM-DD
  constructionEndDate?: string; // YYYY-MM-DD
  otherPhases?: OtherPhase[];
  phases: ProjectPhase[]; // legacy support
  remarks: string[];
  manager?: string;
  maintenanceCount?: number;
  newInstallCount?: number;
  status?: string;
  progress?: number;
  equipments?: EquipmentItem[]; // List of equipment
  dailyTasks?: Record<string, string>;
  caseNumbers?: string[]; // 案號列表
  archived?: boolean;
  
  // deprecated flat fields, keeping for legacy compatibility briefly if needed
  equipmentModel?: string;
  equipmentTagNo?: string;
  partsRequired?: string;
}
