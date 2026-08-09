import express from "express";
import cors from "cors";
import "./config/firebase.js";
import userController from "./users/user.controller.js";
import courseController from "./courses/course.controller.js";
import providerController from "./providers/provider.controller.js";
import comparisonController from "./comparisons/comparison.controller.js";
import insightController from "./insights/insight.controller.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userController);
app.use("/api/courses", courseController);
app.use("/api/providers", providerController);
app.use("/api/comparisons", comparisonController);
app.use("/api/insights", insightController);

app.get("/health", (req, res) => {
   res.status(200).json({ status: "OK", timestamp: new Date() });
});

export default app;