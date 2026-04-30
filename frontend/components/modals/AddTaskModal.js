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
  ActivityIndicator,
} from "react-native";
import {
  X,
  Calendar as CalendarIcon,
  Sparkles,
  Briefcase,
  Check,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AddTaskModal({
  visible,
  onClose,
  onSave,
  projects = [],
  isLoading,
}) {
  const [text, setText] = useState("");
  const [due, setDue] = useState(new Date()); // Store as Date object
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState("Pending");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [showProjectList, setShowProjectList] = useState(false);
  const [error, setError] = useState("");

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDue(selectedDate);
    }
  };

  const handleSave = () => {
    setError("");
    if (!text.trim()) return setError("TASK NAME IS REQUIRED.");
    if (!selectedProjectId) return setError("PLEASE SELECT A PROJECT.");

    const payload = {
      text: text.trim(),
      // Format as YYYY-MM-DD safely
      due: due.toISOString().split("T")[0],
      order: 0,
    };

    onSave(selectedProjectId, payload);

    // Reset
    setText("");
    setDue(new Date());
    setSelectedProjectId("");
    setStatus("Pending");
  };

  const selectedProjectName =
    projects.find((p) => p._id === selectedProjectId)?.name || "SELECT PROJECT";

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>ADD TASK.</Text>
              <Text style={styles.tagline}>NEW MILESTONE</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
              <X size={24} color="#000613" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
            {/* PROJECT SELECTION */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ASSIGN TO PROJECT *</Text>
              <TouchableOpacity
                style={styles.projectSelector}
                onPress={() => setShowProjectList(!showProjectList)}
              >
                <Briefcase
                  size={18}
                  color={selectedProjectId ? "#426900" : "#9CA3AF"}
                />
                <Text
                  style={[
                    styles.projectSelectorText,
                    selectedProjectId && styles.activeProjectText,
                  ]}
                >
                  {selectedProjectName.toUpperCase()}
                </Text>
              </TouchableOpacity>
              {showProjectList && (
                <View style={styles.dropdown}>
                  {projects.map((p) => (
                    <TouchableOpacity
                      key={p._id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedProjectId(p._id);
                        setShowProjectList(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{p.name}</Text>
                      {selectedProjectId === p._id && (
                        <Check size={16} color="#426900" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* TASK NAME */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>TASK DESCRIPTION *</Text>
              <TextInput
                style={styles.mainInput}
                placeholder="e.g. Build API Endpoints"
                placeholderTextColor="#9CA3AF"
                value={text}
                onChangeText={setText}
              />
            </View>

            <View style={styles.grid}>
              {/* DATE PICKER TRIGGER */}
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>DUE DATE</Text>
                <TouchableOpacity
                  style={styles.gridInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CalendarIcon size={14} color="#000613" />
                    <Text style={styles.gridInputText}>
                      {due.toDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={due}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>STATUS</Text>
                <TouchableOpacity
                  style={styles.gridInput}
                  onPress={() =>
                    setStatus(
                      status === "Pending"
                        ? "In Progress"
                        : status === "In Progress"
                          ? "Done"
                          : "Pending",
                    )
                  }
                >
                  <Text style={styles.statusText}>{status.toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={onClose}
                style={{ paddingVertical: 10 }}
              >
                <Text style={styles.discardText}>DISCARD</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, isLoading && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Sparkles size={16} color="#FFF" />
                    <Text style={styles.saveBtnText}>ADD TASK</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26, 28, 25, 0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 32,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000613",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 2,
    marginTop: 4,
  },
  closeCircle: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "rgba(196,198,207,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 2,
    marginBottom: 8,
  },
  projectSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(196,198,207,0.4)",
    padding: 18,
    borderRadius: 20,
  },
  projectSelectorText: { fontSize: 12, fontWeight: "900", color: "#9CA3AF" },
  activeProjectText: { color: "#000613" },
  dropdown: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
    padding: 8,
    maxHeight: 150,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  dropdownItemText: { fontSize: 13, fontWeight: "700", color: "#000613" },
  mainInput: {
    backgroundColor: "rgba(196,198,207,0.4)",
    borderRadius: 20,
    padding: 18,
    fontSize: 14,
    fontWeight: "800",
    color: "#000613",
  },
  grid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  gridInput: {
    backgroundColor: "rgba(196,198,207,0.4)",
    borderRadius: 20,
    padding: 18,
    height: 56,
    justifyContent: "center",
  },
  gridInputText: { fontSize: 11, fontWeight: "700", color: "#000613" },
  statusText: { fontSize: 11, fontWeight: "900", color: "#000613" },
  errorText: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 20,
  },
  discardText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 1,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#000613",
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },
});
