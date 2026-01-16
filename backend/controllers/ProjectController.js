const Project = require("../models/Project");

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, owner } = req.body;

    if (!owner) return res.status(400).json({ message: "Owner is required" });

    const newProject = await Project.create({ name, description, owner });
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("owner", "name email");
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("owner", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
