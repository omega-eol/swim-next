import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import WorkoutEditor from "@/components/WorkoutEditor";
import type { Workout } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function WorkoutPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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

  if (!workout) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <Link href="/workouts" className="text-blue-600 font-bold text-xl">
          Swim
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 text-sm truncate">{workout.name || "Untitled"}</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <WorkoutEditor initial={workout as unknown as Workout} />
      </main>
    </div>
  );
}
