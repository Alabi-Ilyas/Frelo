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
import {
  Folder,
  ChevronRight,
  User,
  Calendar,
  DollarSign,
} from "lucide-react-native";

import { getProjects, getClients, createProject } from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";
import CreateProjectModal from "../components/modals/CreateProjectModal";
import { ProjectDetailModal } from "../components/modals/ProjectDetailModal";

export default function ProjectScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Create modal
  const [modalVisible, setModalVisible] = useState(false);

  // Detail modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const loadData = async () => {
    try {
      const [projRes, clientRes] = await Promise.all([
        getProjects(),
        getClients(),
      ]);

      if (projRes?.success) {
        setProjects(projRes.projects || []);
      }

      if (clientRes?.success) {
        setClients(clientRes.clients || []);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load projects");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (projectData) => {
    try {
      setCreatingProject(true);

      const res = await createProject(projectData);

      if (res?.success) {
        Alert.alert("Success", "Project created");
        setModalVisible(false);
        loadData();
      } else {
        Alert.alert("Error", res?.message || "Failed to create project");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Connection issue");
    } finally {
      setCreatingProject(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return {
          bg: "#ADFF2F",
          text: "#000613",
        };

      case "In Progress":
        return {
          bg: "#000613",
          text: "#FFF",
        };

      default:
        return {
          bg: "#f3f4f5",
          text: "#6B7280",
        };
    }
  };

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setDetailModalVisible(true);
  };

  const closeProjectDetails = () => {
    setDetailModalVisible(false);
    setSelectedProject(null);
  };

  const renderProjectItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => openProjectDetails(item)}
      >
        <View style={styles.cardTop}>
          <View style={styles.projectInfo}>
            <Text style={styles.projectName}>{item.name}</Text>

            <View style={styles.clientRow}>
              <User size={12} color="#6B7280" />

              <Text style={styles.clientName}>
                {item.clientId?.name || "No Client"}
              </Text>
            </View>
          </View>

          <View
            style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
          >
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.metaItem}>
            <Calendar size={14} color="#75777e" />
            <Text style={styles.metaText}>
              {item.deadline
                ? new Date(item.deadline).toLocaleDateString()
                : "No Date"}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <DollarSign size={14} color="#75777e" />
            <Text style={styles.metaText}>
              {item.budget} {item.currency || "NGN"}
            </Text>
          </View>

          <ChevronRight size={16} color="#D1D5DB" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000613" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScreenHeader
        title="Projects"
        tagline="OPERATIONS"
        onPressAdd={() => setModalVisible(true)}
      />

      <FlatList
        data={projects}
        keyExtractor={(item) => item._id}
        renderItem={renderProjectItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Folder size={48} color="#e6e8ea" />
            <Text style={styles.emptyText}>No active projects found</Text>
          </View>
        }
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreateProject}
        clients={clients}
        loading={creatingProject}
      />

      {/* Project Details Modal */}
      <ProjectDetailModal
        visible={detailModalVisible}
        project={selectedProject}
        onClose={closeProjectDetails}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  projectCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  projectInfo: {
    flex: 1,
  },

  projectName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000613",
    marginBottom: 6,
  },

  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  clientName: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  cardBottom: {
    flexDirection: "row",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f8f9fa",
    alignItems: "center",
    gap: 16,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },

  metaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#75777e",
  },

  emptyState: {
    alignItems: "center",
    marginTop: 100,
  },

  emptyText: {
    marginTop: 16,
    color: "#9CA3AF",
    fontWeight: "600",
  },
});
