import { BryntumGantt } from "@bryntum/gantt-react";
import { ganttConfig } from "~/ganttConfig";
import type { LegacyRef } from "react";

type Props = {
  ganttRef: LegacyRef<BryntumGantt> | undefined;
};

export default function Gantt({ ganttRef }: Props) {
  return <BryntumGantt ref={ganttRef} {...ganttConfig} />;
}
