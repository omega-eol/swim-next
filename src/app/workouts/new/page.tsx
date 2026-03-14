import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import WorkoutEditor from "@/components/WorkoutEditor";

export default async function NewWorkoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <Link href="/workouts" className="text-blue-600 font-bold text-xl">
          Swim
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 text-sm">New Workout</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <WorkoutEditor />
      </main>
    </div>
  );
}
