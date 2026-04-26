import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Clock, AlertCircle, Plus, LayoutGrid } from "lucide-react-native";
// 1. IMPORT MODAL AND API
import { fetchAllTasks, getProjects, addTask } from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";
import AddTaskModal from "../components/modals/AddTaskModal";

export default function TasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]); // 2. PROJECTS STATE
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // 3. MODAL VISIBILITY

  const loadData = async () => {
    try {
      // Fetch both tasks and projects in parallel for the modal
      const [taskRes, projectRes] = await Promise.all([
        fetchAllTasks(),
        getProjects(),
      ]);

      if (taskRes.success) setTasks(taskRes.tasks);
      if (projectRes.success) setProjects(projectRes.projects);
    } catch (err) {
      console.error("Data load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // 4. HANDLE NEW TASK SAVE
  const handleSaveTask = async (projectId, taskData) => {
    try {
      setLoading(true);
      // Call API with two separate arguments as defined in your apiCalls.js
      const res = await addTask(projectId, taskData);

      // Your backend returns R.created(res, { task, ... })
      if (res.task || res.success) {
        loadData(); // Refresh list
        setModalVisible(false);
      } else {
        Alert.alert("Error", res.message || "Could not create task");
      }
    } catch (err) {
      // Log the specific backend error message for easier debugging
      console.error("Add task error:", err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.message || "Server connection failed";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Overdue":
        return "#EF4444";
      case "In Progress":
        return "#F59E0B";
      case "Done":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const renderTaskCard = ({ item }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() =>
        navigation.navigate("TaskDetail", {
          taskId: item._id,
          projectId: item.projectId,
        })
      }
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "15" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.projectLabel}>{item.projectName}</Text>
      </View>

      <Text style={styles.taskTitle}>{item.text}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.footerText}>
            {item.due ? new Date(item.due).toLocaleDateString() : "No Deadline"}
          </Text>
        </View>
        {item.status === "Overdue" && <AlertCircle size={16} color="#EF4444" />}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1A1C19" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScreenHeader
        title="Task Registry"
        tagline={new Date().toDateString().toUpperCase()}
      />

      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryCount}>{tasks.length}</Text>
          <Text style={styles.summaryLabel}>Total Tasks</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, { color: "#EF4444" }]}>
            {tasks.filter((t) => t.status === "Overdue").length}
          </Text>
          <Text style={styles.summaryLabel}>Attention Required</Text>
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTaskCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <LayoutGrid size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              All systems clear. No tasks found.
            </Text>
          </View>
        }
      />

      {/* 5. ADD THE MODAL COMPONENT */}
      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
        projects={projects}
      />

      {/* 6. FAB TRIGGERS MODAL INSTEAD OF NAV */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Plus color="#FFF" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFDF8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6B7280",
    letterSpacing: 1.5,
  },
  heading: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1A1C19",
    letterSpacing: -1,
  },
  filterBtn: {
    padding: 8,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F1EB",
  },
  summaryStrip: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F1EB",
    marginBottom: 20,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryCount: { fontSize: 20, fontWeight: "900", color: "#1A1C19" },
  summaryLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "700",
  },
  divider: { width: 1, backgroundColor: "#F0F1EB" },
  listContent: { paddingHorizontal: 24, paddingBottom: 100 },
  taskCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0F1EB",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  projectLabel: { fontSize: 11, fontWeight: "700", color: "#6B7280" },
  taskTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1C19",
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#FBFDF8",
  },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerText: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 24,
    backgroundColor: "#1A1C19",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyState: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 16, color: "#9CA3AF", fontWeight: "600" },
});
