import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.100.25:5001/api",
  timeout: 10000,
});

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

/* =======================
    AUTH & PROFILE
======================= */
export const registerUser = (data) => API.post("/auth/register", data).then(res => res.data);
export const loginUser = (data) => API.post("/auth/login", data).then(res => res.data);
export const getProfile = () => API.get("/users/profile").then(res => res.data);
export const updateProfile = (data) => API.patch("/users/profile", data).then(res => res.data);
export const updateSettings = (data) => API.patch("/users/preferences", data).then(res => res.data);

/* =======================
    DASHBOARD & NOTIFICATIONS
======================= */
export const getDashboardData = () => API.get("/dashboard/freelancer").then(res => res.data);
export const getNotifications = (params) => API.get("/notifications", { params }).then(res => res.data);
export const markNotifRead = (id) => API.patch(`/notifications/${id}/read`).then(res => res.data);
export const markAllNotifsRead = () => API.patch("/notifications/read-all").then(res => res.data);

/* =======================
    PROJECTS & TASKS
======================= */
export const getProjects = () => API.get("/projects").then(res => res.data);
export const getProjectDetails = (id) => API.get(`/projects/${id}`).then(res => res.data);
export const createProject = (data) => API.post("/projects", data).then((res) => res.data);
export const fetchAllTasks = (params) => API.get("/tasks", { params }).then(res => res.data);
export const addTask = (projectId, data) => API.post(`/tasks/project/${projectId}`, data).then(res => res.data);
export const updateTaskStatus = (projectId, taskId, status) =>
  API.patch(`/tasks/project/${projectId}/${taskId}/status`, { status }).then(res => res.data);
export const deleteTask = (projectId, taskId) => API.delete(`/tasks/project/${projectId}/${taskId}`).then(res => res.data);

/* =======================
    CLIENTS (CRM)
======================= */
export const getClients = (params) => API.get("/clients", { params }).then(res => res.data);
export const getClientDetails = (id) => API.get(`/clients/${id}`).then(res => res.data);
export const createClient = (data) => API.post("/clients", data).then(res => res.data);
export const updateClient = (id, data) => API.patch(`/clients/${id}`, data).then(res => res.data);

/* =======================
    INVOICES (FINANCIAL)
======================= */
export const getInvoices = (params) => API.get("/invoices", { params }).then(res => res.data);
export const createInvoice = (data) => API.post("/invoices", data).then(res => res.data);
export const getInvoiceDetails = (id) => API.get(`/invoices/${id}`).then(res => res.data);

/* =======================
    APPOINTMENTS & AVAILABILITY
======================= */
export const getAppointments = (params) => API.get("/appointments", { params }).then(res => res.data);
export const getUpcomingAppointments = () => API.get("/appointments/upcoming").then(res => res.data);
export const bookAppointment = (data) => API.post("/appointments", data).then(res => res.data);

export const getAvailability = () => API.get("/availability").then(res => res.data);
export const updateDaySlot = (data) => API.patch("/availability/day", data).then(res => res.data);
export const addBlockedDate = (data) => API.post("/availability/blocked-dates", data).then(res => res.data);

/* =======================
    CLIENT PORTAL HELPERS
======================= */
export const getMyFreelancers = () => API.get("/users/my-freelancers").then(res => res.data);
export const fetchAvailableSlots = (freelancerId, date) =>
  API.get("/appointments/available-slots", { params: { freelancerId, date } }).then(res => res.data);

export default API;