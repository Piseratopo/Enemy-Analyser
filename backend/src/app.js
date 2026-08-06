import express from "express";
import cors from "cors";
import userController from "./users/user.controller.js";
import competitorController from "./competitors/competitor.controller.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userController);
app.use("/api/competitors", competitorController);

app.get("/health", (req, res) => {
   res.status(200).json({ status: "OK", timestamp: new Date() });
});

export default app;