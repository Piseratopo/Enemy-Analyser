import express from "express";
import cors from "cors";
import "./config/firebase.js";
import userController from "./users/user.controller.js";
import courseController from "./courses/course.controller.js";
import competitorController from "./competitors/competitor.controller.js";
import insightController from "./insights/insight.controller.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userController);
app.use("/api/courses", courseController);
app.use("/api/competitors", competitorController);
app.use("/api/insights", insightController);

app.get("/health", (req, res) => {
   res.status(200).json({ status: "OK", timestamp: new Date() });
});

export default app;