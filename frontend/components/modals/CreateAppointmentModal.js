import { C } from "../../utils/theme";
import React, { useState } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform, KeyboardAvoidingView,
} from "react-native";
import { X, AlignLeft, User, Calendar, Clock, Link2, ChevronDown } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CreateAppointmentModal({ visible, onClose, onSave, clients = [] }) {
  const [title, setTitle]           = useState("");
  const [clientId, setClientId]     = useState("");
  const [date, setDate]             = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes]           = useState("");
  const [duration, setDuration]     = useState("30");
  const [showClientPicker, setShowClientPicker] = useState(false);

  const selectedClient = clients.find(c => c._id === clientId);

  const handleSave = () => {
    if (!title.trim()) return alert("Title is required.");
    if (!clientId)     return alert("Please select a client.");

    const dateStr = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    const timeStr = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    onSave({
      clientId,
      title:       title.trim(),
      date:        dateStr,
      time:        timeStr,
      duration:    parseInt(duration, 10) || 30,
      meetingLink: meetingLink.trim() || undefined,
      notes:       notes.trim() || undefined,
    });

    setTitle(""); setClientId(""); setMeetingLink(""); setNotes(""); setDuration("30");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.overlay}>
        <View style={s.card}>
          <View style={s.header}>
            <Text style={s.headerTitle}>BOOKING.</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <X size={20} color="#000613" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Title */}
            <Text style={s.label}>EVENT TITLE *</Text>
            <View style={s.inputRow}>
              <AlignLeft size={16} color="#9CA3AF" />
              <TextInput style={s.input} placeholder="e.g. Project Discovery" value={title} onChangeText={setTitle} />
            </View>

            {/* Client selector */}
            <Text style={s.label}>CLIENT *</Text>
            <TouchableOpacity style={s.inputRow} onPress={() => setShowClientPicker(!showClientPicker)}>
              <User size={16} color={clientId ? "#426900" : "#9CA3AF"} />
              <Text style={[s.input, { color: clientId ? "#000613" : "#9CA3AF" }]}>
                {selectedClient?.name ?? "Select a client"}
              </Text>
              <ChevronDown size={16} color="#9CA3AF" />
            </TouchableOpacity>
            {showClientPicker && (
              <View style={s.dropdown}>
                {clients.map(c => (
                  <TouchableOpacity
                    key={c._id}
                    style={s.dropdownItem}
                    onPress={() => { setClientId(c._id); setShowClientPicker(false); }}
                  >
                    <Text style={[s.dropdownText, clientId === c._id && { color: "#426900", fontWeight: "900" }]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Date & Time */}
            <Text style={s.label}>DATE & TIME</Text>
            <TouchableOpacity style={s.inputRow} onPress={() => setShowDatePicker(true)}>
              <Calendar size={16} color="#9CA3AF" />
              <Text style={s.input}>
                {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                {" at "}
                {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display="default"
                minimumDate={new Date()}
                onChange={(e, d) => { setShowDatePicker(false); if (d) setDate(d); }}
              />
            )}

            {/* Duration */}
            <Text style={s.label}>DURATION (MINUTES)</Text>
            <View style={s.inputRow}>
              <Clock size={16} color="#9CA3AF" />
              <TextInput style={s.input} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="30" />
            </View>

            {/* Meeting link */}
            <Text style={s.label}>MEETING LINK (OPTIONAL)</Text>
            <View style={s.inputRow}>
              <Link2 size={16} color="#9CA3AF" />
              <TextInput style={s.input} value={meetingLink} onChangeText={setMeetingLink} placeholder="https://meet.google.com/..." autoCapitalize="none" />
            </View>

            {/* Notes */}
            <Text style={s.label}>NOTES (OPTIONAL)</Text>
            <TextInput
              style={[s.inputRow, { height: 80, alignItems: "flex-start", paddingTop: 12 }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Agenda or notes..."
              multiline
            />

            <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
              <Text style={s.saveBtnText}>CONFIRM BOOKING</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: "rgba(26,28,25,0.6)", justifyContent: "flex-end" },
  card:       { backgroundColor: "#f8f9fa", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: "90%" },
  header:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerTitle:{ fontSize: 22, fontWeight: "900", color: "#000613" },
  closeBtn:   { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(196,198,207,0.4)", justifyContent: "center", alignItems: "center" },
  label:      { fontSize: 9, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1.5, marginBottom: 8, marginTop: 16 },
  inputRow:   { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(196,198,207,0.4)", borderRadius: 14, paddingHorizontal: 14, gap: 10, minHeight: 50 },
  input:      { flex: 1, paddingVertical: 14, fontSize: 14, fontWeight: "700", color: "#000613" },
  dropdown:   { backgroundColor: "#FFF", borderRadius: 14, marginTop: 6, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)", overflow: "hidden" },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#f8f9fa" },
  dropdownText: { fontSize: 14, fontWeight: "700", color: "#000613" },
  saveBtn:    { backgroundColor: "#000613", height: 56, borderRadius: 18, justifyContent: "center", alignItems: "center", marginTop: 24, marginBottom: 20 },
  saveBtnText:{ color: "#FFF", fontWeight: "900", fontSize: 13, letterSpacing: 1 },
});
