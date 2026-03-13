// models/Task.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    done: { type: Boolean, default: false },
    dueDate: { type: Date },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true, // ✅ auto creates createdAt & updatedAt
  }
);

module.exports = mongoose.model("Task", taskSchema);
