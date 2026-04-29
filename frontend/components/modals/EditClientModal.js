import React, { useState, useEffect } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { X, User, Mail, Phone } from "lucide-react-native";

const COLORS = ["#D7E8CD", "#FFEBB7", "#E2D9F3", "#FCE2E1", "#D1E9F6", "#7C6EF8"];

export default function EditClientModal({ visible, client, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", color: COLORS[0], notes: "" });

  useEffect(() => {
    if (client) {
      setForm({
        name:  client.name  ?? "",
        email: client.email ?? "",
        phone: client.phone ?? "",
        color: client.color ?? COLORS[0],
        notes: client.notes ?? "",
      });
    }
  }, [client]);

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      alert("Name and Email are required.");
      return;
    }
    onSave(client._id, form);
  };

  if (!client) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.overlay}>
        <View style={s.card}>
          <View style={s.header}>
            <Text style={s.title}>EDIT CLIENT</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <X size={20} color="#1A1C19" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.label}>FULL NAME</Text>
            <View style={s.inputRow}>
              <User size={18} color="#6B7280" />
              <TextInput style={s.input} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="Full name" />
            </View>

            <Text style={s.label}>EMAIL ADDRESS</Text>
            <View style={s.inputRow}>
              <Mail size={18} color="#6B7280" />
              <TextInput style={s.input} value={form.email} onChangeText={v => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" placeholder="email@example.com" />
            </View>

            <Text style={s.label}>PHONE (OPTIONAL)</Text>
            <View style={s.inputRow}>
              <Phone size={18} color="#6B7280" />
              <TextInput style={s.input} value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} keyboardType="phone-pad" placeholder="+234..." />
            </View>

            <Text style={s.label}>NOTES (OPTIONAL)</Text>
            <TextInput
              style={[s.inputRow, { height: 80, alignItems: "flex-start", paddingTop: 12 }]}
              value={form.notes}
              onChangeText={v => setForm({ ...form, notes: v })}
              placeholder="Any notes about this client..."
              multiline
            />

            <Text style={s.label}>COLOR THEME</Text>
            <View style={s.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setForm({ ...form, color: c })}
                  style={[s.colorCircle, { backgroundColor: c }, form.color === c && s.colorSelected]}
                />
              ))}
            </View>

            <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
              <Text style={s.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(26,28,25,0.6)", justifyContent: "flex-end" },
  card:    { backgroundColor: "#FBFDF8", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: "85%" },
  header:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title:   { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: "#6B7280" },
  closeBtn:{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0F1EB", justifyContent: "center", alignItems: "center" },
  label:   { fontSize: 9, fontWeight: "900", color: "#9CA3AF", marginBottom: 8, marginTop: 16, letterSpacing: 1 },
  inputRow:{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFF", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#F0F1EB" },
  input:   { flex: 1, fontSize: 14, fontWeight: "700", color: "#1A1C19" },
  colorRow:{ flexDirection: "row", gap: 10, marginTop: 4 },
  colorCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: "transparent" },
  colorSelected: { borderColor: "#1A1C19" },
  saveBtn: { backgroundColor: "#1A1C19", height: 56, borderRadius: 18, justifyContent: "center", alignItems: "center", marginTop: 24, marginBottom: 20 },
  saveBtnText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
});
