import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  securityQuestion: { type: String },
  securityAnswer: { type: String },
  avatar: { type: String, default: null },
});

const User = mongoose.model("User", userSchema);

export default User;
