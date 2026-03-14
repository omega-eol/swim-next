"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Workout } from "@/lib/types";

const SET_COLORS: Record<string, string> = {
  "Warm Up": "#93c5fd",
  "Pre Set": "#86efac",
  "Main Set": "#3b82f6",
  "Cool Down": "#a78bfa",
};

export default function WorkoutChart({ workout }: { workout: Workout }) {
  const data = workout.workoutSets.map((ws) => {
    const dist = ws.exerciseSets.reduce(
      (s, es) => s + es.repetitions * es.exercise.distance,
      0
    ) * ws.repetitions;

    return {
      name: ws.type,
      distance: dist,
      color: SET_COLORS[ws.type] ?? "#94a3b8",
    };
  });

  if (data.every((d) => d.distance === 0)) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-medium text-slate-700 mb-4">Distance by Set</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit="m" />
          <Tooltip
            formatter={(value) => [`${value}m`, "Distance"]}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="distance" radius={[4, 4, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
