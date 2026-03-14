"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Workout, totalDistance } from "@/lib/types";

export default function WorkoutCard({ workout }: { workout: Workout }) {
  const router = useRouter();
  const dist = totalDistance(workout);
  const setCount = workout.workoutSets.length;
  const date = new Date(workout.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm(`Delete "${workout.name}"?`)) return;
    await fetch(`/api/workouts/${workout.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Link
      href={`/workouts/${workout.id}`}
      className="block bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition p-5 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-slate-800 group-hover:text-blue-600 transition">
            {workout.name || "Untitled Workout"}
          </h2>
          {workout.description && (
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{workout.description}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="text-slate-300 hover:text-red-500 transition text-xs ml-4 shrink-0"
        >
          ✕
        </button>
      </div>

      <div className="flex gap-4 mt-3 text-sm text-slate-500">
        <span>{dist > 0 ? `${dist}m` : "0m"}</span>
        <span>·</span>
        <span>{setCount} {setCount === 1 ? "set" : "sets"}</span>
        <span>·</span>
        <span>{date}</span>
      </div>
    </Link>
  );
}
