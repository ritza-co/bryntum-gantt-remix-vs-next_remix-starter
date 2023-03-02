import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  // clear database first
  await prisma.tasks.deleteMany({});
  await prisma.dependencies.deleteMany({});

  const tasks = [
    {
      id: "1000",
      name: "Launch SaaS Product",
      expanded: 1,
      iconCls: "",
      percentDone: 34.248366013071895,
      startDate: "2023-03-14T00:00:00.000Z",
      endDate: "2023-03-29T00:00:00.000Z",
      parentId: null,
      effort: 153.0,
      duration: 15.0,
      parentIndex: 0,
    },
    {
      id: "1",
      name: "Setup web server",
      expanded: 1,
      iconCls: "",
      percentDone: 42.30769230769231,
      startDate: "2023-03-14T00:00:00.000Z",
      endDate: "2023-03-29T00:00:00.000Z",
      parentId: "1000",
      effort: 13.0,
      duration: 15.0,
      parentIndex: 0,
    },
    {
      id: "11",
      name: "Install Apache",
      expanded: 0,
      iconCls: "",
      percentDone: 50.0,
      startDate: "2023-03-14T00:00:00.000Z",
      endDate: "2023-03-17T00:00:00.000Z",
      parentId: "1",
      effort: 3.0,
      duration: 3.0,
      parentIndex: 0,
    },
    {
      id: "12",
      name: "Configure firewall",
      expanded: 0,
      iconCls: "",
      percentDone: 50.0,
      startDate: "2023-03-17T22:00:00.000Z",
      endDate: "2023-03-28T00:00:00.000Z",
      parentId: "1",
      effort: 3.0,
      duration: 11.0,
      parentIndex: 1,
      constraintType: "startnoearlierthan",
      constraintDate: "2023-03-17T22:00:00.000Z",
    },
  ];

  for (const task of tasks) {
    console.log("task id: ", task.id);
    await prisma.tasks.create({
      data: task,
    });
  }

  const dependencies = [
    {
      id: "1",
      fromEvent: "11",
      toEvent: "12",
      cls: null,
      fromSide: null,
      toSide: null,
    },
  ];

  for (const dependency of dependencies) {
    await prisma.dependencies.create({
      data: dependency,
    });
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
