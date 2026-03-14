"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Workout,
  WorkoutSet,
  ExerciseSet,
  SET_TYPES,
  STROKES,
  EXERCISE_TYPES,
  formatInterval,
  totalDistance,
} from "@/lib/types";
import WorkoutChart from "./WorkoutChart";

// ---- helpers to create empty records ----
let _id = 0;
const uid = () => `new-${++_id}`;

function emptyExerciseSet(workoutSetId: string): ExerciseSet {
  return {
    id: uid(),
    order: 0,
    repetitions: 1,
    exerciseId: uid(),
    workoutSetId,
    exercise: { id: uid(), distance: 50, stroke: "Free", type: "Swim", interval: 60 },
  };
}

function emptyWorkoutSet(): WorkoutSet {
  const id = uid();
  return {
    id,
    order: 0,
    repetitions: 1,
    type: "Main Set",
    workoutId: "",
    exerciseSets: [emptyExerciseSet(id)],
  };
}

// ---- Sortable ExerciseSet Row ----
function ExerciseRow({
  es,
  onChange,
  onDelete,
}: {
  es: ExerciseSet;
  onChange: (updated: ExerciseSet) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: es.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  function updateExercise(field: string, value: string | number) {
    onChange({ ...es, exercise: { ...es.exercise, [field]: value } });
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 text-sm">
      <button
        {...attributes}
        {...listeners}
        className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing px-1"
        title="Drag to reorder"
      >
        ⠿
      </button>

      <input
        type="number"
        min={1}
        value={es.repetitions}
        onChange={(e) => onChange({ ...es, repetitions: Number(e.target.value) })}
        className="w-14 border border-slate-200 rounded px-2 py-1 text-center"
        title="Reps"
      />
      <span className="text-slate-400 text-xs">×</span>

      <input
        type="number"
        min={1}
        value={es.exercise.distance}
        onChange={(e) => updateExercise("distance", Number(e.target.value))}
        className="w-20 border border-slate-200 rounded px-2 py-1 text-center"
        title="Distance (m)"
      />
      <span className="text-slate-400 text-xs">m</span>

      <select
        value={es.exercise.stroke}
        onChange={(e) => updateExercise("stroke", e.target.value)}
        className="border border-slate-200 rounded px-2 py-1"
      >
        {STROKES.map((s) => <option key={s}>{s}</option>)}
      </select>

      <select
        value={es.exercise.type}
        onChange={(e) => updateExercise("type", e.target.value)}
        className="border border-slate-200 rounded px-2 py-1"
      >
        {EXERCISE_TYPES.map((t) => <option key={t}>{t}</option>)}
      </select>

      <input
        type="number"
        min={0}
        value={es.exercise.interval}
        onChange={(e) => updateExercise("interval", Number(e.target.value))}
        className="w-20 border border-slate-200 rounded px-2 py-1 text-center"
        title="Interval (seconds)"
      />
      <span className="text-slate-400 text-xs">sec</span>

      <button
        onClick={onDelete}
        className="text-slate-300 hover:text-red-400 transition ml-1"
      >
        ✕
      </button>
    </div>
  );
}

// ---- Sortable WorkoutSet Card ----
function WorkoutSetCard({
  ws,
  onChange,
  onDelete,
}: {
  ws: WorkoutSet;
  onChange: (updated: WorkoutSet) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: ws.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = ws.exerciseSets.findIndex((e) => e.id === active.id);
    const newIdx = ws.exerciseSets.findIndex((e) => e.id === over.id);
    onChange({ ...ws, exerciseSets: arrayMove(ws.exerciseSets, oldIdx, newIdx) });
  }

  function updateExerciseSet(idx: number, updated: ExerciseSet) {
    const next = [...ws.exerciseSets];
    next[idx] = updated;
    onChange({ ...ws, exerciseSets: next });
  }

  function deleteExerciseSet(idx: number) {
    onChange({ ...ws, exerciseSets: ws.exerciseSets.filter((_, i) => i !== idx) });
  }

  function addExercise() {
    onChange({ ...ws, exerciseSets: [...ws.exerciseSets, emptyExerciseSet(ws.id)] });
  }

  const setDist = ws.exerciseSets.reduce(
    (s, es) => s + es.repetitions * es.exercise.distance,
    0
  );

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <button
          {...attributes}
          {...listeners}
          className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing text-lg"
          title="Drag to reorder"
        >
          ⠿
        </button>

        <select
          value={ws.type}
          onChange={(e) => onChange({ ...ws, type: e.target.value })}
          className="border border-slate-200 rounded-lg px-2 py-1 text-sm font-medium"
        >
          {SET_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>

        <div className="flex items-center gap-1 text-sm">
          <input
            type="number"
            min={1}
            value={ws.repetitions}
            onChange={(e) => onChange({ ...ws, repetitions: Number(e.target.value) })}
            className="w-14 border border-slate-200 rounded px-2 py-1 text-center"
            title="Set repetitions"
          />
          <span className="text-slate-400 text-xs">reps</span>
        </div>

        <span className="text-xs text-slate-400 ml-auto">{ws.repetitions * setDist}m total</span>

        <button
          onClick={onDelete}
          className="text-slate-300 hover:text-red-400 transition"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 pl-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={ws.exerciseSets.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            {ws.exerciseSets.map((es, idx) => (
              <ExerciseRow
                key={es.id}
                es={es}
                onChange={(updated) => updateExerciseSet(idx, updated)}
                onDelete={() => deleteExerciseSet(idx)}
              />
            ))}
          </SortableContext>
        </DndContext>

        <button
          onClick={addExercise}
          className="text-blue-500 hover:text-blue-700 text-sm transition mt-1"
        >
          + Add exercise
        </button>
      </div>
    </div>
  );
}

// ---- Main Editor ----
export default function WorkoutEditor({ initial }: { initial?: Workout }) {
  const router = useRouter();
  const isNew = !initial?.id;

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [workoutSets, setWorkoutSets] = useState<WorkoutSet[]>(
    initial?.workoutSets ?? []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleSetDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = workoutSets.findIndex((w) => w.id === active.id);
    const newIdx = workoutSets.findIndex((w) => w.id === over.id);
    setWorkoutSets(arrayMove(workoutSets, oldIdx, newIdx));
  }

  const updateWorkoutSet = useCallback((idx: number, updated: WorkoutSet) => {
    setWorkoutSets((prev) => {
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  }, []);

  const deleteWorkoutSet = useCallback((idx: number) => {
    setWorkoutSets((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");

    const body = { name, description, workoutSets };

    const res = isNew
      ? await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        })
      : await fetch(`/api/workouts/${initial!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    if (!res.ok) {
      setError("Failed to save. Please try again.");
      setSaving(false);
      return;
    }

    const saved = await res.json();

    if (isNew) {
      // Second request to save the sets to the newly created workout
      await fetch(`/api/workouts/${saved.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, workoutSets }),
      });
      router.push(`/workouts/${saved.id}`);
    } else {
      router.refresh();
      setSaving(false);
    }
  }

  const previewWorkout: Workout = {
    id: initial?.id ?? "",
    name,
    description,
    type: initial?.type ?? "Custom",
    createdAt: initial?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: initial?.userId ?? "",
    workoutSets,
  };

  const dist = totalDistance(previewWorkout);

  return (
    <div className="space-y-6">
      {/* Header fields */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Workout name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Monday Morning"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes…"
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        {dist > 0 && (
          <p className="text-sm text-slate-500">
            Total distance: <strong className="text-slate-700">{dist}m</strong>
          </p>
        )}
      </div>

      {/* Workout Sets */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleSetDragEnd}
      >
        <SortableContext
          items={workoutSets.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {workoutSets.map((ws, idx) => (
              <WorkoutSetCard
                key={ws.id}
                ws={ws}
                onChange={(updated) => updateWorkoutSet(idx, updated)}
                onDelete={() => deleteWorkoutSet(idx)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={() => setWorkoutSets((prev) => [...prev, emptyWorkoutSet()])}
        className="w-full border-2 border-dashed border-slate-200 hover:border-blue-300 text-slate-400 hover:text-blue-500 rounded-xl py-3 text-sm transition"
      >
        + Add set
      </button>

      {/* Chart */}
      {workoutSets.length > 0 && <WorkoutChart workout={previewWorkout} />}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save workout"}
        </button>
        <button
          onClick={() => router.back()}
          className="text-slate-500 hover:text-slate-700 text-sm transition px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
