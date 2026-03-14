import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { totalDistance } from "@/lib/types";
import type { Workout } from "@/lib/types";
import WorkoutCard from "@/components/WorkoutCard";

export default async function WorkoutsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-blue-600">Swim</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{session.user.email}</span>
          <form action="/api/auth/signout" method="POST">
            <button className="text-sm text-slate-600 hover:text-slate-900 transition">
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">My Workouts</h1>
          <Link
            href="/workouts/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + New Workout
          </Link>
        </div>

        {workouts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">No workouts yet.</p>
            <p className="text-sm mt-1">Create your first workout to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {workouts.map((w) => (
              <WorkoutCard key={w.id} workout={w as unknown as Workout} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
