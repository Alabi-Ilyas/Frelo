import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Calendar as CalendarIcon,
  Video,
  MapPin,
  MoreHorizontal,
  Plus,
  Clock,
} from "lucide-react-native";
import { getUpcomingAppointments } from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";

// MODALS
import AppointmentDetailsModal from "../components/modals/AppointmentDetailsModal";
import CreateAppointmentModal from "../components/modals/CreateAppointmentModal";

export default function CalendarScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // MODAL STATES
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getUpcomingAppointments();
      if (res.success) setAppointments(res.appointments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // OPEN DETAILS
  const handleOpenDetails = (appt) => {
    setSelectedAppt(appt);
    setShowDetails(true);
  };

  // SAVE NEW APPOINTMENT (Triggered from Create Modal)
  const handleSaveAppointment = (newAppt) => {
    // Add to local state immediately so UI updates
    setAppointments([newAppt, ...appointments]);
    setShowCreate(false);
  };

  const renderAppointment = ({ item }) => {
    const isOnline = !!item.meetingLink;

    return (
      <TouchableOpacity
        style={styles.apptCard}
        onPress={() => handleOpenDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardMain}>
          <View style={styles.timeSection}>
            <Text style={styles.timeText}>{item.time}</Text>
            <View style={styles.durationTag}>
              <Clock size={10} color="#9CA3AF" />
              <Text style={styles.durationText}>{item.duration}m</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.contentSection}>
            <Text style={styles.apptTitle} numberOfLines={1}>
              {item.title.toUpperCase()}
            </Text>
            <Text style={styles.clientLabel}>
              CLIENT:{" "}
              <Text style={styles.clientName}>
                {item.clientId?.name?.toUpperCase() || "EXTERNAL"}
              </Text>
            </Text>

            <View style={styles.metaRow}>
              <View
                style={[
                  styles.typeBadge,
                  isOnline ? styles.onlineBg : styles.offlineBg,
                ]}
              >
                {isOnline ? (
                  <Video size={12} color="#10B981" />
                ) : (
                  <MapPin size={12} color="#6B7280" />
                )}
                <Text
                  style={[
                    styles.typeText,
                    isOnline ? styles.onlineText : styles.offlineText,
                  ]}
                >
                  {isOnline ? "VIRTUAL" : "IN-PERSON"}
                </Text>
              </View>
            </View>
          </View>
          <MoreHorizontal size={20} color="#D1D5DB" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1A1C19" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScreenHeader
        title="Schedule."
        tagline="TIME MANAGEMENT"
        onPressAdd={() => setShowCreate(true)} // LINKED TO CREATE MODAL
      />

      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        renderItem={renderAppointment}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>UPCOMING EVENTS</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <CalendarIcon size={32} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyText}>YOUR SCHEDULE IS CLEAR.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => setShowCreate(true)} // LINKED TO CREATE MODAL
            >
              <Plus size={16} color="#FFF" />
              <Text style={styles.emptyBtnText}>BOOK NOW</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* 1. THE DETAILS MODAL */}
      <AppointmentDetailsModal
        visible={showDetails}
        appointment={selectedAppt}
        onClose={() => setShowDetails(false)}
      />

      {/* 2. THE CREATE MODAL */}
      <CreateAppointmentModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleSaveAppointment}
      />
    </View>
  );
}

// ... styles remain the same as your previous design ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFDF8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 24, paddingBottom: 100 },
  listHeader: { marginTop: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 2,
  },
  apptCard: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0F1EB",
  },
  cardMain: { flexDirection: "row", padding: 20, alignItems: "center" },
  timeSection: { width: 70, alignItems: "center" },
  timeText: { fontSize: 16, fontWeight: "900", color: "#1A1C19" },
  durationTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  durationText: { fontSize: 10, fontWeight: "800", color: "#9CA3AF" },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: "#F0F1EB",
    marginHorizontal: 15,
  },
  contentSection: { flex: 1 },
  apptTitle: { fontSize: 15, fontWeight: "900", color: "#1A1C19" },
  clientLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#9CA3AF",
    marginTop: 4,
  },
  clientName: { color: "#1A1C19" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  onlineBg: { backgroundColor: "#ECFDF5" },
  offlineBg: { backgroundColor: "#F3F4F6" },
  typeText: { fontSize: 9, fontWeight: "900" },
  onlineText: { color: "#10B981" },
  offlineText: { color: "#6B7280" },
  empty: { alignItems: "center", marginTop: 80 },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: "#F0F1EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 24,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1A1C19",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyBtnText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
