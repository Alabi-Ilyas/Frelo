import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, Switch, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Clock, Info, Save, RefreshCcw, ChevronDown } from "lucide-react-native";
import { getAvailability, updateAvailability } from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
  Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
};
const DEFAULT_SLOTS = DAYS.map(day => ({
  day, on: !["Sat", "Sun"].includes(day), start: "09:00", end: "17:00",
}));

export default function AvailabilityScreen() {
  const [slots, setSlots]               = useState(DEFAULT_SLOTS);
  const [slotDuration, setSlotDuration] = useState(30);
  const [minNoticeHours, setMinNoticeHours] = useState(2);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [original, setOriginal]         = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAvailability();
        if (res?.success && res.availability) {
          const avail = res.availability;
          if (avail.slots?.length) {
            const map = Object.fromEntries(avail.slots.map(s => [s.day, s]));
            const merged = DAYS.map(day => map[day] ?? DEFAULT_SLOTS.find(d => d.day === day));
            setSlots(merged);
            setOriginal({ slots: merged, slotDuration: avail.slotDuration ?? 30, minNoticeHours: avail.minNoticeHours ?? 2 });
          }
          if (avail.slotDuration)    setSlotDuration(avail.slotDuration);
          if (avail.minNoticeHours !== undefined) setMinNoticeHours(avail.minNoticeHours);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const toggle = (day) => {
    setSlots(prev => prev.map(s =>
      s.day === day ? { ...s, on: !s.on, start: s.start || "09:00", end: s.end || "17:00" } : s
    ));
  };

  const updateTime = (day, field, value) => {
    setSlots(prev => prev.map(s => s.day === day ? { ...s, [field]: value } : s));
  };

  const handleDiscard = () => {
    if (original) {
      setSlots(original.slots);
      setSlotDuration(original.slotDuration);
      setMinNoticeHours(original.minNoticeHours);
    } else {
      setSlots(DEFAULT_SLOTS);
      setSlotDuration(30);
      setMinNoticeHours(2);
    }
  };

  const handleSave = async () => {
    for (const s of slots) {
      if (s.on && s.start >= s.end) {
        Alert.alert("Invalid Time", `${DAY_LABELS[s.day]}: start must be before end.`);
        return;
      }
    }
    try {
      setSaving(true);
      await updateAvailability({ slots, slotDuration, minNoticeHours });
      setOriginal({ slots, slotDuration, minNoticeHours });
      Alert.alert("Saved", "Availability updated successfully.");
    } catch (e) {
      Alert.alert("Error", "Could not save availability.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color="#1A1C19" /></View>;
  }

  const activeCount = slots.filter(s => s.on).length;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />
      <ScreenHeader title="Availability." tagline="REGISTRY CONFIGURATION" />

      {/* Stats strip */}
      <View style={s.statsRow}>
        {[
          { label: "Active Windows", value: activeCount },
          { label: "Notice",         value: `${minNoticeHours}h` },
          { label: "Slot Duration",  value: `${slotDuration}m` },
          { label: "Status",         value: activeCount > 0 ? "Online" : "Offline" },
        ].map(({ label, value }) => (
          <View key={label} style={s.statBox}>
            <Text style={s.statValue}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Parameters */}
      <View style={s.paramsRow}>
        <View style={s.paramBox}>
          <Text style={s.paramLabel}>SLOT DURATION</Text>
          <View style={s.paramSelect}>
            {[15, 30, 45, 60].map(d => (
              <TouchableOpacity
                key={d}
                style={[s.durationBtn, slotDuration === d && s.durationBtnActive]}
                onPress={() => setSlotDuration(d)}
              >
                <Text style={[s.durationText, slotDuration === d && s.durationTextActive]}>{d}m</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={s.paramBox}>
          <Text style={s.paramLabel}>MIN NOTICE (HOURS)</Text>
          <View style={s.noticeRow}>
            <TextInput
              style={s.noticeInput}
              value={String(minNoticeHours)}
              onChangeText={v => setMinNoticeHours(Number(v) || 0)}
              keyboardType="numeric"
            />
            <Text style={s.noticeUnit}>hrs</Text>
          </View>
        </View>
      </View>

      {/* Weekly schedule */}
      <Text style={s.sectionTitle}>WEEKLY REGISTRY</Text>
      <View style={s.scheduleCard}>
        {slots.map((slot, i) => (
          <View key={slot.day} style={[s.dayRow, i > 0 && s.dayRowBorder, !slot.on && s.dayRowOff]}>
            <View style={s.dayLeft}>
              <Text style={s.dayName}>{DAY_LABELS[slot.day]}</Text>
              {!slot.on && <Text style={s.unavailText}>Unavailable</Text>}
            </View>

            <Switch
              value={slot.on}
              onValueChange={() => toggle(slot.day)}
              trackColor={{ true: "#1A1C19", false: "#E5E7EB" }}
              thumbColor={slot.on ? "#ADFF2F" : "#9CA3AF"}
            />

            {slot.on && (
              <View style={s.timeInputs}>
                <TextInput
                  style={s.timeInput}
                  value={slot.start}
                  onChangeText={v => updateTime(slot.day, "start", v)}
                  placeholder="09:00"
                />
                <Text style={s.timeSep}>—</Text>
                <TextInput
                  style={s.timeInput}
                  value={slot.end}
                  onChangeText={v => updateTime(slot.day, "end", v)}
                  placeholder="17:00"
                />
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Info note */}
      <View style={s.infoRow}>
        <Info size={18} color="#426900" />
        <Text style={s.infoText}>Clients use these windows to schedule consultations with you.</Text>
      </View>

      {/* Actions */}
      <View style={s.actionsRow}>
        <TouchableOpacity style={s.discardBtn} onPress={handleDiscard} disabled={saving}>
          <RefreshCcw size={16} color="#6B7280" />
          <Text style={s.discardText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color="#FFF" />
            : <Save size={16} color="#FFF" />}
          <Text style={s.saveBtnText}>Sync Registry</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: "#FBFDF8" },
  container: { paddingBottom: 100 },
  center:    { flex: 1, justifyContent: "center", alignItems: "center" },

  statsRow: { flexDirection: "row", backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#F0F1EB", paddingVertical: 14 },
  statBox:  { flex: 1, alignItems: "center" },
  statValue:{ fontSize: 16, fontWeight: "900", color: "#1A1C19" },
  statLabel:{ fontSize: 8, fontWeight: "700", color: "#9CA3AF", marginTop: 2 },

  paramsRow: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  paramBox:  { flex: 1, backgroundColor: "#FFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#F0F1EB" },
  paramLabel:{ fontSize: 9, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1, marginBottom: 10 },
  paramSelect:{ flexDirection: "row", gap: 6 },
  durationBtn:      { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: "#F3F4EF", alignItems: "center" },
  durationBtnActive:{ backgroundColor: "#1A1C19" },
  durationText:     { fontSize: 11, fontWeight: "900", color: "#6B7280" },
  durationTextActive:{ color: "#FFF" },
  noticeRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  noticeInput:{ flex: 1, backgroundColor: "#F3F4EF", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, fontWeight: "900", color: "#1A1C19", textAlign: "center" },
  noticeUnit: { fontSize: 12, fontWeight: "700", color: "#9CA3AF" },

  sectionTitle: { fontSize: 11, fontWeight: "900", color: "#6B7280", letterSpacing: 1, marginLeft: 16, marginBottom: 8 },
  scheduleCard: { backgroundColor: "#FFF", marginHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: "#F0F1EB", overflow: "hidden", marginBottom: 16 },
  dayRow:       { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  dayRowBorder: { borderTopWidth: 1, borderTopColor: "#F9FAFB" },
  dayRowOff:    { opacity: 0.5 },
  dayLeft:      { width: 80 },
  dayName:      { fontSize: 14, fontWeight: "800", color: "#1A1C19" },
  unavailText:  { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
  timeInputs:   { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  timeInput:    { flex: 1, backgroundColor: "#F3F4EF", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, fontWeight: "700", color: "#1A1C19", textAlign: "center" },
  timeSep:      { fontSize: 14, color: "#9CA3AF", fontWeight: "700" },

  infoRow:  { flexDirection: "row", alignItems: "flex-start", gap: 10, marginHorizontal: 16, marginBottom: 20, backgroundColor: "#F0FDF4", padding: 14, borderRadius: 14 },
  infoText: { flex: 1, fontSize: 12, color: "#166534", fontWeight: "600", lineHeight: 18 },

  actionsRow: { flexDirection: "row", gap: 12, paddingHorizontal: 16, marginBottom: 40 },
  discardBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  discardText:{ fontSize: 13, fontWeight: "900", color: "#6B7280" },
  saveBtn:    { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 16, backgroundColor: "#1A1C19" },
  saveBtnText:{ fontSize: 13, fontWeight: "900", color: "#FFF" },
});
