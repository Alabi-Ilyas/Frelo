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

const PROJECT_TYPES = [
  "Web App",
  "Mobile App",
  "Backend API",
  "UI/UX Design",
  "Consultation",
];

export default function CreateProjectModal({
  visible,
  onClose,
  onSave,
  clients = [],
}) {
  const [form, setForm] = useState({
    name: "",
    budget: "",
    clientId: "",
    deadline: "",
    type: "Web App", // Default type
  });

  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const handleSave = () => {
    if (!form.name.trim() || !form.clientId) {
      alert("Project name and Client are required.");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      budget: form.budget ? parseFloat(form.budget) : 0,
      status: "In Progress",
    };

    onSave(payload);
    setForm({
      name: "",
      budget: "",
      clientId: "",
      deadline: "",
      type: "Web App",
    });
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
              <X size={20} color="#1A1C19" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 1. PROJECT NAME */}
            <View style={styles.inputLabelGroup}>
              <Text style={styles.inputLabel}>PROJECT NAME</Text>
              <View style={styles.nameInputWrapper}>
                <Folder size={20} color="#10B981" />
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

            {/* 2. CLIENT & TYPE ROW */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>CLIENT</Text>
                <TouchableOpacity
                  style={[
                    styles.selectorChip,
                    form.clientId && styles.activeChip,
                  ]}
                  onPress={() => {
                    setShowClientPicker(!showClientPicker);
                    setShowTypePicker(false);
                  }}
                >
                  <User
                    size={16}
                    color={form.clientId ? "#10B981" : "#6B7280"}
                  />
                  <Text style={styles.selectorText} numberOfLines={1}>
                    {selectedClientName}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.flex1}>
                <Text style={styles.inputLabel}>PROJECT TYPE</Text>
                <TouchableOpacity
                  style={styles.selectorChip}
                  onPress={() => {
                    setShowTypePicker(!showTypePicker);
                    setShowClientPicker(false);
                  }}
                >
                  <Briefcase size={16} color="#6B7280" />
                  <Text style={styles.selectorText}>{form.type}</Text>
                </TouchableOpacity>
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
                      <Check size={16} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showTypePicker && (
              <View style={styles.pickerDropdown}>
                {PROJECT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={styles.pickerItem}
                    onPress={() => {
                      setForm({ ...form, type: t });
                      setShowTypePicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{t}</Text>
                    {form.type === t && <Check size={16} color="#10B981" />}
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
    backgroundColor: "#FBFDF8",
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
    backgroundColor: "#F0F1EB",
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
  mainInput: { flex: 1, fontSize: 20, fontWeight: "700", color: "#1A1C19" },
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
    borderColor: "#F0F1EB",
  },
  activeChip: { borderColor: "#10B981" },
  selectorText: { fontSize: 13, fontWeight: "600", color: "#1A1C19" },
  pickerDropdown: {
    backgroundColor: "#F0F1EB",
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
  pickerItemText: { fontSize: 13, fontWeight: "700", color: "#1A1C19" },
  rowInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0F1EB",
  },
  flexInput: {
    flex: 1,
    marginLeft: 8,
    fontWeight: "700",
    fontSize: 14,
    color: "#1A1C19",
  },
  saveBtn: {
    backgroundColor: "#1A1C19",
    height: 58,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
