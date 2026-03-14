# Swim

A swimming workout planner that lets you build, organize, and track your pool sessions.

## What it does

Swim gives you a clean interface to design structured swim workouts before you hit the water. You can break each session into named sets — Warm Up, Pre Set, Main Set, and Cool Down — and fill each set with individual exercises that specify distance, stroke (Free, Back, Breast, Fly), exercise type (Swim or Kick), repetitions, and interval time.

Sets and exercises are fully drag-and-drop reorderable, so you can restructure a workout on the fly. A bar chart gives you an at-a-glance view of how distance is distributed across your sets. The app tracks total distance across the whole workout and updates it in real time as you edit.

All workouts are saved to your account, so you can revisit, clone ideas from past sessions, and build up a personal library over time.

## Features

- **User accounts** — register and log in with email and password
- **Workout builder** — create workouts with multiple sets and exercises
- **Set types** — Warm Up, Pre Set, Main Set, Cool Down
- **Exercise detail** — distance, stroke, type (Swim / Kick), repetitions, interval
- **Drag-and-drop** — reorder sets and exercises within a set
- **Live distance tracking** — total workout distance updates as you edit
- **Distance chart** — bar chart breakdown of distance by set type
- **Full CRUD** — create, edit, and delete workouts

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via Prisma ORM |
| Auth | NextAuth.js (credentials, JWT) |
| Drag & drop | dnd-kit |
| Charts | Recharts |

## Getting started

```bash
# Install dependencies
npm install

# Set up the database
npx prisma migrate dev

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register an account, and start building workouts.

## Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```
