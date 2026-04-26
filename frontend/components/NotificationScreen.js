import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Bell,
  CreditCard,
  Calendar,
  Briefcase,
  Shield,
  Trash2,
  CheckCheck,
} from "lucide-react-native";
import { listNotifications, markAllRead } from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const res = await listNotifications();
    if (res.success) setNotifications(res.notifications);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "invoice":
        return <CreditCard size={18} color="#10B981" />;
      case "appointment":
        return <Calendar size={18} color="#F59E0B" />;
      case "project":
        return <Briefcase size={18} color="#3B82F6" />;
      case "security":
        return <Shield size={18} color="#EF4444" />;
      default:
        return <Bell size={18} color="#6B7280" />;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notifCard, !item.read && styles.unreadCard]}
      onPress={() => {
        /* Logic to navigate to the specific Invoice/Project */
      }}
    >
      <View style={styles.iconCircle}>{getIcon(item.type)}</View>
      <View style={styles.content}>
        <View style={styles.notifHeader}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifMessage}>{item.message}</Text>
        <Text style={styles.timeText}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Activity"
        tagline="NOTIFICATIONS"
        rightElement={
          <TouchableOpacity onPress={markAllRead}>
            <CheckCheck size={20} color="#1A1C19" />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.empty}>Your inbox is quiet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFDF8" },
  listContent: { paddingHorizontal: 24, paddingBottom: 40 },
  notifCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFF",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F1EB",
  },
  unreadCard: { backgroundColor: "#F3FBF4", borderColor: "#D7E8CD" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: { flex: 1 },
  notifHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notifTitle: { fontSize: 15, fontWeight: "800", color: "#1A1C19" },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  notifMessage: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 18,
  },
  timeText: { fontSize: 10, fontWeight: "700", color: "#A0A29C", marginTop: 8 },
  empty: {
    textAlign: "center",
    marginTop: 100,
    color: "#9CA3AF",
    fontWeight: "600",
  },
});
