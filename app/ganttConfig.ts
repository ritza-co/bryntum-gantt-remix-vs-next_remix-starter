import { ProjectModel } from "@bryntum/gantt";
import type { BryntumGanttProps } from "@bryntum/gantt-react";

const project = new ProjectModel({
  taskStore: {
    autoTree: true,
    transformFlatData: true,
  },
  transport: {
    load: {
      url: "http://localhost:3000/api/gantt",
    },
    sync: {
      url: "http://localhost:3000/api/gantt",
    },
  },
  autoLoad: true,
  autoSync: true,
  validateResponse: true,
});

const ganttConfig: BryntumGanttProps = {
  columns: [{ type: "name", field: "name", width: 250 }],
  viewPreset: "weekAndDayLetter",
  barMargin: 10,
  project,
};

export { ganttConfig };
