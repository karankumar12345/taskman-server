import express from "express";
import dotenv from "dotenv";
import userrouter from "./routes/user.route.js";

import connectDB from "./utils/Db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import taskrouter from "./routes/task.route.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT ;
app.use(express.json({ limit: "50mb" }));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
// Middleware for cookie parsing
app.use(cookieParser());
console.log(process.env.ORIGIN);
app.use(
    cors({
      origin: [process.env.ORIGIN],
      credentials: true,
    })
  );
app.get("/", (req, res) => {
    res.send("Server is ready");
});

app.use("/api/v1/user",userrouter)
app.use("/api/v1/task", taskrouter)
app.get("/", (req, res) => {
    res.send("Server is ready");
});

connectDB()
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
