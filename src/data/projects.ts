import { Project } from "../types";

export const initialProjects: Project[] = [
  {
    id: "1",
    order: 1,
    plant: "一廠",
    unit: "CDU2",
    type: "計劃",
    startDate: "2026-03-12",
    endDate: "2026-04-28",
    phases: [
      { id: "1-1", type: "stop", days: 8 },
      { id: "1-2", type: "construction", days: 33 },
      { id: "1-3", type: "pssr", days: 1 },
      { id: "1-4", type: "start", days: 6 },
    ],
    remarks: [
      "1.因換熱器廠商人力調度增加6日",
      "2.調整與RDS#1同日停車定檢起始日為3/16",
      "3.調整停車定檢起始日至3/12(與ARO3錯開)",
    ],
    manager: "王大明",
    maintenanceCount: 5,
    newInstallCount: 2,
    equipments: [
      {
        id: "eq-1",
        name: "主換熱器",
        model: "HEAT-EX-2000",
        tagNo: "HE-1234",
        isNew: false,
        partsRequired: "墊片x10, 耐火磚x50"
      },
      {
        id: "eq-2",
        name: "二級泵浦",
        model: "PMP-800",
        tagNo: "PM-992",
        isNew: true,
        partsRequired: "機封組x1, 軸承x2"
      }
    ],
    dailyTasks: {
      "2026-03-20": "拆機作業，起重機進場",
      "2026-03-21": "清洗內部管線並換新舊管件"
    }
  },
  {
    id: "2",
    order: 2,
    plant: "一廠",
    unit: "HDS2",
    type: "計劃",
    startDate: "2026-03-13",
    endDate: "2026-05-02",
    phases: [
      { id: "2-1", type: "stop", days: 7 },
      { id: "2-2", type: "construction", days: 33 },
      { id: "2-3", type: "pssr", days: 1 },
      { id: "2-4", type: "start", days: 10 },
    ],
    remarks: [
      "1.停車段因「觸媒鈍化劑循環」增加1日",
      "2.因反應器R-2202B溫度計更新增加工期8日",
      "3.配合CDU#2時程調整為3/13~5/2。",
    ],
  },
  {
    id: "3",
    order: 3,
    unit: "HYD1",
    type: "計劃",
    startDate: "2026-03-16",
    endDate: "2026-04-27",
    phases: [
      { id: "3-1", type: "stop", days: 8 },
      { id: "3-2", type: "construction", days: 24 },
      { id: "3-3", type: "pssr", days: 1 },
      { id: "3-4", type: "start", days: 10 },
    ],
    remarks: [],
  },
  {
    id: "4",
    order: 4,
    unit: "RDS1",
    type: "計劃",
    startDate: "2026-03-16",
    endDate: "2026-04-25",
    phases: [
      { id: "4-1", type: "stop", days: 7 },
      { id: "4-2", type: "construction", days: 25 },
      { id: "4-3", type: "pssr", days: 1 },
      { id: "4-4", type: "start", days: 8 },
    ],
    remarks: [],
  },
  {
    id: "5",
    order: 5,
    unit: "RCC1",
    type: "計劃",
    startDate: "2026-03-09",
    endDate: "2026-04-21",
    phases: [
      { id: "5-1", type: "stop", days: 7 },
      { id: "5-2", type: "construction", days: 30 },
      { id: "5-3", type: "pssr", days: 1 },
      { id: "5-4", type: "start", days: 6 },
    ],
    remarks: [
      "1.申請CO鍋爐延長替代工檢，提前1年定檢",
      "2.因配合換熱器廠商人力調度，以及再生器耐火材檢修，增加3天工期",
    ],
  },
  {
    id: "9",
    order: 9,
    unit: "SAR2(計)",
    type: "計劃",
    startDate: "2026-03-11",
    endDate: "2026-04-27",
    phases: [
      { id: "9-1", type: "stop", days: 4 },
      { id: "9-2", type: "construction", days: 21 },
      { id: "9-3", type: "pssr", days: 1 },
      { id: "9-4", type: "standby", days: 18 },
      { id: "9-5", type: "start", days: 4 },
    ],
    remarks: [
      "1.計劃性停車工檢",
      "2.因考量廢酸處理需求，停車時程調整為3/11~4/27。",
    ],
  },
];
