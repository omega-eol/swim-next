import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function getWorkoutForUser(id: string, userId: string) {
  return prisma.workout.findFirst({ where: { id, userId } });
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
    include: {
      workoutSets: {
        orderBy: { order: "asc" },
        include: {
          exerciseSets: {
            orderBy: { order: "asc" },
            include: { exercise: true },
          },
        },
      },
    },
  });

  if (!workout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(workout);
}

export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getWorkoutForUser(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  // Delete all existing workout sets (cascade deletes exercise sets + exercises)
  await prisma.workoutSet.deleteMany({ where: { workoutId: id } });

  // Recreate workout sets and exercises from the body
  const workoutSets = body.workoutSets ?? [];
  for (let i = 0; i < workoutSets.length; i++) {
    const ws = workoutSets[i];
    const workoutSet = await prisma.workoutSet.create({
      data: {
        order: i + 1,
        repetitions: ws.repetitions ?? 1,
        type: ws.type,
        workoutId: id,
      },
    });

    const exerciseSets = ws.exerciseSets ?? [];
    for (let j = 0; j < exerciseSets.length; j++) {
      const es = exerciseSets[j];
      const exercise = await prisma.exercise.create({
        data: {
          distance: es.exercise.distance,
          stroke: es.exercise.stroke ?? "Free",
          type: es.exercise.type ?? "Swim",
          interval: es.exercise.interval,
        },
      });
      await prisma.exerciseSet.create({
        data: {
          order: j + 1,
          repetitions: es.repetitions ?? 1,
          exerciseId: exercise.id,
          workoutSetId: workoutSet.id,
        },
      });
    }
  }

  const updated = await prisma.workout.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      type: body.type ?? existing.type,
    },
    include: {
      workoutSets: {
        orderBy: { order: "asc" },
        include: {
          exerciseSets: {
            orderBy: { order: "asc" },
            include: { exercise: true },
          },
        },
      },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getWorkoutForUser(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.workout.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
