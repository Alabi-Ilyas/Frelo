import { C } from "../../utils/theme";
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { X, User, Mail, Phone, Palette } from "lucide-react-native";

// Professional color palette for avatars
const AVATAR_COLORS = ["#ADFF2F", "#FFEBB7", "#E2D9F3", "#FCE2E1", "#D1E9F6"];

export default function AddClientModal({ visible, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    color: AVATAR_COLORS[0],
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      alert("Name and Email are required.");
      return;
    }

    // Basic email validation
    if (!form.email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    onSave(form);
    setForm({ name: "", email: "", phone: "", color: AVATAR_COLORS[0] });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>ADD NEW CLIENT</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
              <X size={20} color="#000613" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* NAME */}
            <View style={styles.inputLabelGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#426900" />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#9CA3AF"
                  value={form.name}
                  autoFocus={true}
                  onChangeText={(v) => setForm({ ...form, name: v })}
                />
              </View>
            </View>

            {/* EMAIL */}
            <View style={styles.inputLabelGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@company.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(v) => setForm({ ...form, email: v })}
                />
              </View>
            </View>

            {/* PHONE */}
            <View style={styles.inputLabelGroup}>
              <Text style={styles.inputLabel}>PHONE NUMBER (OPTIONAL)</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  placeholder="+234..."
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(v) => setForm({ ...form, phone: v })}
                />
              </View>
            </View>

            {/* AVATAR COLOR PICKER */}
            <View style={styles.inputLabelGroup}>
              <Text style={styles.inputLabel}>CLIENT COLOR THEME</Text>
              <View style={styles.colorRow}>
                {AVATAR_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setForm({ ...form, color: c })}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: c },
                      form.color === c && styles.selectedColor,
                    ]}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Client</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26, 28, 25, 0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#6B7280",
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(196,198,207,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  inputLabelGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9CA3AF",
    marginBottom: 8,
    letterSpacing: 1,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
  },
  textInput: { flex: 1, fontSize: 15, fontWeight: "700", color: "#000613" },

  colorRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: { borderColor: "#000613" },

  saveBtn: {
    backgroundColor: "#000613",
    height: 58,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
