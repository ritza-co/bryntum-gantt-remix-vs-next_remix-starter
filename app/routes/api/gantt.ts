import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import crypto from "crypto";
import { prisma } from "~/utils/db.server";
import type { Dependencies, Tasks } from "@prisma/client";
import {
  sendResponse,
  createOperation,
  deleteOperation,
  updateOperation,
} from "~/helpers/helpers.server";
type SyncReqBodyTasksObj = {
  added?: Tasks[];
  updated?: Tasks[];
  removed?: Tasks[];
};

type SyncReqBodyDependenciesObj = {
  added?: Dependencies[];
  updated?: Dependencies[];
  removed?: Dependencies[];
};

type SyncReqBody = {
  type: "sync";
  reqestId: number;
  tasks: SyncReqBodyTasksObj;
  dependencies?: SyncReqBodyDependenciesObj;
};

export async function loader() {
  try {
    const tasks = await prisma.tasks.findMany();
    const dependencies = await prisma.dependencies.findMany();
    return json({
      success: true,
      tasks: {
        rows: tasks,
      },
      dependencies: {
        rows: dependencies,
      },
    });
  } catch (error) {
    return sendResponse("error", null, error, [], [], [], []);
    // return json({
    //   success: false,
    //   tasks: {
    //     rows: [],
    //   },
    //   dependencies: {
    //     rows: [],
    //   },
    // });
  }
}

export async function action({ request: req }: ActionArgs) {
  if (req.method != "POST") return json({ message: "Method not allowed" });

  const data: SyncReqBody = await req.json();
  let requestId: number | null = null;
  let lastKey: "added" | "deleted" | "updated" | "error" | "" = "";
  let err = null;
  const taskUpdates: Tasks[] = [];
  const tasksRemoved: Tasks[] = [];
  const dependencyUpdates: Dependencies[] = [];
  const dependenciesRemoved: Dependencies[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (key === "requestId") {
      requestId = value as number;
    }
    if (key === "tasks") {
      for (const [key2, value2] of Object.entries(
        value as SyncReqBodyTasksObj
      )) {
        if (key2 === "added") {
          value2.forEach((addObj) => taskUpdates.push(addObj));
          value2[0].id = crypto.randomUUID();
          const val = await createOperation(value2[0], "tasks");
          lastKey = val.msg;
          err = val.error;
        }
        if (key2 === "updated") {
          value2.forEach((updateObj) => taskUpdates.push(updateObj));
          const val = await updateOperation(value2, "tasks");
          lastKey = val.msg;
          err = val.error;
        }
        if (key2 === "removed") {
          tasksRemoved.push(value2[0]);
          const val = await deleteOperation(value2[0].id, "tasks");
          lastKey = val.msg;
          err = val.error;
        }
      }
    }
    if (key === "dependencies") {
      for (const [key2, value2] of Object.entries(
        value as SyncReqBodyDependenciesObj
      )) {
        if (key2 === "added") {
          value2[0].id = crypto.randomUUID();
          value2.forEach((addObj) => dependencyUpdates.push(addObj));
          const val = await createOperation(value2[0], "dependencies");
          lastKey = val.msg;
          err = val.error;
        }
        if (key2 === "updated") {
          value2.forEach((updateObj) => dependencyUpdates.push(updateObj));
          const val = await updateOperation(value2, "dependencies");
          lastKey = val.msg;
          err = val.error;
        }
        if (key2 === "removed") {
          dependenciesRemoved.push(value2[0]);
          const val = await deleteOperation(value2[0].id, "dependencies");
          lastKey = val.msg;
          err = val.error;
        }
      }
    }
  }
  return sendResponse(
    lastKey,
    requestId,
    err,
    taskUpdates,
    dependencyUpdates,
    tasksRemoved,
    dependenciesRemoved
  );
}
