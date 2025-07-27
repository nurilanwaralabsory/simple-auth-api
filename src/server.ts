import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";

import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to Simple Auht API!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
