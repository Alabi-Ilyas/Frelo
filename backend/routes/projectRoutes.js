const express = require("express");
const router = express.Router();
const projectController = require("../controllers/ProjectController");

router.post("/", projectController.createProject);
router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProjectById);
router.patch("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

module.exports = router;
