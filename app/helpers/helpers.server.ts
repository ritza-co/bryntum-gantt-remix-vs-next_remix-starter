import { json } from "@remix-run/node";
import { prisma } from "~/utils/db.server";
import type { Dependencies, Tasks } from "@prisma/client";

type GanttDataPOSTRes = {
  success: boolean;
  requestId: number;
  tasks: {
    rows: Tasks[] | [];
    removed: Tasks[] | [];
  };
  dependencies: {
    rows: Dependencies[] | [];
    removed: Dependencies[] | [];
  };
};

export function sendResponse(
  action: "added" | "deleted" | "updated" | "error" | "",
  requestId: number | null,
  error: unknown,
  taskUpdates: Tasks[],
  dependencyUpdates: Dependencies[],
  tasksRemoved: Tasks[],
  dependenciesRemoved: Dependencies[]
) {
  if (action == "error") console.log(error);
  const result: Partial<GanttDataPOSTRes> = {
    success: action === "error" ? false : true,
  };
  if (requestId !== undefined && requestId !== null)
    result.requestId = requestId;
  // updated tasks
  result.tasks = { rows: [], removed: [] };
  if (taskUpdates.length) {
    result.tasks.rows = taskUpdates;
  }
  // deleted tasks
  result.tasks.removed = [];
  if (tasksRemoved.length) {
    result.tasks.removed = tasksRemoved;
  }
  // updated dependencies
  result.dependencies = { rows: [], removed: [] };
  if (dependencyUpdates.length) {
    result.dependencies.rows = dependencyUpdates;
  }
  // deleted dependencies
  result.dependencies.removed = [];
  if (dependenciesRemoved.length) {
    result.dependencies.removed = dependenciesRemoved;
  }
  return json(result);
}

export async function createOperation(
  addObj: Tasks | Dependencies,
  table: "tasks" | "dependencies"
): Promise<{
  msg: "added" | "error";
  error: unknown;
}> {
  const data: Record<string, string | number | boolean | Date | null> = {};
  for (const [key, value] of Object.entries(addObj)) {
    if (
      key !== "baselines" &&
      key !== "from" &&
      key !== "to" &&
      key !== "$PhantomId" &&
      key !== "segments" &&
      key !== "ignoreResourceCalendar"
    ) {
      data[key] = value;
    }
  }
  try {
    if (table === "tasks") {
      await prisma.tasks.create({ data: data as Tasks });
    }
    if (table === "dependencies") {
      await prisma.dependencies.create({ data: data as Dependencies });
    }
    return { msg: "added", error: null };
  } catch (error) {
    return { msg: "error", error };
  }
}

export async function deleteOperation(
  id: string,
  table: "tasks" | "dependencies"
): Promise<{
  msg: "deleted" | "error";
  error: unknown;
}> {
  try {
    if (table === "tasks") {
      await prisma.tasks.delete({ where: { id: id } });
    }
    if (table === "dependencies") {
      await prisma.dependencies.delete({ where: { id: id } });
    }
    return { msg: "deleted", error: null };
  } catch (error) {
    return { msg: "error", error: error };
  }
}

export async function updateOperation(
  updates: Tasks[] | Dependencies[],
  table: "tasks" | "dependencies"
): Promise<{
  msg: "updated" | "error";
  error: unknown;
}> {
  try {
    await Promise.all(
      updates.map(async ({ id, ...update }) => {
        if (table === "tasks") {
          await prisma.tasks.update({
            where: { id },
            data: update,
          });
        }

        if (table === "dependencies") {
          await prisma.dependencies.update({
            where: { id },
            data: update,
          });
        }
      })
    );
    return { msg: "updated", error: null };
  } catch (error) {
    return { msg: "error", error };
  }
}
