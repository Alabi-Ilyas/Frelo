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

export default function ProjectScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = async () => {
    try {
      const [projRes, clientRes] = await Promise.all([
        getProjects(),
        getClients(),
      ]);

      if (projRes?.success) setProjects(projRes.projects || []);
      if (clientRes?.success) setClients(clientRes.clients || []);
    } catch (err) {
      console.error("Load Error:", err);
      Alert.alert("Error", "Could not load projects");
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
        Alert.alert("Success", "Project created successfully");
        setModalVisible(false);
        loadData();
      } else {
        Alert.alert("Error", res?.message || "Failed to create project");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setCreatingProject(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return { bg: "#D7E8CD", text: "#1A1C19" };

      case "In Progress":
        return { bg: "#1A1C19", text: "#FFFFFF" };

      default:
        return { bg: "#F3F4EF", text: "#6B7280" };
    }
  };

  const renderProjectItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() =>
          navigation.navigate("ProjectDetail", {
            projectId: item._id,
          })
        }
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
            <Calendar size={14} color="#A0A29C" />
            <Text style={styles.metaText}>
              {item.deadline
                ? new Date(item.deadline).toLocaleDateString()
                : "No Date"}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <DollarSign size={14} color="#A0A29C" />
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
        <ActivityIndicator size="large" color="#1A1C19" />
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
            <Folder size={50} color="#E2E3DD" />
            <Text style={styles.emptyText}>No active projects found</Text>
          </View>
        }
      />

      <CreateProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreateProject}
        clients={clients}
        loading={creatingProject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFDF8",
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
    borderColor: "#F0F1EB",
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
    color: "#1A1C19",
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
    borderTopColor: "#FBFDF8",
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
    color: "#A0A29C",
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
