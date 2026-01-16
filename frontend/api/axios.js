import axios from "axios";

// ✅ Backend URL (update if your backend is hosted elsewhere)
const BASE_URL = "http://localhost:5000/api"; 
// e.g. use your backend deployed URL like: "https://frelo-backend.onrender.com/api"

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptors for tokens (if you’re using authentication)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================================
// 📁 USERS API
// ================================
export const UserAPI = {
  register: (data) => api.post("/users/register", data),
  login: (data) => api.post("/users/login", data),
  getProfile: () => api.get("/users/profile"),
};

// ================================
// 📁 PROJECTS API
// ================================
export const ProjectAPI = {
  create: (data) => api.post("/projects", data),
  getAll: () => api.get("/projects"),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// ================================
// 📁 TASKS API
// ================================
export const TaskAPI = {
  create: (data) => api.post("/tasks", data),
  getAll: () => api.get("/tasks"),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export default api;
