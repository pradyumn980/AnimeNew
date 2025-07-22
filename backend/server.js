import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import avatarRoutes from './routes/avatarRoutes.js'
import connectDB from "./config/database.js";
import cors from "cors";
import dotenv from "dotenv";
// import path from "path";
dotenv.config();
connectDB();
console.log("Mongo URI:", process.env.MONGODB_URI);
const app = express();
//ilu
app.use(cors({ origin: "http://localhost:9000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api",avatarRoutes)

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
