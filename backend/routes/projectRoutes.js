const express = require("express");
const router = express.Router();
const projectController = require("../controllers/ProjectController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, projectController.getProjects);

router.post("/", authMiddleware, projectController.addProject);

router.put("/:id", authMiddleware, projectController.updateProject);

router.get(
  "/dashboard/:userId",
  authMiddleware,
  projectController.getDashboard,
);

module.exports = router;
