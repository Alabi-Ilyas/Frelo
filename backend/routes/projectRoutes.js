// routes/projectRoutes.js
const express = require("express");
const router = express.Router();
const projectController = require("../controllers/ProjectController");
const authMiddleware = require("../middleware/authMiddleware"); // checks JWT

// Get all projects for a user
router.get("/", authMiddleware, projectController.getProjects);

// Add a new project
router.post("/", authMiddleware, projectController.addProject);

// Update a project
router.put("/:id", authMiddleware, projectController.updateProject);

// Get dashboard info
router.get("/dashboard/:userId", authMiddleware, projectController.getDashboard);

module.exports = router;
