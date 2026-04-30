import { C } from "../../utils/theme";
import React, { useState, useEffect } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { X, Plus, Trash2, Save } from "lucide-react-native";
import { updateInvoice } from "../../api/apiCalls";

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function EditInvoiceModal({ visible, invoice, onClose, onSaved }) {
  const [lineItems, setLineItems] = useState([]);
  const [tax, setTax]             = useState("0");
  const [dueDate, setDueDate]     = useState("");
  const [notes, setNotes]         = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  // Seed form from invoice whenever it opens
  useEffect(() => {
    if (!invoice || !visible) return;
    setTax(String(invoice.tax ?? 0));
    setDueDate(invoice.dueDate ? invoice.dueDate.split("T")[0] : "");
    setNotes(invoice.notes ?? "");
    setLineItems(
      invoice.items?.length
        ? invoice.items.map((item, idx) => ({
            id: String(idx),
            description: item.description ?? item.desc ?? "",
            quantity: String(item.quantity ?? item.qty ?? 1),
            rate: String(item.rate ?? 0),
          }))
        : [{ id: "0", description: "", quantity: "1", rate: "0" }]
    );
    setError("");
  }, [invoice, visible]);

  const updateItem = (id, field, value) =>
    setLineItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const addItem = () =>
    setLineItems(prev => [...prev, { id: Date.now().toString(), description: "", quantity: "1", rate: "0" }]);

  const removeItem = (id) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = lineItems.reduce((acc, i) => acc + Number(i.quantity) * Number(i.rate), 0);
  const taxAmt   = subtotal * (Number(tax) / 100);
  const total    = subtotal + taxAmt;

  const handleSave = async () => {
    setError("");
    if (!dueDate.trim()) return setError("Due date is required (YYYY-MM-DD).");
    const items = lineItems.filter(i => i.description.trim());
    if (!items.length) return setError("At least one line item with a description is required.");

    try {
      setSaving(true);
      await updateInvoice(invoice._id, {
        items:   items.map(i => ({ desc: i.description, qty: Number(i.quantity), rate: Number(i.rate) })),
        tax:     Number(tax) || 0,
        dueDate,
        notes:   notes.trim() || undefined,
      });
      onClose();
      onSaved?.();
    } catch (e) {
      setError(e.response?.data?.message ?? "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (!invoice) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={s.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={s.kav}
        >
          <View style={s.card}>
            <View style={s.dragHandle} />

            {/* Header */}
            <View style={s.header}>
              <View>
                <Text style={s.headerTitle}>EDIT INVOICE.</Text>
                <Text style={s.headerSub}>{invoice.invoiceNumber}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <X size={20} color={C.primary} />
              </TouchableOpacity>
            </View>

            {/* Review note banner */}
            {invoice.status === "Review" && invoice.reviewNote && (
              <View style={s.reviewBanner}>
                <Text style={s.reviewBannerLabel}>CLIENT REVIEW NOTE</Text>
                <Text style={s.reviewBannerText}>{invoice.reviewNote}</Text>
              </View>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Line items */}
              <Text style={s.sectionTitle}>LINE ITEMS</Text>

              {lineItems.map((item, idx) => (
                <View key={item.id} style={s.itemCard}>
                  <View style={s.itemCardHeader}>
                    <Text style={s.itemNum}>ITEM {idx + 1}</Text>
                    {lineItems.length > 1 && (
                      <TouchableOpacity onPress={() => removeItem(item.id)} style={s.trashBtn}>
                        <Trash2 size={15} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    style={s.descInput}
                    placeholder="Service / Task Description"
                    placeholderTextColor={C.outline}
                    value={item.description}
                    onChangeText={v => updateItem(item.id, "description", v)}
                  />
                  <View style={s.metaRow}>
                    <View style={s.metaField}>
                      <Text style={s.metaLabel}>QTY</Text>
                      <TextInput
                        style={s.metaInput}
                        keyboardType="numeric"
                        value={item.quantity}
                        onChangeText={v => updateItem(item.id, "quantity", v)}
                      />
                    </View>
                    <View style={s.metaField}>
                      <Text style={s.metaLabel}>RATE (₦)</Text>
                      <TextInput
                        style={s.metaInput}
                        keyboardType="numeric"
                        value={item.rate}
                        onChangeText={v => updateItem(item.id, "rate", v)}
                      />
                    </View>
                    <View style={[s.metaField, { alignItems: "flex-end" }]}>
                      <Text style={s.metaLabel}>TOTAL</Text>
                      <Text style={s.rowTotal}>
                        {fmt(Number(item.quantity) * Number(item.rate))}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={s.addItemBtn} onPress={addItem}>
                <Plus size={15} color={C.secondary} />
                <Text style={s.addItemText}>ADD LINE ITEM</Text>
              </TouchableOpacity>

              {/* Details */}
              <Text style={[s.sectionTitle, { marginTop: 20 }]}>DETAILS</Text>

              <View style={s.detailsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>DUE DATE *</Text>
                  <TextInput
                    style={s.fieldInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={C.outline}
                    value={dueDate}
                    onChangeText={setDueDate}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>TAX RATE (%)</Text>
                  <TextInput
                    style={s.fieldInput}
                    placeholder="0"
                    placeholderTextColor={C.outline}
                    value={tax}
                    onChangeText={setTax}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={[s.fieldLabel, { marginTop: 14 }]}>NOTES</Text>
              <TextInput
                style={[s.fieldInput, s.notesInput]}
                placeholder="Payment terms, additional notes..."
                placeholderTextColor={C.outline}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {error ? <Text style={s.errorText}>{error}</Text> : null}
            </ScrollView>

            {/* Footer */}
            <View style={s.footer}>
              <View style={s.totalRow}>
                <View>
                  <Text style={s.totalLabel}>UPDATED TOTAL</Text>
                  <Text style={s.taxNote}>Incl. {tax || 0}% tax</Text>
                </View>
                <Text style={s.totalAmount}>{fmt(total)}</Text>
              </View>
              <TouchableOpacity
                style={[s.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : (
                    <>
                      <Save size={18} color="#fff" />
                      <Text style={s.saveBtnText}>SAVE CHANGES</Text>
                    </>
                  )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(26,28,25,0.8)", justifyContent: "flex-end" },
  kav:     { width: "100%", height: "94%" },
  card:    { flex: 1, backgroundColor: "#f8f9fa", borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24 },

  dragHandle: { width: 40, height: 4, backgroundColor: "#E5E7EB", alignSelf: "center", borderRadius: 2, marginBottom: 16 },

  header:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerTitle:{ fontSize: 22, fontWeight: "900", color: C.primary, letterSpacing: -0.5 },
  headerSub: { fontSize: 9, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1.5, marginTop: 2 },
  closeBtn:  { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(196,198,207,0.4)", justifyContent: "center", alignItems: "center" },

  reviewBanner:     { backgroundColor: "#FFF7ED", borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#FED7AA" },
  reviewBannerLabel:{ fontSize: 9, fontWeight: "900", color: "#F97316", letterSpacing: 1, marginBottom: 4 },
  reviewBannerText: { fontSize: 13, color: "#92400E", lineHeight: 18, fontStyle: "italic" },

  sectionTitle: { fontSize: 10, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1, marginBottom: 12 },

  itemCard:       { backgroundColor: "#FFF", borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)" },
  itemCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  itemNum:        { fontSize: 9, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1 },
  trashBtn:       { padding: 4 },
  descInput:      { fontSize: 14, fontWeight: "700", color: C.primary, borderBottomWidth: 1, borderBottomColor: "rgba(196,198,207,0.4)", paddingBottom: 8, marginBottom: 12 },
  metaRow:        { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  metaField:      { flex: 1 },
  metaLabel:      { fontSize: 8, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1, marginBottom: 4 },
  metaInput:      { backgroundColor: "#f8f9fa", borderRadius: 10, padding: 10, fontSize: 13, fontWeight: "900", color: C.primary, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)", textAlign: "center" },
  rowTotal:       { fontSize: 15, fontWeight: "900", color: C.primary, paddingBottom: 10 },

  addItemBtn:  { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 4 },
  addItemText: { fontSize: 10, fontWeight: "900", color: C.secondary, letterSpacing: 1 },

  detailsRow: { flexDirection: "row" },
  fieldLabel: { fontSize: 9, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1.5, marginBottom: 6 },
  fieldInput: { backgroundColor: "#FFF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, fontWeight: "700", color: C.primary, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)" },
  notesInput: { minHeight: 80, textAlignVertical: "top", marginBottom: 4 },

  errorText: { fontSize: 11, fontWeight: "900", color: "#EF4444", letterSpacing: 0.5, marginTop: 8 },

  footer:      { borderTopWidth: 1, borderTopColor: "rgba(196,198,207,0.4)", paddingTop: 18, paddingBottom: Platform.OS === "ios" ? 28 : 10 },
  totalRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  totalLabel:  { fontSize: 10, fontWeight: "900", color: "#9CA3AF" },
  taxNote:     { fontSize: 11, fontWeight: "700", color: C.primary, marginTop: 2 },
  totalAmount: { fontSize: 30, fontWeight: "900", color: C.primary, letterSpacing: -1 },
  saveBtn:     { backgroundColor: C.primary, height: 58, borderRadius: 22, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
  saveBtnText: { color: "#FFF", fontWeight: "900", fontSize: 13, letterSpacing: 0.5 },
});
