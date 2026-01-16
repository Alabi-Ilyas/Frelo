const Task = require("../models/Task");
const Project = require("../models/Project");

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignee, dueDate } = req.body;

    const projectExists = await Project.findById(project);
    if (!projectExists) return res.status(404).json({ message: "Project not found" });

    const newTask = await Task.create({ title, description, project, assignee, dueDate });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("project", "name").populate("assignee", "name email");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name")
      .populate("assignee", "name email");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, assignee, dueDate } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, assignee, dueDate },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tasks for a specific project
exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignee", "name email")
      .populate("project", "name");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
