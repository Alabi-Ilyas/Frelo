// apiCalls.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.22:5000/api", // Change to your deployed backend URL later
  timeout: 5000,
});

// Optional: set JWT token for authenticated routes
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

/* =======================
   USER / AUTH ROUTES
======================= */

// Register user
export const registerUser = async (data) => {
  const res = await API.post("/users/register", data);
  return res.data;
};

// Login user
export const loginUser = async (data) => {
  const res = await API.post("/users/login", data);
  return res.data;
};

// Forgot password
export const forgotPassword = async (data) => {
  const res = await API.post("/users/forgot-password", data);
  return res.data;
};

// Change password
export const changePassword = async (data) => {
  const res = await API.post("/users/change-password", data);
  return res.data;
};

// Get user profile
export const getProfile = async () => {
  const res = await API.get("/users/profile");
  return res.data;
};

/* =======================
   PROJECT ROUTES
======================= */

// Get all projects
export const getProjects = async () => {
  const res = await API.get("/projects");
  return res.data;
};

// Add a new project
export const addProject = async (data) => {
  const res = await API.post("/projects", data);
  return res.data;
};

// Update project by ID
export const updateProject = async (id, data) => {
  const res = await API.put(`/projects/${id}`, data);
  return res.data;
};

// Delete project by ID
export const deleteProject = async (id) => {
  const res = await API.delete(`/projects/${id}`);
  return res.data;
};

/* =======================
   TASK ROUTES
======================= */

// Get all tasks
export const getTasks = async () => {
  const res = await API.get("/tasks");
  return res.data;
};

// Add a new task
export const addTask = async (data) => {
  const res = await API.post("/tasks", data);
  return res.data;
};

// Update task by ID
export const updateTask = async (id, data) => {
  const res = await API.put(`/tasks/${id}`, data);
  return res.data;
};

// Delete task by ID
export const deleteTask = async (id) => {
  const res = await API.delete(`/tasks/${id}`);
  return res.data;
};
