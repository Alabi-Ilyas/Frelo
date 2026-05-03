import axios from "axios";

const API = axios.create({
  baseURL: "http://172.20.10.3:5001/api",
  timeout: 10000,
});

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

/* ── AUTH ─────────────────────────────────────────────────────────────── */
export const registerUser = (data) =>
  API.post("/auth/register", data).then((r) => r.data);
export const loginUser = (data) =>
  API.post("/auth/login", data).then((r) => r.data);
export const changePassword = (data) =>
  API.post("/auth/change-password", data).then((r) => r.data);

/* ── USER PROFILE (shared) ────────────────────────────────────────────── */
export const getProfile = () => API.get("/users/profile").then((r) => r.data);
export const updateProfile = (data) =>
  API.patch("/users/profile", data).then((r) => r.data);
export const updateEmail = (data) =>
  API.patch("/users/email", data).then((r) => r.data);
export const updatePreferences = (data) =>
  API.patch("/users/preferences", data).then((r) => r.data);
export const deleteAccount = () =>
  API.delete("/users/account").then((r) => r.data);

/* ── DASHBOARD ────────────────────────────────────────────────────────── */
export const getDashboardData = () =>
  API.get("/dashboard/freelancer").then((r) => r.data);
export const getClientDashboard = () =>
  API.get("/dashboard/client").then((r) => r.data);

/* ── NOTIFICATIONS (shared) ───────────────────────────────────────────── */
export const getNotifications = (params) =>
  API.get("/notifications", { params }).then((r) => r.data);
export const markNotifRead = (id) =>
  API.patch(`/notifications/${id}/read`).then((r) => r.data);
export const markAllNotifsRead = () =>
  API.patch("/notifications/read-all").then((r) => r.data);
export const deleteNotification = (id) =>
  API.delete(`/notifications/${id}`).then((r) => r.data);

/* ── PROJECTS ─────────────────────────────────────────────────────────── */
// Freelancer
export const getProjects = (params) =>
  API.get("/projects", { params }).then((r) => r.data);
export const getProjectDetails = (id) =>
  API.get(`/projects/${id}`).then((r) => r.data);
export const createProject = (data) =>
  API.post("/projects", data).then((r) => r.data);
export const updateProject = (id, data) =>
  API.patch(`/projects/${id}`, data).then((r) => r.data);
export const deleteProject = (id) =>
  API.delete(`/projects/${id}`).then((r) => r.data);
// Client
export const getClientProjects = () =>
  API.get("/projects/client/me").then((r) => r.data);
export const getClientProjectById = (id) =>
  API.get(`/projects/client/${id}`).then((r) => r.data);

/* ── TASKS (freelancer only) ──────────────────────────────────────────── */
export const fetchAllTasks = (params) =>
  API.get("/tasks", { params }).then((r) => r.data);
export const addTask = (projectId, data) =>
  API.post(`/tasks/project/${projectId}`, data).then((r) => r.data);
export const updateTask = (projectId, taskId, data) =>
  API.patch(`/tasks/project/${projectId}/${taskId}`, data).then((r) => r.data);
export const updateTaskStatus = (projectId, taskId, status) =>
  API.patch(`/tasks/project/${projectId}/${taskId}/status`, { status }).then(
    (r) => r.data,
  );
export const deleteTask = (projectId, taskId) =>
  API.delete(`/tasks/project/${projectId}/${taskId}`).then((r) => r.data);

/* ── CLIENTS (freelancer only) ────────────────────────────────────────── */
export const getClients = (params) =>
  API.get("/clients", { params }).then((r) => r.data);
export const getClientDetails = (id) =>
  API.get(`/clients/${id}`).then((r) => r.data);
export const createClient = (data) =>
  API.post("/clients", data).then((r) => r.data);
export const updateClient = (id, data) =>
  API.patch(`/clients/${id}`, data).then((r) => r.data);
export const deleteClient = (id) =>
  API.delete(`/clients/${id}`).then((r) => r.data);

/* ── INVOICES ─────────────────────────────────────────────────────────── */
// Freelancer
export const getInvoices = (params) =>
  API.get("/invoices", { params }).then((r) => r.data);
export const getInvoiceDetails = (id) =>
  API.get(`/invoices/${id}`).then((r) => r.data);
export const createInvoice = (data) =>
  API.post("/invoices", data).then((r) => r.data);
export const updateInvoice = (id, data) =>
  API.patch(`/invoices/${id}`, data).then((r) => r.data);
export const updateInvoiceStatus = (id, status, paidBy) =>
  API.patch(`/invoices/${id}/status`, { status, paidBy }).then((r) => r.data);
export const deleteInvoice = (id) =>
  API.delete(`/invoices/${id}`).then((r) => r.data);
// Client
export const getClientInvoices = () =>
  API.get("/invoices/client/me").then((r) => r.data);
export const disputeInvoice = (id, note) =>
  API.patch(`/invoices/client/me/${id}/dispute`, { note }).then((r) => r.data);

/* ── APPOINTMENTS ─────────────────────────────────────────────────────── */
// Freelancer
export const getAppointments = (params) =>
  API.get("/appointments", { params }).then((r) => r.data);
export const getUpcomingAppointments = () =>
  API.get("/appointments/upcoming").then((r) => r.data);
export const createAppointment = (data) =>
  API.post("/appointments", data).then((r) => r.data);
export const cancelAppointment = (id, reason) =>
  API.patch(`/appointments/${id}/cancel`, { reason }).then((r) => r.data);
export const completeAppointment = (id, status) =>
  API.patch(`/appointments/${id}/complete`, { status }).then((r) => r.data);
// Client
export const getClientAppointments = () =>
  API.get("/appointments/client/me").then((r) => r.data);
export const bookAppointment = (data) =>
  API.post("/appointments/book", data).then((r) => r.data);
export const getAvailableSlots = (freelancerId, date) =>
  API.get("/appointments/available-slots", {
    params: { freelancerId, date },
  }).then((r) => r.data);
// Shared cancel
export const cancelClientAppointment = (id, reason) =>
  API.patch(`/appointments/${id}/cancel`, { reason }).then((r) => r.data);

/* ── AVAILABILITY ─────────────────────────────────────────────────────── */
// Freelancer
export const getAvailability = () =>
  API.get("/availability").then((r) => r.data);
export const updateAvailability = (data) =>
  API.put("/availability", data).then((r) => r.data);
export const addBlockedDate = (data) =>
  API.post("/availability/blocked-dates", data).then((r) => r.data);
// Client
export const getClientAvailability = () =>
  API.get("/users/availability").then((r) => r.data);
export const updateClientAvailability = (data) =>
  API.put("/users/availability", data).then((r) => r.data);

/* ── CLIENT PORTAL ────────────────────────────────────────────────────── */
export const getMyFreelancers = () =>
  API.get("/users/my-freelancers").then((r) => r.data);

export default API;
