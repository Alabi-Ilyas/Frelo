const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");


exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.userId }).sort({
      createdAt: -1,
    });

    // Attach progress manually
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });

        const completed = tasks.filter((t) => t.done).length;
        const progress = tasks.length
          ? Math.round((completed / tasks.length) * 100)
          : 0;

        return {
          ...project.toObject(),
          progress,
        };
      })
    );

    res.json(projectsWithProgress);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};


exports.addProject = async (req, res) => {
  try {
    const { title, client, color } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const project = await Project.create({
      title,
      client,
      color: color || "#0A2166",
      user: req.userId, // ✅ FROM TOKEN
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Add project error:", error);
    res.status(500).json({ message: "Something went wrong on the server" });
  }
};


exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const tasks = await Task.find({ user: req.userId });
    const projects = await Project.find({ user: req.userId });

    const ongoing = tasks.filter((t) => !t.done).length;
    const completed = tasks.filter((t) => t.done).length;

    const projectStats = await Promise.all(
      projects.map(async (project) => {
        const projectTasks = await Task.find({ project: project._id });
        const done = projectTasks.filter((t) => t.done).length;

        return {
          title: project.title,
          client: project.client,
          progress: projectTasks.length
            ? Math.round((done / projectTasks.length) * 100)
            : 0,
        };
      })
    );

    res.json({
      user,
      tasks: {
        ongoing,
        completed,
        total: tasks.length,
      },
      projects: projectStats,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
