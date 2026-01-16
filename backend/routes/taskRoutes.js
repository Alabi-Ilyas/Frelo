const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.post("/", taskController.createTask);
router.get("/", taskController.getTasks);
router.get("/:id", taskController.getTaskById);
router.patch("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);
router.get("/project/:projectId", taskController.getTasksByProject);

module.exports = router;
