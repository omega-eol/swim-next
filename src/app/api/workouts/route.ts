import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
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

  return NextResponse.json(workouts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const workout = await prisma.workout.create({
    data: {
      name: body.name ?? "New Workout",
      description: body.description ?? "",
      type: body.type ?? "Custom",
      userId: session.user.id,
    },
    include: {
      workoutSets: {
        include: { exerciseSets: { include: { exercise: true } } },
      },
    },
  });

  return NextResponse.json(workout, { status: 201 });
}
