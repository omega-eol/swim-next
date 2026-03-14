export type Exercise = {
  id: string;
  distance: number;
  stroke: string;
  type: string;
  interval: number;
};

export type ExerciseSet = {
  id: string;
  order: number;
  repetitions: number;
  exerciseId: string;
  workoutSetId: string;
  exercise: Exercise;
};

export type WorkoutSet = {
  id: string;
  order: number;
  repetitions: number;
  type: string;
  workoutId: string;
  exerciseSets: ExerciseSet[];
};

export type Workout = {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  workoutSets: WorkoutSet[];
};

export const SET_TYPES = ["Warm Up", "Pre Set", "Main Set", "Cool Down"] as const;
export const STROKES = ["Free", "Back", "Breast", "Fly"] as const;
export const EXERCISE_TYPES = ["Swim", "Kick"] as const;

export function totalDistance(workout: Workout): number {
  return workout.workoutSets.reduce((sum, ws) => {
    const setDist = ws.exerciseSets.reduce((s, es) => {
      return s + es.repetitions * es.exercise.distance;
    }, 0);
    return sum + ws.repetitions * setDist;
  }, 0);
}

export function formatInterval(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
