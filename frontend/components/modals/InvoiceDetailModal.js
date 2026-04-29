import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { X, CheckCircle2 } from "lucide-react-native";

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function InvoiceDetailModal({ visible, invoice, onClose, onMarkPaid }) {
  if (!invoice) return null;
  const isPaid = invoice.status === "Paid";

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.header}>
            <Text style={s.tag}>INVOICE DETAILS</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <X size={20} color="#1A1C19" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Invoice number + status */}
            <View style={s.topRow}>
              <View>
                <Text style={s.invNum}>#{invoice.invoiceNumber}</Text>
                <Text style={s.invClient}>{invoice.clientId?.name ?? "Private Client"}</Text>
              </View>
              <View style={[s.statusBadge, isPaid ? s.paidBadge : s.unpaidBadge]}>
                <Text style={[s.statusText, { color: isPaid ? "#16A34A" : "#D97706" }]}>
                  {invoice.status?.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Dates */}
            <View style={s.datesRow}>
              <View style={s.dateBox}>
                <Text style={s.dateLabel}>ISSUE DATE</Text>
                <Text style={s.dateValue}>
                  {new Date(invoice.issueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </Text>
              </View>
              <View style={s.dateBox}>
                <Text style={s.dateLabel}>DUE DATE</Text>
                <Text style={s.dateValue}>
                  {new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </Text>
              </View>
            </View>

            {/* Line items */}
            <Text style={s.sectionTitle}>LINE ITEMS</Text>
            <View style={s.itemsHeader}>
              <Text style={[s.itemCol, { flex: 3 }]}>Description</Text>
              <Text style={[s.itemCol, { flex: 1, textAlign: "center" }]}>Qty</Text>
              <Text style={[s.itemCol, { flex: 1.5, textAlign: "right" }]}>Rate</Text>
              <Text style={[s.itemCol, { flex: 1.5, textAlign: "right" }]}>Total</Text>
            </View>
            {(invoice.items ?? []).map((item, i) => (
              <View key={i} style={s.itemRow}>
                <Text style={[s.itemText, { flex: 3 }]}>{item.desc}</Text>
                <Text style={[s.itemText, { flex: 1, textAlign: "center" }]}>{item.qty}</Text>
                <Text style={[s.itemText, { flex: 1.5, textAlign: "right" }]}>{fmt(item.rate)}</Text>
                <Text style={[s.itemText, { flex: 1.5, textAlign: "right", fontWeight: "900" }]}>
                  {fmt(item.qty * item.rate)}
                </Text>
              </View>
            ))}

            {/* Totals */}
            <View style={s.totalsBox}>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Subtotal</Text>
                <Text style={s.totalValue}>{fmt(invoice.subtotal)}</Text>
              </View>
              {invoice.tax > 0 && (
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Tax ({invoice.tax}%)</Text>
                  <Text style={s.totalValue}>{fmt(invoice.taxAmount)}</Text>
                </View>
              )}
              <View style={[s.totalRow, s.grandRow]}>
                <Text style={s.grandLabel}>TOTAL</Text>
                <Text style={s.grandValue}>{fmt(invoice.amount)}</Text>
              </View>
            </View>

            {/* Notes */}
            {invoice.notes ? (
              <View style={s.notesBox}>
                <Text style={s.notesLabel}>NOTES</Text>
                <Text style={s.notesText}>{invoice.notes}</Text>
              </View>
            ) : null}

            {/* Actions */}
            <View style={s.actions}>
              {!isPaid && (
                <TouchableOpacity style={s.markPaidBtn} onPress={onMarkPaid}>
                  <CheckCircle2 size={18} color="#FFF" />
                  <Text style={s.markPaidText}>MARK AS PAID</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={s.closeAction} onPress={onClose}>
                <Text style={s.closeActionText}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(26,28,25,0.7)", justifyContent: "flex-end" },
  card:    { backgroundColor: "#FBFDF8", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: "92%" },
  header:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  tag:     { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: "#9CA3AF" },
  closeBtn:{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0F1EB", justifyContent: "center", alignItems: "center" },

  topRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  invNum:     { fontSize: 22, fontWeight: "900", color: "#1A1C19" },
  invClient:  { fontSize: 14, fontWeight: "700", color: "#6B7280", marginTop: 4 },
  statusBadge:{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  paidBadge:  { backgroundColor: "#F0FDF4" },
  unpaidBadge:{ backgroundColor: "#FFFBEB" },
  statusText: { fontSize: 10, fontWeight: "900" },

  datesRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  dateBox:  { flex: 1, backgroundColor: "#FFF", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#F0F1EB" },
  dateLabel:{ fontSize: 9, fontWeight: "900", color: "#9CA3AF", marginBottom: 4 },
  dateValue:{ fontSize: 12, fontWeight: "700", color: "#1A1C19" },

  sectionTitle: { fontSize: 10, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1, marginBottom: 8 },
  itemsHeader:  { flexDirection: "row", paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#F0F1EB", marginBottom: 4 },
  itemCol:      { fontSize: 9, fontWeight: "900", color: "#9CA3AF" },
  itemRow:      { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
  itemText:     { fontSize: 13, fontWeight: "600", color: "#1A1C19" },

  totalsBox: { backgroundColor: "#1A1C19", borderRadius: 20, padding: 20, marginTop: 16, marginBottom: 16 },
  totalRow:  { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  totalLabel:{ fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.5)" },
  totalValue:{ fontSize: 13, fontWeight: "700", color: "#FFF" },
  grandRow:  { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", marginTop: 8, paddingTop: 12 },
  grandLabel:{ fontSize: 11, fontWeight: "900", color: "rgba(255,255,255,0.5)", letterSpacing: 1 },
  grandValue:{ fontSize: 28, fontWeight: "900", color: "#FFF" },

  notesBox:  { backgroundColor: "#FFF", borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#F0F1EB" },
  notesLabel:{ fontSize: 9, fontWeight: "900", color: "#9CA3AF", marginBottom: 6 },
  notesText: { fontSize: 13, color: "#6B7280", lineHeight: 18 },

  actions:      { gap: 10, marginBottom: 20 },
  markPaidBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#1A1C19", height: 56, borderRadius: 18 },
  markPaidText: { color: "#FFF", fontWeight: "900", fontSize: 13, letterSpacing: 1 },
  closeAction:  { alignItems: "center", paddingVertical: 14 },
  closeActionText: { fontSize: 13, fontWeight: "700", color: "#9CA3AF" },
});
