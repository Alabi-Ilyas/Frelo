import { C } from "../../utils/theme";
import React, { useState } from "react";
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from "react-native";
import { X, CheckCircle2, AlertTriangle, MessageSquare, Info, Send } from "lucide-react-native";
import { disputeInvoice } from "../../api/apiCalls";

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

const STATUS_CLASS = {
  Paid:      { bg: "#F0FDF4", text: "#16A34A" },
  Unpaid:    { bg: "#FFFBEB", text: "#D97706" },
  Review:    { bg: "#FFF7ED", text: "#F97316" },
  Cancelled: { bg: "#f8f9fa", text: "#9CA3AF" },
};

export default function ClientInvoiceDetailModal({ visible, invoice, onClose, onRefresh, openReviewForm }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [note, setNote]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  // When opened via the flag button, jump straight to the form
  React.useEffect(() => {
    if (visible && openReviewForm) setShowReviewForm(true);
    if (!visible) { setShowReviewForm(false); setNote(""); }
  }, [visible, openReviewForm]);

  if (!invoice) return null;

  const cfg        = STATUS_CLASS[invoice.status] ?? STATUS_CLASS.Cancelled;
  const canReview  = invoice.status === "Unpaid";
  const isReview   = invoice.status === "Review";
  const isPaid     = invoice.status === "Paid";

  const handleClose = () => {
    setShowReviewForm(false);
    setNote("");
    onClose();
  };

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true);
      await disputeInvoice(invoice._id, note.trim() || undefined);
      Alert.alert("Review Requested", "Your freelancer has been notified and will respond within 24 hours.");
      setShowReviewForm(false);
      setNote("");
      handleClose();
      onRefresh?.();
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message ?? "Could not submit review request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.card}>
          {/* Accent bar */}
          <View style={s.accentBar} />

          <View style={s.header}>
            <Text style={s.tag}>INVOICE DETAILS</Text>
            <TouchableOpacity onPress={handleClose} style={s.closeBtn}>
              <X size={20} color={C.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Invoice number + status */}
            <View style={s.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.invNum}>#{invoice.invoiceNumber}</Text>
                <Text style={s.invFreelancer}>
                  {invoice.freelancerId?.businessName ?? invoice.freelancerId?.name ?? "Your Freelancer"}
                </Text>
              </View>
              <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[s.statusText, { color: cfg.text }]}>
                  {invoice.status === "Review" ? "UNDER REVIEW" : invoice.status?.toUpperCase()}
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
                <Text style={[s.dateLabel]}>DUE DATE</Text>
                <Text style={[s.dateValue, invoice.status === "Unpaid" && new Date(invoice.dueDate) < new Date() && { color: "#EF4444" }]}>
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
              {invoice.discount > 0 && (
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Discount</Text>
                  <Text style={[s.totalValue, { color: "#ADFF2F" }]}>-{fmt(invoice.discount)}</Text>
                </View>
              )}
              <View style={[s.totalRow, s.grandRow]}>
                <Text style={s.grandLabel}>TOTAL DUE</Text>
                <Text style={s.grandValue}>{fmt(invoice.amount)}</Text>
              </View>
            </View>

            {/* Notes */}
            {invoice.notes ? (
              <View style={s.notesBox}>
                <Text style={s.notesLabel}>NOTES FROM FREELANCER</Text>
                <Text style={s.notesText}>{invoice.notes}</Text>
              </View>
            ) : null}

            {/* Under Review — show existing review note */}
            {isReview && (
              <View style={s.reviewBanner}>
                <View style={s.reviewBannerTop}>
                  <AlertTriangle size={16} color="#F97316" />
                  <Text style={s.reviewBannerTitle}>Under Review</Text>
                </View>
                {invoice.reviewNote ? (
                  <>
                    <Text style={s.reviewBannerLabel}>YOUR MESSAGE</Text>
                    <Text style={s.reviewBannerNote}>{invoice.reviewNote}</Text>
                  </>
                ) : (
                  <Text style={s.reviewBannerBody}>
                    You've flagged this invoice for review. Your freelancer will respond within 24 hours.
                  </Text>
                )}
              </View>
            )}

            {/* Paid banner */}
            {isPaid && (
              <View style={s.paidBanner}>
                <CheckCircle2 size={18} color="#16A34A" />
                <Text style={s.paidBannerText}>This invoice has been paid.</Text>
              </View>
            )}

            {/* Flag for Review — only on Unpaid */}
            {canReview && !showReviewForm && (
              <TouchableOpacity style={s.reviewBtn} onPress={() => setShowReviewForm(true)}>
                <MessageSquare size={16} color="#F97316" />
                <Text style={s.reviewBtnText}>FLAG FOR REVIEW</Text>
              </TouchableOpacity>
            )}

            {/* Review form */}
            {canReview && showReviewForm && (
              <View style={s.reviewForm}>
                <View style={s.reviewFormHeader}>
                  <Text style={s.reviewFormTitle}>Flag for Review</Text>
                  <Text style={s.reviewFormSub}>{invoice.invoiceNumber} · {fmt(invoice.amount)}</Text>
                </View>

                <Text style={s.fieldLabel}>ISSUE DESCRIPTION</Text>
                <TextInput
                  style={s.reviewInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Describe the pricing concern or specific line items that require attention..."
                  placeholderTextColor={C.outline}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />

                <View style={s.infoRow}>
                  <Info size={15} color={C.primary} />
                  <Text style={s.infoText}>
                    Submitting this request will flag the invoice for review. Your freelancer will be notified and will respond within 24 hours.
                  </Text>
                </View>

                <View style={s.reviewActions}>
                  <TouchableOpacity
                    style={s.cancelReviewBtn}
                    onPress={() => { setShowReviewForm(false); setNote(""); }}
                    disabled={submitting}
                  >
                    <Text style={s.cancelReviewText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.submitReviewBtn}
                    onPress={handleSubmitReview}
                    disabled={submitting}
                  >
                    {submitting
                      ? <ActivityIndicator size="small" color="#fff" />
                      : (
                        <>
                          <Send size={14} color="#fff" />
                          <Text style={s.submitReviewText}>SUBMIT REQUEST</Text>
                        </>
                      )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity style={s.closeAction} onPress={handleClose}>
              <Text style={s.closeActionText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: "rgba(26,28,25,0.7)", justifyContent: "flex-end" },
  card:      { backgroundColor: "#f8f9fa", borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: "94%" },
  accentBar: { height: 4, backgroundColor: C.primary, borderTopLeftRadius: 32, borderTopRightRadius: 32 },

  header:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4 },
  tag:      { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: "#9CA3AF" },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(196,198,207,0.4)", justifyContent: "center", alignItems: "center" },

  topRow:        { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 24, paddingVertical: 16 },
  invNum:        { fontSize: 22, fontWeight: "900", color: C.primary },
  invFreelancer: { fontSize: 14, fontWeight: "700", color: "#6B7280", marginTop: 4 },
  statusBadge:   { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  statusText:    { fontSize: 10, fontWeight: "900" },

  datesRow: { flexDirection: "row", gap: 12, marginHorizontal: 24, marginBottom: 20 },
  dateBox:  { flex: 1, backgroundColor: "#FFF", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)" },
  dateLabel:{ fontSize: 9, fontWeight: "900", color: "#9CA3AF", marginBottom: 4 },
  dateValue:{ fontSize: 12, fontWeight: "700", color: C.primary },

  sectionTitle: { fontSize: 10, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1, marginBottom: 8, marginHorizontal: 24 },
  itemsHeader:  { flexDirection: "row", paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "rgba(196,198,207,0.4)", marginBottom: 4, marginHorizontal: 24 },
  itemCol:      { fontSize: 9, fontWeight: "900", color: "#9CA3AF" },
  itemRow:      { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f8f9fa", marginHorizontal: 24 },
  itemText:     { fontSize: 13, fontWeight: "600", color: C.primary },

  totalsBox: { backgroundColor: C.primary, borderRadius: 20, padding: 20, marginTop: 16, marginBottom: 16, marginHorizontal: 24 },
  totalRow:  { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  totalLabel:{ fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.5)" },
  totalValue:{ fontSize: 13, fontWeight: "700", color: "#FFF" },
  grandRow:  { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", marginTop: 8, paddingTop: 12 },
  grandLabel:{ fontSize: 11, fontWeight: "900", color: "rgba(255,255,255,0.5)", letterSpacing: 1 },
  grandValue:{ fontSize: 28, fontWeight: "900", color: "#FFF" },

  notesBox:  { backgroundColor: "#FFF", borderRadius: 14, padding: 14, marginBottom: 16, marginHorizontal: 24, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)" },
  notesLabel:{ fontSize: 9, fontWeight: "900", color: "#9CA3AF", marginBottom: 6 },
  notesText: { fontSize: 13, color: "#6B7280", lineHeight: 18 },

  reviewBanner:     { backgroundColor: "#FFF7ED", borderRadius: 16, padding: 16, marginBottom: 16, marginHorizontal: 24, borderWidth: 1, borderColor: "#FED7AA" },
  reviewBannerTop:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  reviewBannerTitle:{ fontSize: 13, fontWeight: "900", color: "#F97316" },
  reviewBannerLabel:{ fontSize: 9, fontWeight: "900", color: "#F97316", letterSpacing: 1, marginBottom: 4 },
  reviewBannerNote: { fontSize: 13, color: "#92400E", lineHeight: 18, fontStyle: "italic" },
  reviewBannerBody: { fontSize: 13, color: "#92400E", lineHeight: 18 },

  paidBanner:     { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F0FDF4", borderRadius: 14, padding: 14, marginBottom: 16, marginHorizontal: 24 },
  paidBannerText: { fontSize: 13, fontWeight: "700", color: "#16A34A" },

  reviewBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: "#FED7AA", backgroundColor: "#FFF7ED", height: 52, borderRadius: 16, marginHorizontal: 24, marginBottom: 16 },
  reviewBtnText: { fontSize: 11, fontWeight: "900", color: "#F97316", letterSpacing: 1 },

  reviewForm:       { backgroundColor: "#FFF", borderRadius: 20, padding: 18, marginHorizontal: 24, marginBottom: 16, borderWidth: 1, borderColor: "#FED7AA" },
  reviewFormHeader: { marginBottom: 16 },
  reviewFormTitle:  { fontSize: 18, fontWeight: "900", color: C.primary, letterSpacing: -0.5 },
  reviewFormSub:    { fontSize: 12, fontWeight: "700", color: "#9CA3AF", marginTop: 4 },
  fieldLabel:       { fontSize: 9, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1.5, marginBottom: 8 },
  reviewInput:      { backgroundColor: "#f8f9fa", borderRadius: 14, padding: 14, fontSize: 14, color: C.primary, minHeight: 110, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)" },

  infoRow:  { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "#f8f9fa", borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)" },
  infoText: { flex: 1, fontSize: 12, color: "#6B7280", lineHeight: 18, fontWeight: "600" },

  reviewActions:    { flexDirection: "row", gap: 10, marginTop: 14 },
  cancelReviewBtn:  { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)", justifyContent: "center", alignItems: "center" },
  cancelReviewText: { fontSize: 12, fontWeight: "900", color: "#9CA3AF" },
  submitReviewBtn:  { flex: 2, height: 48, borderRadius: 14, backgroundColor: C.primary, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 8 },
  submitReviewText: { fontSize: 12, fontWeight: "900", color: "#fff", letterSpacing: 0.5 },

  closeAction:     { alignItems: "center", paddingVertical: 16, marginBottom: 8 },
  closeActionText: { fontSize: 13, fontWeight: "700", color: "#9CA3AF" },
});
