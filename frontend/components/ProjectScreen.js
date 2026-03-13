import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import * as Progress from "react-native-progress";
import {
  addProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../api/axios"; // 👈 Backend API

export default function ProjectScreen() {
  const [selectedTab, setSelectedTab] = useState("Active");
  const [projects, setProjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    client: "",
    color: "#0A2166",
  });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [fontsLoaded] = useFonts({
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-SemiBold": require("../assets/fonts/Outfit-SemiBold.ttf"),
  });
  if (!fontsLoaded) return null;


  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects(); 
      setProjects(data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProjects();
  }, []);

  
  const getProjectProgress = (project) => {
    return project.progress ? project.progress / 100 : 0;
  };

  
  const handleAddProject = async () => {
    if (!newProject.title.trim()) return;

    setAdding(true);
    try {
      const projectData = {
        title: newProject.title,
        client: newProject.client,
      };

      const createdProject = await addProject(projectData);

      setProjects((prev) => [createdProject, ...prev]);
      setNewProject({ title: "", client: "", color: "#0A2166" });
      setModalVisible(false);
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to add project");
    } finally {
      setAdding(false);
    }
  };

  const activeProjects = projects.filter((p) => (p.progress ?? 0) < 100);

  const completedProjects = projects.filter((p) => (p.progress ?? 0) === 100);

  const visibleProjects =
    selectedTab === "Active" ? activeProjects : completedProjects;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["Active", "Completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
            {selectedTab === tab && <View style={styles.activeLine} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Projects List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0A2166"
          style={{ marginTop: 50 }}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {visibleProjects.map((project) => {
            const progress = getProjectProgress(project);

            return (
              <View key={project._id} style={styles.projectCard}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.clientText}>Client: {project.client}</Text>
                <Progress.Bar
                  progress={progress}
                  width={null}
                  height={7}
                  color={project.color || "#0A2166"}
                  unfilledColor="#E5E5E5"
                  borderWidth={0}
                  borderRadius={10}
                  style={{ marginVertical: 8 }}
                />
                <Text style={styles.progressText}>
                  Progress {Math.round(progress * 100)}%
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Add Project Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Project</Text>

            <TextInput
              style={styles.input}
              placeholder="Project Title"
              value={newProject.title}
              onChangeText={(text) =>
                setNewProject({ ...newProject, title: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Client Name"
              value={newProject.client}
              onChangeText={(text) =>
                setNewProject({ ...newProject, client: text })
              }
            />

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={handleAddProject}
              disabled={adding}
            >
              {adding ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>Add Project</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 28,
    color: "#0A2166",
  },
  addButton: {
    backgroundColor: "#0A2166",
    width: 45,
    height: 45,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 25,
    marginTop: 10,
    marginBottom: 15,
  },
  tab: {
    alignItems: "center",
  },
  tabText: {
    fontFamily: "Outfit-Regular",
    fontSize: 18,
    color: "#A0A0A0",
  },
  activeTabText: {
    color: "#0A2166",
    fontFamily: "Outfit-SemiBold",
  },
  activeLine: {
    height: 2.5,
    backgroundColor: "#0A2166",
    width: "100%",
    marginTop: 4,
    borderRadius: 2,
  },
  projectCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectTitle: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 18,
    color: "#0A2166",
  },
  clientText: {
    fontFamily: "Outfit-Regular",
    fontSize: 15,
    color: "#444",
    marginTop: 3,
  },
  progressText: {
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "85%",
    padding: 20,
  },
  modalTitle: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 22,
    marginBottom: 15,
    color: "#0A2166",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontFamily: "Outfit-Regular",
  },
  modalBtn: {
    backgroundColor: "#0A2166",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 5,
  },
  modalBtnText: {
    color: "#fff",
    fontFamily: "Outfit-SemiBold",
    fontSize: 16,
  },
  cancelText: {
    textAlign: "center",
    marginTop: 10,
    color: "#0A2166",
    fontFamily: "Outfit-Regular",
  },
});
