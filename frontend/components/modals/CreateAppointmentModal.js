import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import {
  X,
  Calendar as CalIcon,
  Clock,
  User,
  AlignLeft,
  Sparkles,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CreateAppointmentModal({ visible, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleSave = () => {
    if (!title || !clientName) return;

    const payload = {
      title: title.trim(),
      clientName: clientName.trim(),
      date: date.toISOString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      duration: 30, // Default duration
    };

    onSave(payload);
    // Reset fields
    setTitle("");
    setClientName("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BOOKING.</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#1A1C19" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EVENT TITLE</Text>
              <View style={styles.inputWrapper}>
                <AlignLeft size={18} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Project Discovery"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CLIENT NAME</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Who are you meeting?"
                  value={clientName}
                  onChangeText={setClientName}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.dateTrigger}
              onPress={() => setShowPicker(true)}
            >
              <CalIcon size={18} color="#10B981" />
              <Text style={styles.dateText}>
                {date.toDateString()} at{" "}
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="default"
                onChange={(e, d) => {
                  setShowPicker(false);
                  if (d) setDate(d);
                }}
              />
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Sparkles size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>CONFIRM BOOKING</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26,28,25,0.6)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#FBFDF8",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#1A1C19" },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F1EB",
    justifyContent: "center",
    alignItems: "center",
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F1EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1C19",
  },
  dateTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F0F1EB",
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  dateText: { fontSize: 13, fontWeight: "800", color: "#1A1C19" },
  saveBtn: {
    backgroundColor: "#1A1C19",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    gap: 12,
  },
  saveBtnText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
});
