import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft, Download, Share2 } from "lucide-react-native";

export default function InvoiceDetailsModal({ visible, invoice, onClose }) {
  if (!invoice) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.tag}>INVOICE DETAILS</Text>
          <Text style={styles.invNum}>#{invoice.invoiceNumber}</Text>

          <View style={styles.metaBox}>
            <Text style={styles.label}>CLIENT</Text>
            <Text style={styles.value}>
              {invoice.clientId?.name || "Private"}
            </Text>

            <View style={{ height: 16 }} />

            <Text style={styles.label}>AMOUNT DUE</Text>
            <Text style={styles.amount}>
              ₦{invoice.amount?.toLocaleString()}
            </Text>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.mainBtn}>
              <Download size={18} color="#FFF" />
              <Text style={styles.btnText}>Download PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
              <ChevronLeft size={20} color="#000613" />
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
    backgroundColor: "rgba(26,28,25,0.7)",
    justifyContent: "center",
    padding: 24,
  },
  card: { backgroundColor: "#f8f9fa", borderRadius: 32, padding: 32 },
  tag: { fontSize: 10, fontWeight: "900", color: "#9CA3AF", letterSpacing: 2 },
  invNum: { fontSize: 24, fontWeight: "900", color: "#000613", marginTop: 4 },
  metaBox: {
    marginVertical: 32,
    padding: 24,
    backgroundColor: "rgba(196,198,207,0.4)",
    borderRadius: 24,
  },
  label: { fontSize: 10, fontWeight: "900", color: "#9CA3AF" },
  value: { fontSize: 16, fontWeight: "700", color: "#000613", marginTop: 4 },
  amount: { fontSize: 32, fontWeight: "900", color: "#000613", marginTop: 4 },
  btnRow: { flexDirection: "row", gap: 12 },
  mainBtn: {
    flex: 1,
    backgroundColor: "#000613",
    height: 60,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  btnText: { color: "#FFF", fontWeight: "900" },
  iconBtn: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
});
