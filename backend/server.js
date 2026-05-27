import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import avatarRoutes from "./routes/avatarRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import connectDB from "./config/database.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
connectDB();

const app = express();

// ✅ Allow localhost (dev) and all Vercel deployments for this project
const allowedOriginPatterns = [
  /^http:\/\/localhost:\d+$/,               // any localhost port
  /^https:\/\/anime-new[^.]*\.vercel\.app$/, // all animenew vercel previews
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser requests (e.g. Postman, server-to-server)
      if (!origin) return callback(null, true);
      const allowed = allowedOriginPatterns.some((pattern) => pattern.test(origin));
      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin not allowed → ${origin}`));
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
app.use("/api/payment", paymentRoutes);

// ✅ Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
