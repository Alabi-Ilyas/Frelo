import React from "react";
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from "react-native";

// No Lucide icons needed here to keep the focus strictly on the text warning, 
// but you can add an AlertTriangle if you want more visual punch.

export default function DeleteConfirmModal({ visible, title, onConfirm, onClose }) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.centeredOverlay}>
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>ARE YOU SURE?</Text>
          <Text style={styles.alertMessage}>
            This will permanently remove {title}. This action cannot be undone.
          </Text>
          
          <View style={styles.alertActions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Keep it</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Delete Forever</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredOverlay: {
    flex: 1,
    backgroundColor: "rgba(26, 28, 25, 0.8)", 
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  alertCard: {
    width: "100%",
    backgroundColor: "#FBFDF8",
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F0F1EB",
    alignItems: "center",
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#EF4444", 
    marginBottom: 16,
  },
  alertMessage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1C19",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  alertActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#F0F1EB",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6B7280",
  },
  deleteBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#EF4444", 
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFF",
  },
});