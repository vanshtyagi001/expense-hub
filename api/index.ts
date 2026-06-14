import express from "express";
import groupsRouter from '../src/api/groups/index.ts';
import userRouter from '../src/api/user/index.ts';

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/groups", groupsRouter);
app.use("/api/user", userRouter);

export default app;
