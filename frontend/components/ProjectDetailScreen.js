import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  ChevronLeft, Building2, CalendarDays, DollarSign,
  CheckCircle2, Clock, AlertCircle, Circle, Trash2, Plus,
} from "lucide-react-native";
import { getProjectDetails, updateTaskStatus, deleteTask, addTask } from "../api/apiCalls";
import AddTaskModal from "./modals/AddTaskModal";

const TASK_CFG = {
  "Done":        { icon: CheckCircle2, color: "#16A34A", bg: "#F0FDF4", text: "#16A34A" },
  "In Progress": { icon: Clock,        color: "#2563EB", bg: "#EFF6FF", text: "#2563EB" },
  "Pending":     { icon: Circle,       color: "#9CA3AF", bg: "#F9FAFB", text: "#6B7280" },
  "Overdue":     { icon: AlertCircle,  color: "#EF4444", bg: "#FEF2F2", text: "#DC2626" },
};

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function ProjectDetailScreen({ route, navigation }) {
  const { projectId } = route.params;
  const [project, setProject]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [taskModal, setTaskModal] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  const load = async () => {
    try {
      const res = await getProjectDetails(projectId);
      if (res?.success) setProject(res.project);
    } catch (e) {
      Alert.alert("Error", "Could not load project.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [projectId]));

  const handleToggleTask = async (task) => {
    const order = ["Pending", "In Progress", "Done"];
    const next  = order[(order.indexOf(task.status) + 1) % order.length];
    try {
      await updateTaskStatus(projectId, task._id, next);
      load();
    } catch (e) { console.error(e); }
  };

  const handleDeleteTask = (task) => {
    Alert.alert("Delete Task", `Remove "${task.text}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try { await deleteTask(projectId, task._id); load(); }
          catch (e) { Alert.alert("Error", "Could not delete task."); }
        },
      },
    ]);
  };

  const handleAddTask = async (pid, data) => {
    try {
      setAddingTask(true);
      await addTask(pid, data);
      setTaskModal(false);
      load();
    } catch (e) {
      Alert.alert("Error", "Could not add task.");
    } finally {
      setAddingTask(false);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#1A1C19" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={s.center}>
        <AlertCircle size={40} color="#EF4444" />
        <Text style={s.errorText}>Project not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tasks    = project.tasks ?? [];
  const progress = project.progress ?? 0;
  const doneCnt  = tasks.filter(t => t.status === "Done").length;
  const ipCnt    = tasks.filter(t => t.status === "In Progress").length;
  const pendCnt  = tasks.filter(t => t.status === "Pending").length;
  const ovCnt    = tasks.filter(t => t.status === "Overdue").length;

  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity style={s.backRow} onPress={() => navigation.goBack()}>
          <ChevronLeft size={18} color="#6B7280" />
          <Text style={s.backText}>Projects</Text>
        </TouchableOpacity>

        {/* Hero card */}
        <View style={s.heroCard}>
          <View style={s.heroTop}>
            <View style={s.statusBadge}>
              <Text style={s.statusText}>{project.status}</Text>
            </View>
          </View>
          <Text style={s.heroName}>{project.name}.</Text>

          <View style={s.heroMeta}>
            {project.clientId?.name && (
              <View style={s.metaItem}>
                <Building2 size={14} color="#426900" />
                <Text style={s.metaText}>{project.clientId.name}</Text>
              </View>
            )}
            {project.deadline && (
              <View style={s.metaItem}>
                <CalendarDays size={14} color="#9CA3AF" />
                <Text style={s.metaText}>
                  {new Date(project.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </Text>
              </View>
            )}
            {project.budget > 0 && (
              <View style={s.metaItem}>
                <DollarSign size={14} color="#9CA3AF" />
                <Text style={s.metaText}>{fmt(project.budget)}</Text>
              </View>
            )}
          </View>

          {project.description ? (
            <Text style={s.heroDesc}>"{project.description}"</Text>
          ) : null}

          {/* Progress */}
          <View style={s.progressSection}>
            <View style={s.progressHeader}>
              <Text style={s.progressLabel}>Progress</Text>
              <Text style={s.progressPct}>{progress}%</Text>
            </View>
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>

        {/* Tasks */}
        <View style={s.tasksCard}>
          <View style={s.tasksHeader}>
            <View>
              <Text style={s.tasksTitle}>Tasks</Text>
              <Text style={s.tasksSub}>{doneCnt}/{tasks.length} complete</Text>
            </View>
            <TouchableOpacity style={s.addTaskBtn} onPress={() => setTaskModal(true)}>
              <Plus size={16} color="#FFF" />
              <Text style={s.addTaskText}>Add Task</Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <View style={s.emptyTasks}>
              <CheckCircle2 size={32} color="#E2E3DD" />
              <Text style={s.emptyTasksText}>No tasks yet. Add one above.</Text>
            </View>
          ) : (
            tasks.map((task) => {
              const cfg  = TASK_CFG[task.status] ?? TASK_CFG["Pending"];
              const Icon = cfg.icon;
              const isOverdue = task.status === "Overdue";
              return (
                <View key={task._id} style={s.taskRow}>
                  <TouchableOpacity onPress={() => handleToggleTask(task)} style={s.taskCheck}>
                    <Icon size={20} color={cfg.color} />
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.taskText, task.status === "Done" && s.taskDone]}>
                      {task.text}
                    </Text>
                    {task.due && (
                      <Text style={[s.taskDue, isOverdue && { color: "#EF4444" }]}>
                        {isOverdue ? "Overdue: " : "Due: "}
                        {new Date(task.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </Text>
                    )}
                  </View>
                  <View style={[s.taskBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[s.taskBadgeText, { color: cfg.text }]}>{task.status}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteTask(task)} style={s.deleteBtn}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Details sidebar */}
        <View style={s.detailsCard}>
          <Text style={s.detailsTitle}>Project Details</Text>
          {[
            { label: "Client",   value: project.clientId?.name ?? "—" },
            { label: "Status",   value: project.status },
            { label: "Budget",   value: project.budget > 0 ? fmt(project.budget) : "—" },
            { label: "Deadline", value: project.deadline ? new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
            { label: "Tasks",    value: `${tasks.length} total` },
          ].map(({ label, value }) => (
            <View key={label} style={s.detailRow}>
              <Text style={s.detailLabel}>{label}</Text>
              <Text style={s.detailValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Task summary */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Task Summary</Text>
          {[
            { label: "Done",        value: doneCnt, color: "#ADFF2F" },
            { label: "In Progress", value: ipCnt,   color: "#FFF" },
            { label: "Pending",     value: pendCnt, color: "rgba(255,255,255,0.6)" },
            { label: "Overdue",     value: ovCnt,   color: "#FCA5A5" },
          ].map(({ label, value, color }) => (
            <View key={label} style={s.summaryRow}>
              <Text style={s.summaryLabel}>{label}</Text>
              <Text style={[s.summaryValue, { color }]}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <AddTaskModal
        visible={taskModal}
        onClose={() => setTaskModal(false)}
        onSave={handleAddTask}
        projects={[{ _id: projectId, name: project.name }]}
        isLoading={addingTask}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#FBFDF8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  container: { padding: 20, paddingBottom: 100 },

  errorText: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
  backBtn:   { marginTop: 8, backgroundColor: "#1A1C19", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backBtnText: { color: "#FFF", fontWeight: "900", fontSize: 11 },

  backRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 16, marginTop: 8 },
  backText: { fontSize: 13, fontWeight: "700", color: "#6B7280" },

  heroCard: { backgroundColor: "#FFF", borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#F0F1EB" },
  heroTop:  { flexDirection: "row", justifyContent: "flex-end", marginBottom: 12 },
  statusBadge: { backgroundColor: "#ADFF2F", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusText:  { fontSize: 10, fontWeight: "900", color: "#1A1C19" },
  heroName:    { fontSize: 26, fontWeight: "900", color: "#1A1C19", letterSpacing: -1, marginBottom: 12 },
  heroMeta:    { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  metaItem:    { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText:    { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  heroDesc:    { fontSize: 14, color: "#6B7280", fontStyle: "italic", lineHeight: 20, marginBottom: 16 },

  progressSection: { marginTop: 4 },
  progressHeader:  { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel:   { fontSize: 10, fontWeight: "700", color: "#9CA3AF" },
  progressPct:     { fontSize: 10, fontWeight: "900", color: "#1A1C19" },
  progressBg:      { height: 6, backgroundColor: "#F0F1EB", borderRadius: 3, overflow: "hidden" },
  progressFill:    { height: "100%", backgroundColor: "#426900", borderRadius: 3 },

  tasksCard:   { backgroundColor: "#FFF", borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#F0F1EB" },
  tasksHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  tasksTitle:  { fontSize: 18, fontWeight: "900", color: "#1A1C19" },
  tasksSub:    { fontSize: 10, fontWeight: "700", color: "#9CA3AF", marginTop: 2 },
  addTaskBtn:  { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1A1C19", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  addTaskText: { color: "#FFF", fontSize: 11, fontWeight: "900" },

  emptyTasks:     { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyTasksText: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },

  taskRow:    { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F9FAFB", gap: 10 },
  taskCheck:  { padding: 2 },
  taskText:   { fontSize: 14, fontWeight: "700", color: "#1A1C19" },
  taskDone:   { textDecorationLine: "line-through", opacity: 0.4 },
  taskDue:    { fontSize: 10, fontWeight: "700", color: "#9CA3AF", marginTop: 3 },
  taskBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  taskBadgeText: { fontSize: 9, fontWeight: "900" },
  deleteBtn:  { padding: 6 },

  detailsCard:  { backgroundColor: "#FFF", borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#F0F1EB" },
  detailsTitle: { fontSize: 11, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1, marginBottom: 12 },
  detailRow:    { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
  detailLabel:  { fontSize: 11, fontWeight: "900", color: "#9CA3AF", letterSpacing: 0.5 },
  detailValue:  { fontSize: 12, fontWeight: "700", color: "#1A1C19" },

  summaryCard:  { backgroundColor: "#1A1C19", borderRadius: 24, padding: 20, marginBottom: 16 },
  summaryTitle: { fontSize: 11, fontWeight: "900", color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginBottom: 12 },
  summaryRow:   { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  summaryLabel: { fontSize: 11, fontWeight: "900", color: "rgba(255,255,255,0.5)", letterSpacing: 0.5 },
  summaryValue: { fontSize: 20, fontWeight: "900" },
});
