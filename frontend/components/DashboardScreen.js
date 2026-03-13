import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProjects, getTasks } from "../api/axios";
import { loadToken } from "../utils/loadToken";
import { setAuthToken } from "../api/axios";

export default function Dashboard({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const token = await loadToken();
        if (!token) {
          navigation.replace("SignIn");
          return;
        }
        setAuthToken(token);

        const [taskRes, projectRes] = await Promise.all([
          getTasks(),
          getProjects(),
        ]);

        const allTasks =
          taskRes.tasks || (Array.isArray(taskRes) ? taskRes : []);
        const allProjects =
          projectRes.projects || (Array.isArray(projectRes) ? projectRes : []);

        const filteredTasks = allTasks.filter((t) => {
          const s = t.status?.toLowerCase().trim();
          return (
            s === "ongoing" ||
            s === "completed" ||
            s === "done" ||
            s === "in progress"
          );
        });

        setTasks(filteredTasks.length > 0 ? filteredTasks : allTasks);
        setProjects(allProjects);
      } catch (err) {
        console.error("Dashboard Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0A2166" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* --- REFINED HEADER --- */}
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Image
            source={require("../assets/images/logo2.png")}
            style={styles.logoMain}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerRight}>
          {/* REPLACED IMAGE WITH ICON */}
          <TouchableOpacity
            style={styles.profileIconBtn}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons name="person-circle" size={45} color="#0A2166" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsIcon}>
            <Ionicons name="settings-outline" size={28} color="#0A2166" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeTitle}>👋 Welcome back, Ilyas</Text>
        <Text style={styles.welcomeSub}>Manage your tasks effectively</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#FF6600" }]}>
          <Text style={styles.statNum}>
            {
              tasks.filter((t) => t.status?.toLowerCase() !== "completed")
                .length
            }
          </Text>
          <Text style={styles.statLabel}>Ongoing</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#18C18F" }]}>
          <Text style={styles.statNum}>
            {
              tasks.filter((t) => t.status?.toLowerCase() === "completed")
                .length
            }
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>My Tasks</Text>
      {tasks.map((task) => (
        <View
          key={task._id || Math.random().toString()}
          style={styles.taskItem}
        >
          <View
            style={[
              styles.indicator,
              {
                backgroundColor:
                  task.status?.toLowerCase() === "completed"
                    ? "#18C18F"
                    : "#FF6600",
              },
            ]}
          />
          <View style={styles.taskData}>
            <Text style={styles.taskTitle}>
              {task.title || task.name || "Task Item"}
            </Text>
            <Text style={styles.taskDate}>
              {task.dueDate || task.date
                ? new Date(task.dueDate || task.date).toLocaleDateString()
                : "No Date Set"}
            </Text>
          </View>
          <Ionicons
            name={
              task.status?.toLowerCase() === "completed"
                ? "checkmark-circle"
                : "ellipsis-horizontal-circle"
            }
            size={28}
            color={
              task.status?.toLowerCase() === "completed" ? "#18C18F" : "#FF6600"
            }
          />
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
        Active Projects
      </Text>
      {projects.map((project) => (
        <View
          key={project._id || Math.random().toString()}
          style={styles.projectItem}
        >
          <View style={styles.projectTopRow}>
            <View style={styles.pIconBg}>
              <Ionicons name="folder" size={24} color="#0A2166" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.pTitle}>{project.title || "Project"}</Text>
              <Text style={styles.pClient}>
                {project.client || "No Client"}
              </Text>
            </View>
            <Text style={styles.pPercent}>{project.progress || 0}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                { width: `${project.progress || 0}%` },
              ]}
            />
          </View>
        </View>
      ))}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", paddingHorizontal: 20 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  logoWrapper: {
    width: 120,
    height: 40,
    justifyContent: "center",
  },
  logoMain: {
    width: 100,
    height: 100,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileIconBtn: {
    marginRight: 10,
  },
  settingsIcon: {
    padding: 5,
  },

  welcomeBox: { marginBottom: 30 },
  welcomeTitle: { fontSize: 26, fontWeight: "bold", color: "#0A2166" },
  welcomeSub: { fontSize: 16, color: "#666", marginTop: 4 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCard: {
    width: "47%",
    height: 100,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  statNum: { fontSize: 30, color: "#FFF", fontWeight: "bold" },
  statLabel: { fontSize: 15, color: "#FFF", fontWeight: "600" },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0A2166",
    marginBottom: 15,
    marginTop: 25,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    elevation: 2,
  },
  indicator: { width: 4, height: 30, borderRadius: 2, marginRight: 15 },
  taskData: { flex: 1 },
  taskTitle: { fontSize: 17, fontWeight: "700", color: "#333" },
  taskDate: { fontSize: 13, color: "#999", marginTop: 4 },

  projectItem: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 24,
    marginBottom: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  projectTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  pIconBg: {
    width: 45,
    height: 45,
    backgroundColor: "#EBF0FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  pTitle: { fontSize: 17, fontWeight: "700", color: "#0A2166" },
  pClient: { fontSize: 13, color: "#777" },
  pPercent: { fontWeight: "bold", color: "#0A2166", fontSize: 15 },
  progressBg: { height: 8, backgroundColor: "#F0F0F0", borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: "#0A2166", borderRadius: 4 },
});
