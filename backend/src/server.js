import express from "express";
import cors from "cors";
import apiRoutes from "./routes/apiRoutes.js";
import { CONFIG } from "./utils/config.js";
import { errorHandler, logger } from "./utils/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "StudyQuest backend is running.", version: "1.0.0" });
});

app.use("/api", apiRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(CONFIG.PORT, () => {
  logger.info(`StudyQuest backend running on http://localhost:${CONFIG.PORT}`);
});
