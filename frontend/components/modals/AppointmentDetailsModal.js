import { C } from "../../utils/theme";
import React from "react";
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Linking, ActivityIndicator,
} from "react-native";
import {
  X, Calendar, Clock, User, ExternalLink,
  Video, MapPin, FileText, CheckCircle2, XCircle,
} from "lucide-react-native";

const STATUS_STYLE = {
  Confirmed: { bg: "#F0FDF4", text: "#16A34A" },
  Pending:   { bg: "#FFFBEB", text: "#D97706" },
  Cancelled: { bg: "#FEF2F2", text: "#EF4444" },
  Completed: { bg: "#f8f9fa", text: "#6B7280" },
  "No-show": { bg: "#FEF2F2", text: "#F87171" },
};

function fmt12(time) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export { AppointmentDetailModal };
export default AppointmentDetailModal;

function AppointmentDetailModal({
  visible, appointment, onClose, onCancel, onComplete, actionLoading,
}) {
  if (!appointment) return null;

  const date       = new Date(appointment.date);
  const formatted  = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const isOnline   = !!appointment.meetingLink;
  const cfg        = STATUS_STYLE[appointment.status] ?? STATUS_STYLE.Pending;
  const canCancel  = appointment.status === "Confirmed" || appointment.status === "Pending";
  const canComplete = appointment.status === "Confirmed";

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.card}>
          {/* Top accent bar */}
          <View style={s.accentBar} />

          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <X size={20} color="#6B7280" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
            {/* Header */}
            <View style={s.header}>
              <View style={s.headerTop}>
                <Text style={s.tagline}>APPOINTMENT</Text>
                <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[s.statusText, { color: cfg.text }]}>{appointment.status}</Text>
                </View>
              </View>
              <Text style={s.title}>{appointment.title}</Text>
            </View>

            {/* Info rows */}
            <View style={s.infoCard}>
              {/* Date */}
              <View style={s.infoRow}>
                <View style={s.infoIcon}><Calendar size={16} color="#000613" /></View>
                <View>
                  <Text style={s.infoLabel}>Date</Text>
                  <Text style={s.infoValue}>{formatted}</Text>
                </View>
              </View>

              {/* Time */}
              <View style={[s.infoRow, s.infoRowBorder]}>
                <View style={s.infoIcon}><Clock size={16} color="#000613" /></View>
                <View>
                  <Text style={s.infoLabel}>Time</Text>
                  <Text style={s.infoValue}>
                    {fmt12(appointment.time)}
                    <Text style={s.infoSub}> · {appointment.duration} min</Text>
                  </Text>
                </View>
              </View>

              {/* Client */}
              <View style={[s.infoRow, s.infoRowBorder]}>
                <View style={s.infoIcon}><User size={16} color="#000613" /></View>
                <View>
                  <Text style={s.infoLabel}>Client</Text>
                  <Text style={s.infoValue}>{appointment.clientId?.name ?? "—"}</Text>
                </View>
              </View>

              {/* Meeting link */}
              {isOnline && (
                <View style={[s.infoRow, s.infoRowBorder]}>
                  <View style={s.infoIcon}><Video size={16} color="#16A34A" /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.infoLabel}>Virtual Meeting</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(appointment.meetingLink)}>
                      <Text style={s.linkText} numberOfLines={1}>{appointment.meetingLink}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Notes */}
              {appointment.notes && (
                <View style={[s.infoRow, s.infoRowBorder]}>
                  <View style={s.infoIcon}><FileText size={16} color="#000613" /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.infoLabel}>Notes</Text>
                    <Text style={s.infoValue}>{appointment.notes}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={s.actions}>
              {isOnline && (
                <TouchableOpacity
                  style={s.joinBtn}
                  onPress={() => Linking.openURL(appointment.meetingLink)}
                >
                  <Video size={18} color="#FFF" />
                  <Text style={s.joinBtnText}>JOIN MEETING</Text>
                </TouchableOpacity>
              )}

              {canComplete && onComplete && (
                <View style={s.completeRow}>
                  <TouchableOpacity
                    style={s.completeBtn}
                    onPress={() => onComplete("Completed")}
                    disabled={actionLoading}
                  >
                    {actionLoading
                      ? <ActivityIndicator size="small" color="#16A34A" />
                      : <CheckCircle2 size={16} color="#16A34A" />}
                    <Text style={s.completeBtnText}>Complete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.noshowBtn}
                    onPress={() => onComplete("No-show")}
                    disabled={actionLoading}
                  >
                    <Text style={s.noshowBtnText}>No-show</Text>
                  </TouchableOpacity>
                </View>
              )}

              {canCancel && (
                <TouchableOpacity
                  style={s.cancelBtn}
                  onPress={onCancel}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? <ActivityIndicator size="small" color="#EF4444" />
                    : <XCircle size={16} color="#EF4444" />}
                  <Text style={s.cancelBtnText}>Cancel Appointment</Text>
                </TouchableOpacity>
              )}

              {!canCancel && !canComplete && (
                <TouchableOpacity style={s.closeAction} onPress={onClose}>
                  <Text style={s.closeActionText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(26,28,25,0.5)", justifyContent: "flex-end" },
  card:    { backgroundColor: "#f8f9fa", borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: "90%", paddingBottom: 32 },
  accentBar: { height: 4, backgroundColor: "#000613", borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  closeBtn:  { position: "absolute", top: 16, right: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(196,198,207,0.4)", justifyContent: "center", alignItems: "center", zIndex: 10 },
  content:   { padding: 24, paddingTop: 16 },

  header:    { marginBottom: 16 },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  tagline:   { fontSize: 10, fontWeight: "900", color: "#9CA3AF", letterSpacing: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusText:  { fontSize: 9, fontWeight: "900" },
  title:     { fontSize: 22, fontWeight: "900", color: "#000613", letterSpacing: -0.5 },

  infoCard:    { backgroundColor: "#FFF", borderRadius: 20, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)", marginBottom: 20, overflow: "hidden" },
  infoRow:     { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: "#f8f9fa" },
  infoIcon:    { width: 34, height: 34, borderRadius: 10, backgroundColor: "#f3f4f5", justifyContent: "center", alignItems: "center" },
  infoLabel:   { fontSize: 9, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1, marginBottom: 3 },
  infoValue:   { fontSize: 14, fontWeight: "700", color: "#000613" },
  infoSub:     { fontSize: 12, fontWeight: "500", color: "#9CA3AF" },
  linkText:    { fontSize: 13, fontWeight: "700", color: "#426900", textDecorationLine: "underline" },

  actions:     { gap: 10 },
  joinBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#000613", height: 54, borderRadius: 18 },
  joinBtnText: { color: "#FFF", fontWeight: "900", fontSize: 13, letterSpacing: 1 },

  completeRow:    { flexDirection: "row", gap: 10 },
  completeBtn:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 14, borderWidth: 1, borderColor: "#BBF7D0" },
  completeBtnText:{ fontSize: 12, fontWeight: "900", color: "#16A34A" },
  noshowBtn:      { flex: 1, alignItems: "center", justifyContent: "center", height: 48, borderRadius: 14, borderWidth: 1, borderColor: "#FECACA" },
  noshowBtnText:  { fontSize: 12, fontWeight: "900", color: "#F87171" },

  cancelBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 14, borderWidth: 1, borderColor: "#FECACA" },
  cancelBtnText: { fontSize: 12, fontWeight: "900", color: "#EF4444" },

  closeAction:     { alignItems: "center", paddingVertical: 14 },
  closeActionText: { fontSize: 13, fontWeight: "700", color: "#9CA3AF" },
});
