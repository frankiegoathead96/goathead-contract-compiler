import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  const frontendUrl = process.env.FRONTEND_URL ?? `http://localhost:${process.env.FRONTEND_PORT ?? 5173}`;
  res.redirect(frontendUrl);
});

app.use("/api", router);

export default app;
