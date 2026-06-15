import express from "express";
import groupsRouter from '../src/api/groups/index.ts';
import userRouter from '../src/api/user/index.ts';

const app = express();

app.use(express.json());

// Debug: log which env vars are available (safe — only logs presence, not values)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY,
    }
  });
});

app.use("/api/groups", groupsRouter);
app.use("/api/user", userRouter);

export default app;
