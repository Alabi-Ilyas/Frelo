import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  // Use Share or Linking if you want the "Message Client" button to work
  Linking,
} from "react-native";

// Consistency is key: use the same icon set across all infrastructure modals
import {
  X,
  User,
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  CheckCircle2, // Good for completed tasks
  AlertCircle, // Good for overdue projects
} from "lucide-react-native";

export function ClientDetailModal({ visible, onClose, client }) {
  if (!client) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { height: "65%" }]}>
          <View style={styles.dragHandle} />
          <View style={styles.clientHeader}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>{client.name?.charAt(0)}</Text>
            </View>
            <Text style={styles.headerTitle}>{client.name?.toUpperCase()}</Text>
            <Text style={styles.headerSubtitle}>{client.email}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{client.projectCount || 0}</Text>
              <Text style={styles.statLabel}>PROJECTS</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                ₦{client.totalRevenue?.toLocaleString() || 0}
              </Text>
              <Text style={styles.statLabel}>TOTAL PAID</Text>
            </View>
          </View>

          <View style={styles.contactList}>
            <TouchableOpacity style={styles.contactItem}>
              <Text style={styles.metaLabel}>PHONE</Text>
              <Text style={styles.gridValue}>
                {client.phone || "Not provided"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem}>
              <Text style={styles.metaLabel}>BUSINESS/ROLE</Text>
              <Text style={styles.gridValue}>
                {client.role || "Stakeholder"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>MESSAGE CLIENT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26,28,25,0.8)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#FBFDF8",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    borderRadius: 2,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#1A1C19" },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 1.5,
  },
  closeCircle: {
    width: 40,
    height: 40,
    backgroundColor: "#F0F1EB",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "900" },
  metaDate: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },

  descriptionText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 24,
  },

  detailGrid: { flexDirection: "row", gap: 20, marginBottom: 30 },
  gridItem: { flex: 1 },
  gridLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9CA3AF",
    marginBottom: 4,
  },
  gridValue: { fontSize: 14, fontWeight: "800", color: "#1A1C19" },

  clientLinkCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F1EB",
    marginBottom: 24,
  },
  progressSection: { marginBottom: 24 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 10, fontWeight: "900", color: "#9CA3AF" },
  progressPercent: { fontSize: 12, fontWeight: "900", color: "#1A1C19" },
  progressBarBg: { height: 8, backgroundColor: "#F0F1EB", borderRadius: 4 },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#1A1C19",
    borderRadius: 4,
  },

  clientHeader: { alignItems: "center", marginBottom: 30 },
  avatarLarge: {
    width: 80,
    height: 80,
    backgroundColor: "#1A1C19",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: { color: "#FFF", fontSize: 32, fontWeight: "900" },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F0F1EB",
    marginBottom: 24,
  },
  statBox: { alignItems: "center" },
  statNumber: { fontSize: 20, fontWeight: "900", color: "#1A1C19" },
  statLabel: { fontSize: 8, fontWeight: "900", color: "#9CA3AF" },
  divider: { width: 1, height: "100%", backgroundColor: "#F0F1EB" },

  primaryAction: {
    backgroundColor: "#1A1C19",
    height: 60,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryActionText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
  },
});
