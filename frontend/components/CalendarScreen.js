import { C } from "../utils/theme";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  Calendar as CalendarIcon,
  Video,
  MapPin,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react-native";
import {
  getAppointments,
  cancelAppointment,
  completeAppointment,
  createAppointment,
  getClients,
} from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";
import AppointmentDetailModal from "./modals/AppointmentDetailsModal";
import CreateAppointmentModal from "./modals/CreateAppointmentModal";

const STATUS_STYLE = {
  Confirmed: { bg: "#F0FDF4", text: "#16A34A" },
  Pending: { bg: "#FFFBEB", text: "#D97706" },
  Cancelled: { bg: "#FEF2F2", text: "#EF4444" },
  Completed: { bg: "#f8f9fa", text: "#6B7280" },
  "No-show": { bg: "#FEF2F2", text: "#F87171" },
};

function fmt12(time) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export default function CalendarScreen() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      const [aptRes, cRes] = await Promise.all([
        getAppointments(),
        getClients(),
      ]);
      if (aptRes?.success) setAppointments(aptRes.appointments ?? []);
      if (cRes?.success) setClients(cRes.clients ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const handleCancel = async (apt) => {
    Alert.alert("Cancel Appointment", "Cancel this appointment?", [
      { text: "Keep", style: "cancel" },
      {
        text: "Cancel It",
        style: "destructive",
        onPress: async () => {
          try {
            setActionLoading(true);
            await cancelAppointment(apt._id);
            setSelected(null);
            load();
          } catch (e) {
            Alert.alert("Error", "Could not cancel.");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleComplete = async (apt, status) => {
    try {
      setActionLoading(true);
      await completeAppointment(apt._id, status);
      setSelected(null);
      load();
    } catch (e) {
      Alert.alert("Error", "Could not update appointment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createAppointment(data);
      setShowCreate(false);
      load();
    } catch (e) {
      Alert.alert("Error", "Could not create appointment.");
    }
  };

  const renderItem = ({ item }) => {
    const isOnline = !!item.meetingLink;
    const cfg = STATUS_STYLE[item.status] ?? STATUS_STYLE.Pending;
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => setSelected(item)}
        activeOpacity={0.7}
      >
        <View style={s.cardMain}>
          {/* Time */}
          <View style={s.timeSection}>
            <Text style={s.timeText}>{fmt12(item.time)}</Text>
            <View style={s.durationTag}>
              <Clock size={10} color="#9CA3AF" />
              <Text style={s.durationText}>{item.duration}m</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Content */}
          <View style={{ flex: 1 }}>
            <Text style={s.apptTitle} numberOfLines={1}>
              {item.title.toUpperCase()}
            </Text>
            <Text style={s.clientLabel}>
              CLIENT:{" "}
              <Text style={s.clientName}>
                {item.clientId?.name?.toUpperCase() ?? "EXTERNAL"}
              </Text>
            </Text>
            <View style={s.metaRow}>
              <View style={[s.typeBadge, isOnline ? s.onlineBg : s.offlineBg]}>
                {isOnline ? (
                  <Video size={11} color="#16A34A" />
                ) : (
                  <MapPin size={11} color="#6B7280" />
                )}
                <Text
                  style={[s.typeText, isOnline ? s.onlineText : s.offlineText]}
                >
                  {isOnline ? "VIRTUAL" : "IN-PERSON"}
                </Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[s.statusText, { color: cfg.text }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      <ScreenHeader
        title="Schedule."
        tagline="TIME MANAGEMENT"
        onPressAdd={() => setShowCreate(true)}
      />

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color="#000613" />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          ListHeaderComponent={
            <Text style={s.listHeader}>UPCOMING EVENTS</Text>
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={s.emptyIcon}>
                <CalendarIcon size={32} color="#9CA3AF" />
              </View>
              <Text style={s.emptyText}>YOUR SCHEDULE IS CLEAR.</Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => setShowCreate(true)}
              >
                <Plus size={16} color="#FFF" />
                <Text style={s.emptyBtnText}>BOOK NOW</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Appointment Detail Modal with cancel/complete/join */}
      <AppointmentDetailModal
        visible={!!selected}
        appointment={selected}
        actionLoading={actionLoading}
        onClose={() => setSelected(null)}
        onCancel={() => handleCancel(selected)}
        onComplete={(status) => handleComplete(selected, status)}
      />

      <CreateAppointmentModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleCreate}
        clients={clients}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listHeader: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
  },
  cardMain: { flexDirection: "row", padding: 18, alignItems: "center" },
  timeSection: { width: 68, alignItems: "center" },
  timeText: { fontSize: 15, fontWeight: "900", color: "#000613" },
  durationTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  durationText: { fontSize: 10, fontWeight: "800", color: "#9CA3AF" },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(196,198,207,0.4)",
    marginHorizontal: 14,
  },
  apptTitle: { fontSize: 14, fontWeight: "900", color: "#000613" },
  clientLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#9CA3AF",
    marginTop: 4,
  },
  clientName: { color: "#000613" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  onlineBg: { backgroundColor: "#ECFDF5" },
  offlineBg: { backgroundColor: "#f3f4f5" },
  typeText: { fontSize: 9, fontWeight: "900" },
  onlineText: { color: "#16A34A" },
  offlineText: { color: "#6B7280" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 9, fontWeight: "900" },

  empty: { alignItems: "center", marginTop: 80, gap: 16 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: "rgba(196,198,207,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 1.5,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#000613",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyBtnText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
