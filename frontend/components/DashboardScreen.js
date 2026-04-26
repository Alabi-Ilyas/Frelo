import React, { useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl, // Added for manual sync
} from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // Added for auto-refresh
import { StatusBar } from "expo-status-bar";
import {
  Sparkles,
  Briefcase,
  Zap,
  Plus,
  ChevronRight,
  RefreshCcw,
} from "lucide-react-native";
import { useAuth } from "../components/context/AuthContext";
import { getDashboardData } from "../api/apiCalls";

export default function DashboardScreen({ navigation }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Logic wrapped in useCallback
  const fetchMyData = async () => {
    try {
      const res = await getDashboardData();
      if (res.success) {
        setData(res);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 2. Refresh every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!authLoading) {
        fetchMyData();
      }
    }, [authLoading, isAuthenticated]),
  );

  // 3. Manual Pull-to-Refresh logic
  const onRefresh = () => {
    setRefreshing(true);
    fetchMyData();
  };

  if (authLoading || (loading && !data)) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1A1C19" />
        <Text style={styles.loaderText}>SYNCING WORKSPACE...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1A1C19"
          />
        }
      >
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View>
            <Text style={styles.tagline}>THE VERDANT EDITION</Text>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(" ")[0] || "User"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.profileCircle}
          >
            <Text style={styles.profileInitials}>{user?.name?.[0] || "U"}</Text>
          </TouchableOpacity>
        </View>

        {/* HERO STATS - Highlighting Live Counts */}
        <View style={styles.heroGrid}>
          <View style={[styles.statCard, styles.bgPrimary]}>
            <Briefcase size={20} color="#fff" />
            <Text style={styles.statNumber}>
              {data?.stats?.activeProjects ?? 0}
            </Text>
            <Text style={styles.statLabel}>ACTIVE PROJECTS</Text>
          </View>
          <View style={[styles.statCard, styles.bgSecondary]}>
            <Zap size={20} color="#000" />
            <Text style={[styles.statNumber, { color: "#000" }]}>
              {data?.stats?.pendingTaskCount ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: "#000" }]}>
              URGENT TASKS
            </Text>
          </View>
        </View>

        {/* PRIORITY WORKFLOW */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PRIORITY WORKFLOW</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Tasks")}>
            <Text style={styles.viewAll}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {data?.pendingTasks && data.pendingTasks.length > 0 ? (
          data.pendingTasks.map((task) => (
            <TouchableOpacity key={task._id} style={styles.itemCard}>
              <View style={styles.iconBox}>
                <Sparkles size={18} color="#6B7280" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {task.text || task.title}
                </Text>
                <Text style={styles.itemSub}>
                  {task.projectName || "Standard Infrastructure"}
                </Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <RefreshCcw size={24} color="#E2E3DD" />
            <Text style={styles.emptyText}>No pending tasks found.</Text>
          </View>
        )}

        {/* FAB for Project Creation */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("Projects")}
        >
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FBFDF8" },
  container: { padding: 24, paddingBottom: 100 },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBFDF8",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#1A1C19",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  tagline: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#6B7280",
    marginBottom: 4,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    color: "#1A1C19",
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E2E3DD",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  profileInitials: { fontWeight: "bold", color: "#1A1C19" },
  heroGrid: { flexDirection: "row", gap: 12, marginBottom: 32 },
  statCard: {
    flex: 1,
    padding: 24,
    borderRadius: 32,
    justifyContent: "space-between",
    height: 160,
  },
  bgPrimary: { backgroundColor: "#1A1C19" },
  bgSecondary: { backgroundColor: "#D7E8CD" },
  statNumber: {
    fontSize: 42,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#A0A29C",
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: "#1A1C19",
  },
  viewAll: { fontSize: 10, fontWeight: "bold", color: "#6B7280" },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F1EB",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  itemTitle: { fontSize: 16, fontWeight: "700", color: "#1A1C19" },
  itemSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    opacity: 0.5,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 12,
    fontSize: 12,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1A1C19",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
});
