const Task = require("../models/Task");

/**
 * GET /tasks
 * Protected
 */
exports.getTasks = async (req, res) => {
  try {
    // ✅ userId comes from auth middleware
    const userId = req.userId;

    const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

/**
 * POST /tasks
 * Protected
 */
exports.addTask = async (req, res) => {
  try {
    const { name, dueDate, projectId } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Task name is required" });
    }

    const task = await Task.create({
      name,
      dueDate,
      project: projectId || null,
      user: req.userId, // ✅ from token
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Add task error:", error);
    res.status(500).json({ message: "Something went wrong on the server" });
  }
};

/**
 * PUT /tasks/:id
 * Protected
 */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.userId }, // ✅ prevent updating others' tasks
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
};
