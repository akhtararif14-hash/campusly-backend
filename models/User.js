const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true },
  password: String,
  description: String,
  role: {
    type: String,
    enum: ["user", "seller", "admin"],
    default: "user"
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
