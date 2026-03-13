// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware"); // checks JWT

// Get all tasks for a user
router.get("/", authMiddleware, taskController.getTasks);

// Add a new task
router.post("/", authMiddleware, taskController.addTask);

// Update a task
router.put("/:id", authMiddleware, taskController.updateTask);

module.exports = router;
