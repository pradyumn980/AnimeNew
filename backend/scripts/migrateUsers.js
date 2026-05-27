/**
 * One-time migration: backfill isPremium + premiumExpiresAt
 * on all users created before those fields were added.
 *
 * Run once with:  node backend/scripts/migrateUsers.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB");

const result = await mongoose.connection.db.collection("users").updateMany(
  { isPremium: { $exists: false } },          // only docs missing the field
  { $set: { isPremium: false, premiumExpiresAt: null } }
);

console.log(`✅ Backfilled ${result.modifiedCount} user document(s)`);
await mongoose.disconnect();
console.log("🔌 Disconnected");
