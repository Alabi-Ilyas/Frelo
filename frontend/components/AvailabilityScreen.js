import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Clock, CalendarX, Save, ChevronRight } from "lucide-react-native";
import { getAvailability, updateDaySlot } from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";

export default function AvailabilityScreen() {
  const [avail, setAvail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await getAvailability();
      if (res.success) setAvail(res.availability);
      setLoading(false);
    };
    load();
  }, []);

  const toggleDay = async (day, currentOn) => {
    // Optimistic UI update
    const res = await updateDaySlot({ day, on: !currentOn });
    if (res.success) setAvail(res.availability);
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1A1C19" />
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title="Work Hours" tagline="AVAILABILITY ENGINE" />

      {/* 1. GLOBAL CONFIG CARD */}
      <View style={styles.configCard}>
        <View style={styles.configItem}>
          <Clock size={20} color="#1A1C19" />
          <View style={styles.configText}>
            <Text style={styles.configLabel}>Slot Duration</Text>
            <Text style={styles.configValue}>{avail.slotDuration} Minutes</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.configItem}>
          <CalendarX size={20} color="#1A1C19" />
          <View style={styles.configText}>
            <Text style={styles.configLabel}>Min. Notice</Text>
            <Text style={styles.configValue}>{avail.minNoticeHours} Hours</Text>
          </View>
        </View>
      </View>

      {/* 2. WEEKLY SLOTS LIST */}
      <Text style={styles.sectionTitle}>WEEKLY RECURRENCE</Text>
      {avail.slots.map((slot) => (
        <View key={slot.day} style={styles.dayRow}>
          <View>
            <Text style={styles.dayName}>{slot.day}</Text>
            <Text style={styles.timeRange}>
              {slot.on ? `${slot.start} — ${slot.end}` : "Unavailable"}
            </Text>
          </View>
          <Switch
            value={slot.on}
            onValueChange={() => toggleDay(slot.day, slot.on)}
            trackColor={{ true: "#10B981" }}
          />
        </View>
      ))}

      {/* 3. BLOCKED DATES */}
      <TouchableOpacity style={styles.blockedBtn}>
        <Text style={styles.blockedBtnText}>
          Manage Blocked Dates ({avail.blockedDates.length})
        </Text>
        <ChevronRight size={18} color="#6B7280" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFDF8" },
  centered: { flex: 1, justifyContent: "center" },
  configCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    margin: 24,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F0F1EB",
  },
  configItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  configText: { flex: 1 },
  configLabel: { fontSize: 10, fontWeight: "900", color: "#6B7280" },
  configValue: { fontSize: 14, fontWeight: "700", color: "#1A1C19" },
  divider: { width: 1, backgroundColor: "#F0F1EB", marginHorizontal: 15 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
    marginLeft: 24,
    letterSpacing: 1,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 24,
    marginTop: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F1EB",
  },
  dayName: { fontSize: 16, fontWeight: "800", color: "#1A1C19" },
  timeRange: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },
  blockedBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4EF",
    margin: 24,
    padding: 20,
    borderRadius: 20,
  },
  blockedBtnText: { fontWeight: "700", color: "#1A1C19" },
});
