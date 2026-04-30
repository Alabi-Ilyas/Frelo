import { C } from "../../utils/theme";
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { X, CheckCircle2, Pencil, AlertTriangle } from "lucide-react-native";
import EditInvoiceModal from "./EditInvoiceModal";

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

const STATUS_CLASS = {
  Paid:      { bg: "#F0FDF4", text: "#16A34A" },
  Unpaid:    { bg: "#FFFBEB", text: "#D97706" },
  Review:    { bg: "#FFF7ED", text: "#F97316" },
  Cancelled: { bg: "#f8f9fa", text: "#9CA3AF" },
};

export default function InvoiceDetailModal({ visible, invoice, onClose, onMarkPaid, onRefresh }) {
  const [editOpen, setEditOpen] = useState(false);

  if (!invoice) return null;

  const cfg       = STATUS_CLASS[invoice.status] ?? STATUS_CLASS.Cancelled;
  const isPaid    = invoice.status === "Paid";
  const canEdit   = invoice.status === "Unpaid" || invoice.status === "Review";
  const isReview  = invoice.status === "Review";
  const statusLabel = isReview ? "UNDER REVIEW" : invoice.status?.toUpperCase();

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.card}>
            {/* Accent bar */}
            <View style={s.accentBar} />

            <View style={s.header}>
              <Text style={s.tag}>INVOICE DETAILS</Text>
              <View style={s.headerRight}>
                {canEdit && (
                  <TouchableOpacity onPress={() => setEditOpen(true)} style={s.editBtn}>
                    <Pencil size={15} color={C.primary} />
                    <Text style={s.editBtnText}>EDIT</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                  <X size={20} color={C.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Invoice number + status */}
              <View style={s.topRow}>
                <View>
                  <Text style={s.invNum}>#{invoice.invoiceNumber}</Text>
                  <Text style={s.invClient}>{invoice.clientId?.name ?? "Private Client"}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[s.statusText, { color: cfg.text }]}>{statusLabel}</Text>
                </View>
              </View>

              {/* Review note from client */}
              {isReview && invoice.reviewNote && (
                <View style={s.reviewBanner}>
                  <View style={s.reviewBannerTop}>
                    <AlertTriangle size={14} color="#F97316" />
                    <Text style={s.reviewBannerTitle}>Client Review Note</Text>
                  </View>
                  <Text style={s.reviewBannerNote}>{invoice.reviewNote}</Text>
                  <Text style={s.reviewBannerHint}>Edit the invoice above to address this concern.</Text>
                </View>
              )}

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
                  <Text style={[s.itemText, { flex: 3 }]}>{item.description ?? item.desc}</Text>
                  <Text style={[s.itemText, { flex: 1, textAlign: "center" }]}>{item.quantity ?? item.qty}</Text>
                  <Text style={[s.itemText, { flex: 1.5, textAlign: "right" }]}>{fmt(item.rate)}</Text>
                  <Text style={[s.itemText, { flex: 1.5, textAlign: "right", fontWeight: "900" }]}>
                    {fmt((item.quantity ?? item.qty) * item.rate)}
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
                {canEdit && (
                  <TouchableOpacity style={s.editActionBtn} onPress={() => setEditOpen(true)}>
                    <Pencil size={16} color={C.primary} />
                    <Text style={s.editActionText}>EDIT INVOICE</Text>
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

      <EditInvoiceModal
        visible={editOpen}
        invoice={invoice}
        onClose={() => setEditOpen(false)}
        onSaved={() => { setEditOpen(false); onClose(); onRefresh?.(); }}
      />
    </>
  );
}

const s = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: "rgba(26,28,25,0.7)", justifyContent: "flex-end" },
  card:      { backgroundColor: "#f8f9fa", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: "92%" },
  accentBar: { height: 4, backgroundColor: C.primary, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginHorizontal: -24, marginTop: -24, marginBottom: 20 },

  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  tag:         { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: "#9CA3AF" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  editBtn:     { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: C.surfaceLow, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: C.outlineVar },
  editBtnText: { fontSize: 10, fontWeight: "900", color: C.primary, letterSpacing: 0.5 },
  closeBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(196,198,207,0.4)", justifyContent: "center", alignItems: "center" },

  topRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  invNum:     { fontSize: 22, fontWeight: "900", color: C.primary },
  invClient:  { fontSize: 14, fontWeight: "700", color: "#6B7280", marginTop: 4 },
  statusBadge:{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: "900" },

  reviewBanner:     { backgroundColor: "#FFF7ED", borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#FED7AA" },
  reviewBannerTop:  { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  reviewBannerTitle:{ fontSize: 12, fontWeight: "900", color: "#F97316" },
  reviewBannerNote: { fontSize: 13, color: "#92400E", lineHeight: 18, fontStyle: "italic", marginBottom: 6 },
  reviewBannerHint: { fontSize: 10, fontWeight: "700", color: "#F97316", opacity: 0.7 },

  datesRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  dateBox:  { flex: 1, backgroundColor: "#FFF", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)" },
  dateLabel:{ fontSize: 9, fontWeight: "900", color: "#9CA3AF", marginBottom: 4 },
  dateValue:{ fontSize: 12, fontWeight: "700", color: C.primary },

  sectionTitle: { fontSize: 10, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1, marginBottom: 8 },
  itemsHeader:  { flexDirection: "row", paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "rgba(196,198,207,0.4)", marginBottom: 4 },
  itemCol:      { fontSize: 9, fontWeight: "900", color: "#9CA3AF" },
  itemRow:      { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f8f9fa" },
  itemText:     { fontSize: 13, fontWeight: "600", color: C.primary },

  totalsBox: { backgroundColor: C.primary, borderRadius: 20, padding: 20, marginTop: 16, marginBottom: 16 },
  totalRow:  { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  totalLabel:{ fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.5)" },
  totalValue:{ fontSize: 13, fontWeight: "700", color: "#FFF" },
  grandRow:  { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", marginTop: 8, paddingTop: 12 },
  grandLabel:{ fontSize: 11, fontWeight: "900", color: "rgba(255,255,255,0.5)", letterSpacing: 1 },
  grandValue:{ fontSize: 28, fontWeight: "900", color: "#FFF" },

  notesBox:  { backgroundColor: "#FFF", borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)" },
  notesLabel:{ fontSize: 9, fontWeight: "900", color: "#9CA3AF", marginBottom: 6 },
  notesText: { fontSize: 13, color: "#6B7280", lineHeight: 18 },

  actions:       { gap: 10, marginBottom: 20 },
  markPaidBtn:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: C.primary, height: 56, borderRadius: 18 },
  markPaidText:  { color: "#FFF", fontWeight: "900", fontSize: 13, letterSpacing: 1 },
  editActionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 16, borderWidth: 1, borderColor: C.outlineVar, backgroundColor: C.surfaceLow },
  editActionText:{ fontSize: 12, fontWeight: "900", color: C.primary, letterSpacing: 0.5 },
  closeAction:   { alignItems: "center", paddingVertical: 14 },
  closeActionText:{ fontSize: 13, fontWeight: "700", color: "#9CA3AF" },
});
