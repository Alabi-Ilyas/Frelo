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
import {
  X,
  User,
  DollarSign,
  Calendar,
  Check,
  Folder,
  Briefcase,
} from "lucide-react-native";

export default function CreateProjectModal({
  visible,
  onClose,
  onSave,
  clients = [],
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    budget: "",
    clientId: "",
    deadline: "",
  });

  const [showClientPicker, setShowClientPicker] = useState(false);

  const handleSave = () => {
    if (!form.name.trim() || !form.clientId) {
      alert("Project name and Client are required.");
      return;
    }

    const payload = {
      name:        form.name.trim(),
      description: form.description.trim() || undefined,
      budget:      form.budget ? parseFloat(form.budget) : 0,
      clientId:    form.clientId,
      deadline:    form.deadline || undefined,
      status:      "In Progress",
    };

    onSave(payload);
    setForm({ name: "", description: "", budget: "", clientId: "", deadline: "" });
    onClose();
  };

  const selectedClientName =
    clients.find((c) => c._id === form.clientId)?.name || "Link a Client";

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>LAUNCH PROJECT</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
              <X size={20} color="#000613" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 1. PROJECT NAME */}
            <View style={styles.inputLabelGroup}>
              <Text style={styles.inputLabel}>PROJECT NAME</Text>
              <View style={styles.nameInputWrapper}>
                <Folder size={20} color="#426900" />
                <TextInput
                  style={styles.mainInput}
                  placeholder="e.g. Lagos Office App"
                  placeholderTextColor="#9CA3AF"
                  value={form.name}
                  autoFocus={true}
                  onChangeText={(v) => setForm({ ...form, name: v })}
                />
              </View>
            </View>

            {/* 1b. DESCRIPTION */}
            <View style={styles.inputLabelGroup}>
              <Text style={styles.inputLabel}>DESCRIPTION (OPTIONAL)</Text>
              <TextInput
                style={[styles.mainInput, { fontSize: 14, minHeight: 60 }]}
                placeholder="Brief project description..."
                placeholderTextColor="#9CA3AF"
                value={form.description}
                onChangeText={(v) => setForm({ ...form, description: v })}
                multiline
              />
            </View>

            {/* 2. CLIENT ROW */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>CLIENT</Text>
                <TouchableOpacity
                  style={[
                    styles.selectorChip,
                    form.clientId && styles.activeChip,
                  ]}
                  onPress={() => setShowClientPicker(!showClientPicker)}
                >
                  <User
                    size={16}
                    color={form.clientId ? "#426900" : "#6B7280"}
                  />
                  <Text style={styles.selectorText} numberOfLines={1}>
                    {selectedClientName}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>CURRENCY</Text>
                <View style={styles.selectorChip}>
                  <Briefcase size={16} color="#6B7280" />
                  <TextInput
                    style={[styles.selectorText, { flex: 1 }]}
                    placeholder="NGN"
                    value={form.currency}
                    onChangeText={(v) => setForm({ ...form, currency: v })}
                  />
                </View>
              </View>
            </View>

            {/* CONDITIONAL PICKERS */}
            {showClientPicker && (
              <View style={styles.pickerDropdown}>
                {clients.map((client) => (
                  <TouchableOpacity
                    key={client._id}
                    style={styles.pickerItem}
                    onPress={() => {
                      setForm({ ...form, clientId: client._id });
                      setShowClientPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{client.name}</Text>
                    {form.clientId === client._id && (
                      <Check size={16} color="#426900" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}



            {/* 3. BUDGET & DEADLINE ROW */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>BUDGET</Text>
                <View style={styles.rowInput}>
                  <DollarSign size={16} color="#6B7280" />
                  <TextInput
                    style={styles.flexInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={form.budget}
                    onChangeText={(v) => setForm({ ...form, budget: v })}
                  />
                </View>
              </View>

              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>DEADLINE</Text>
                <View style={styles.rowInput}>
                  <Calendar size={16} color="#6B7280" />
                  <TextInput
                    style={styles.flexInput}
                    placeholder="YYYY-MM-DD"
                    value={form.deadline}
                    onChangeText={(v) => setForm({ ...form, deadline: v })}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Initialize Project</Text>
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
    maxHeight: "85%",
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
  nameInputWrapper: { flexDirection: "row", alignItems: "center", gap: 12 },
  mainInput: { flex: 1, fontSize: 20, fontWeight: "700", color: "#000613" },
  row: { flexDirection: "row", gap: 12, marginBottom: 20 },
  flex1: { flex: 1 },
  selectorChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
  },
  activeChip: { borderColor: "#426900" },
  selectorText: { fontSize: 13, fontWeight: "600", color: "#000613" },
  pickerDropdown: {
    backgroundColor: "rgba(196,198,207,0.4)",
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  pickerItemText: { fontSize: 13, fontWeight: "700", color: "#000613" },
  rowInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
  },
  flexInput: {
    flex: 1,
    marginLeft: 8,
    fontWeight: "700",
    fontSize: 14,
    color: "#000613",
  },
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
