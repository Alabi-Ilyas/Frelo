import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import {
  MapPin,
  Clock,
  Video,
  User,
  ChevronLeft,
  ExternalLink,
} from "lucide-react-native";

export default function AppointmentDetailsModal({
  visible,
  appointment,
  onClose,
}) {
  if (!appointment) return null;

  const isOnline = !!appointment.meetingLink;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.modalHeader}>
            <Text style={styles.tagline}>APPOINTMENT DETAILS</Text>
            <View
              style={[
                styles.statusBadge,
                isOnline ? styles.onlineBg : styles.offlineBg,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isOnline ? styles.onlineText : styles.offlineText,
                ]}
              >
                {isOnline ? "VIRTUAL" : "OFFLINE"}
              </Text>
            </View>
          </View>

          {/* MAIN INFO */}
          <Text style={styles.timeTitle}>{appointment.time}</Text>
          <Text style={styles.clientName}>
            {appointment.clientId?.name?.toUpperCase() || "EXTERNAL CLIENT"}
          </Text>
          <View style={styles.purposeContainer}>
            <Text style={styles.purposeText}>{appointment.title}</Text>
          </View>

          {/* INFO GRID */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Clock size={18} color="#1A1C19" />
              <Text style={styles.infoLabel}>{appointment.duration} MINS</Text>
            </View>
            <View style={styles.infoItem}>
              {isOnline ? (
                <Video size={18} color="#10B981" />
              ) : (
                <MapPin size={18} color="#6B7280" />
              )}
              <Text style={styles.infoLabel}>
                {isOnline ? "GOOGLE MEET" : "OFFICE"}
              </Text>
            </View>
          </View>

          {/* ACTIONS */}
          <View style={styles.actionArea}>
            {isOnline && (
              <TouchableOpacity
                style={styles.joinBtn}
                onPress={() => Linking.openURL(appointment.meetingLink)}
              >
                <Video size={20} color="#FFF" />
                <Text style={styles.joinBtnText}>JOIN MEETING</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <ChevronLeft size={20} color="#9CA3AF" />
              <Text style={styles.closeText}>BACK TO CALENDAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26,28,25,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#FBFDF8",
    borderRadius: 32,
    padding: 32,
    borderWeight: 1,
    borderColor: "#F0F1EB",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  tagline: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#9CA3AF",
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  onlineBg: { backgroundColor: "#ECFDF5" },
  offlineBg: { backgroundColor: "#F3F4F6" },
  statusText: { fontSize: 9, fontWeight: "900" },
  onlineText: { color: "#10B981" },
  offlineText: { color: "#6B7280" },
  timeTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1A1C19",
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#10B981",
    letterSpacing: 1,
    marginBottom: 16,
  },
  purposeContainer: {
    backgroundColor: "#F0F1EB",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  purposeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1C19",
    lineHeight: 22,
  },
  infoGrid: { flexDirection: "row", gap: 20, marginBottom: 32 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoLabel: { fontSize: 11, fontWeight: "900", color: "#1A1C19" },
  actionArea: { gap: 12 },
  joinBtn: {
    backgroundColor: "#1A1C19",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    gap: 12,
  },
  joinBtnText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  closeBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    gap: 8,
  },
  closeText: {
    color: "#9CA3AF",
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 1,
  },
});
