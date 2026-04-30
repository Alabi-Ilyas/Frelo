import { C } from "../utils/theme";
import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  Clock, AlertCircle, CheckCircle2, LayoutGrid,
  Plus, Trash2,
} from "lucide-react-native";
import { fetchAllTasks, getProjects, addTask, updateTaskStatus, deleteTask } from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";
import AddTaskModal from "./modals/AddTaskModal";

const FILTERS = ["All", "Pending", "In Progress", "Done", "Overdue"];

const STATUS_CFG = {
  "Pending":     { bg: "#FFFBEB", text: "#D97706", dot: "#F59E0B" },
  "In Progress": { bg: "#EFF6FF", text: "#2563EB", dot: "#3B82F6" },
  "Done":        { bg: "#F0FDF4", text: "#16A34A", dot: "#22C55E" },
  "Overdue":     { bg: "#FEF2F2", text: "#DC2626", dot: "#EF4444" },
};

const STATUS_CYCLE = ["Pending", "In Progress", "Done"];

export default function TasksScreen() {
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter]     = useState("All");
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addingTask, setAddingTask]     = useState(false);

  const load = async () => {
    try {
      const params = filter !== "All" ? { status: filter } : undefined;
      const [taskRes, projRes] = await Promise.all([fetchAllTasks(params), getProjects()]);
      if (taskRes?.success) setTasks(taskRes.tasks ?? []);
      if (projRes?.success) setProjects(projRes.projects ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, [filter]));

  const handleSaveTask = async (projectId, data) => {
    try {
      setAddingTask(true);
      await addTask(projectId, data);
      setModalVisible(false);
      load();
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message ?? "Could not create task.");
    } finally { setAddingTask(false); }
  };

  const handleCycleStatus = async (task) => {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(task.status) + 1) % STATUS_CYCLE.length];
    try {
      await updateTaskStatus(task.projectId, task._id, next);
      load();
    } catch (e) { console.error(e); }
  };

  const handleDelete = (task) => {
    Alert.alert("Delete Task", `Remove "${task.text}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try { await deleteTask(task.projectId, task._id); load(); }
          catch (e) { Alert.alert("Error", "Could not delete task."); }
        },
      },
    ]);
  };

  const stats = {
    total:      tasks.length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    overdue:    tasks.filter(t => t.status === "Overdue").length,
    done:       tasks.filter(t => t.status === "Done").length,
  };

  const renderItem = ({ item }) => {
    const cfg      = STATUS_CFG[item.status] ?? STATUS_CFG["Pending"];
    const isOverdue = item.status === "Overdue";
    const isDone    = item.status === "Done";
    const isPastDue = item.due && new Date(item.due) < new Date() && !isDone;

    return (
      <View style={[s.card, isDone && s.cardDone]}>
        {/* Status dot / cycle button */}
        <TouchableOpacity style={s.dotBtn} onPress={() => handleCycleStatus(item)}>
          <View style={[s.dot, { backgroundColor: cfg.dot }]} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={[s.taskText, isDone && s.taskDone]} numberOfLines={2}>
            {item.text}
          </Text>
          <View style={s.metaRow}>
            <View style={[s.badge, { backgroundColor: cfg.bg }]}>
              <Text style={[s.badgeText, { color: cfg.text }]}>{item.status}</Text>
            </View>
            {item.projectName && (
              <View style={s.projectBadge}>
                <Text style={s.projectBadgeText}>{item.projectName}</Text>
              </View>
            )}
            {item.due && (
              <View style={s.dueRow}>
                <Clock size={10} color={isPastDue ? "#EF4444" : "#9CA3AF"} />
                <Text style={[s.dueText, isPastDue && { color: "#EF4444" }]}>
                  {new Date(item.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item)}>
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      <ScreenHeader
        title="Tasks."
        tagline="TASK REGISTRY"
        onPressAdd={() => setModalVisible(true)}
      />

      {/* Stats strip */}
      {!loading && (
        <View style={s.statsRow}>
          {[
            { label: "Total",       value: stats.total,      icon: LayoutGrid,   color: "#000613" },
            { label: "In Progress", value: stats.inProgress, icon: Clock,        color: "#2563EB" },
            { label: "Overdue",     value: stats.overdue,    icon: AlertCircle,  color: "#EF4444" },
            { label: "Done",        value: stats.done,       icon: CheckCircle2, color: "#16A34A" },
          ].map(({ label, value, icon: Icon, color }) => (
            <View key={label} style={s.statBox}>
              <Icon size={14} color={color} />
              <Text style={[s.statValue, { color }]}>{value}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Filter tabs */}
      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterTab, filter === f && s.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color="#000613" /></View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={i => i._id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <LayoutGrid size={48} color="#e6e8ea" />
              <Text style={s.emptyText}>No tasks found.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={s.fab} onPress={() => setModalVisible(true)}>
        <Plus size={26} color="#FFF" />
      </TouchableOpacity>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
        projects={projects}
        isLoading={addingTask}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list:   { paddingHorizontal: 16, paddingBottom: 100 },

  statsRow: {
    flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "rgba(196,198,207,0.4)",
  },
  statBox:  { flex: 1, alignItems: "center", gap: 2 },
  statValue:{ fontSize: 16, fontWeight: "900" },
  statLabel:{ fontSize: 8, fontWeight: "700", color: "#9CA3AF" },

  filterRow: {
    flexDirection: "row", paddingHorizontal: 8, paddingVertical: 8,
    backgroundColor: "#f3f4f5", gap: 4,
  },
  filterTab:       { flex: 1, paddingVertical: 7, alignItems: "center", borderRadius: 10 },
  filterTabActive: { backgroundColor: "#FFF" },
  filterText:      { fontSize: 9, fontWeight: "900", color: "#9CA3AF" },
  filterTextActive:{ color: "#000613" },

  card: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: "#FFF", borderRadius: 18, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)", gap: 10,
  },
  cardDone: { opacity: 0.6 },

  dotBtn: { paddingTop: 3 },
  dot:    { width: 10, height: 10, borderRadius: 5 },

  taskText: { fontSize: 14, fontWeight: "700", color: "#000613", lineHeight: 20 },
  taskDone: { textDecorationLine: "line-through", opacity: 0.5 },

  metaRow:      { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText:    { fontSize: 9, fontWeight: "900" },
  projectBadge: { backgroundColor: "#000613", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  projectBadgeText: { fontSize: 9, fontWeight: "900", color: "#FFF" },
  dueRow:       { flexDirection: "row", alignItems: "center", gap: 3 },
  dueText:      { fontSize: 10, fontWeight: "700", color: "#9CA3AF" },

  deleteBtn: { padding: 4, marginTop: 2 },

  fab: {
    position: "absolute", bottom: 30, right: 24,
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: "#000613", justifyContent: "center", alignItems: "center",
    elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },

  empty:     { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { color: "#9CA3AF", fontWeight: "600" },
});
