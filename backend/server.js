import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import avatarRoutes from "./routes/avatarRoutes.js";
import connectDB from "./config/database.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
connectDB();

const app = express();

// ✅ Allow both local and production frontend
const allowedOrigins = [
  "http://localhost:5173", // or 3000, depending on your frontend port
  "https://anime-new-beta.vercel.app", // ✅ Replace with your actual Vercel frontend domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api", avatarRoutes);

// ✅ Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
