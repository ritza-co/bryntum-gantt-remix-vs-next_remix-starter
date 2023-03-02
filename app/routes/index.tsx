import { useRef } from "react";
import type { LegacyRef } from "react";
import { ClientOnly } from "remix-utils";
import type { BryntumGantt } from "@bryntum/gantt-react";
import Gantt from "~/components/Gantt.client";

export default function Index() {
  const ganttRef = useRef() as LegacyRef<BryntumGantt> | undefined;
  return (
    <ClientOnly
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <p>Loading...</p>
        </div>
      }
    >
      {() => <Gantt ganttRef={ganttRef} />}
    </ClientOnly>
  );
}
