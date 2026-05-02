import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  Calendar,
  PlusCircle,
  Clock,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import {
  getClientAppointments,
  getMyFreelancers,
  getAvailableSlots,
  bookAppointment,
  cancelClientAppointment,
} from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";
import { AppointmentDetailModal } from "./modals/AppointmentDetailsModal";
import { C, shadow } from "../utils/theme";

const STATUS_STYLE = {
  Confirmed: { bg: "#F0FDF4", text: "#16A34A" },
  Pending: { bg: "#FFFBEB", text: "#D97706" },
  Cancelled: { bg: "#FEF2F2", text: "#EF4444" },
  Completed: { bg: C.surfaceLow, text: C.outline },
  "No-show": { bg: "#FEF2F2", text: "#F87171" },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function fmt12(time) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function toDateStr(d) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function ClientBookingScreen() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [tab, setTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [selectedFl, setSelectedFl] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotDuration, setSlotDuration] = useState(30);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apptFilter, setApptFilter] = useState("upcoming");
  const [detailAppt, setDetailAppt] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookingTime, setBookingTime] = useState(null);

  const load = async () => {
    try {
      const [apptRes, flRes] = await Promise.all([
        getClientAppointments(),
        getMyFreelancers(),
      ]);
      if (apptRes?.success) setAppointments(apptRes.appointments ?? []);
      if (flRes?.success) {
        const fls = flRes.freelancers ?? [];
        setFreelancers(fls);
        if (fls.length > 0 && !selectedFl) setSelectedFl(fls[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const loadSlots = async (fl, date) => {
    if (!fl || !date) return;
    setLoadingSlots(true);
    setSlots([]);
    try {
      const res = await getAvailableSlots(fl._id, toDateStr(date));
      if (res?.success) {
        setSlots(res.available ?? []);
        setSlotDuration(res.slotDuration ?? 30);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setBookingTime(null);
    loadSlots(selectedFl, date);
  };

  const handleBook = (time) => {
    if (!selectedFl || !selectedDate) return;

    const performBooking = async (title = "Consultation") => {
      try {
        setBooking(true);
        await bookAppointment({
          freelancerId: selectedFl._id,
          title: title.trim() || "Consultation",
          date: toDateStr(selectedDate),
          time,
        });
        Alert.alert("Booked!", "Your appointment has been scheduled.");
        setTab("appointments");
        setSelectedDate(null);
        setSlots([]);
        load();
      } catch (e) {
        Alert.alert(
          "Error",
          e.response?.data?.message ?? "Could not book appointment.",
        );
      } finally {
        setBooking(false);
      }
    };

    // Use Alert.alert for better cross-platform stability
    Alert.alert("Confirm Booking", `Book session at ${fmt12(time)}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Book Now", onPress: () => performBooking() },
    ]);
  };

  const handleCancel = async (apt) => {
    Alert.alert("Cancel Appointment", "Cancel this appointment?", [
      { text: "Keep", style: "cancel" },
      {
        text: "Cancel It",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelClientAppointment(apt._id);
            setDetailAppt(null);
            load();
          } catch (e) {
            Alert.alert("Error", "Could not cancel.");
          }
        },
      },
    ]);
  };

  const filteredAppts = appointments
    .filter((a) => {
      const d = new Date(a.date);
      if (apptFilter === "upcoming")
        return d >= today && a.status !== "Cancelled";
      if (apptFilter === "past")
        return d < today || a.status === "Completed" || a.status === "No-show";
      return true;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const emptyOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isPast = (day) => new Date(year, month, day) < today;
  const isSelected = (day) =>
    selectedDate?.getDate() === day &&
    selectedDate?.getMonth() === month &&
    selectedDate?.getFullYear() === year;

  const apptDays = new Set(
    appointments
      .filter((a) => a.status !== "Cancelled")
      .map((a) => {
        const d = new Date(a.date);
        return d.getFullYear() === year && d.getMonth() === month
          ? d.getDate()
          : null;
      })
      .filter(Boolean),
  );

  if (loading)
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );

  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      <ScreenHeader title="Appointments." tagline="SCHEDULE" />

      {/* Tabs */}
      <View style={s.tabRow}>
        {[
          { key: "appointments", label: "My Appointments", Icon: Calendar },
          { key: "new", label: "Book New", Icon: PlusCircle },
        ].map(({ key, label, Icon }) => (
          <TouchableOpacity
            key={key}
            style={[s.tab, tab === key && s.tabActive]}
            onPress={() => setTab(key)}
          >
            <Icon size={15} color={tab === key ? C.primary : C.outline} />
            <Text style={[s.tabText, tab === key && s.tabTextActive]}>
              {label}
            </Text>
            {key === "appointments" &&
              appointments.filter(
                (a) => new Date(a.date) >= today && a.status === "Confirmed",
              ).length > 0 && (
                <View style={s.tabBadge}>
                  <Text style={s.tabBadgeText}>
                    {
                      appointments.filter(
                        (a) =>
                          new Date(a.date) >= today && a.status === "Confirmed",
                      ).length
                    }
                  </Text>
                </View>
              )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── APPOINTMENTS TAB ─────────────────────────────────────────── */}
      {tab === "appointments" && (
        <ScrollView
          contentContainerStyle={s.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={C.primary}
            />
          }
        >
          {/* Filter pills */}
          <View style={s.filterRow}>
            {["upcoming", "past", "all"].map((f) => (
              <TouchableOpacity
                key={f}
                style={[s.filterPill, apptFilter === f && s.filterPillActive]}
                onPress={() => setApptFilter(f)}
              >
                <Text
                  style={[s.filterText, apptFilter === f && s.filterTextActive]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredAppts.length === 0 ? (
            <View style={s.empty}>
              <View style={s.emptyIcon}>
                <Bell size={32} color={C.outline} />
              </View>
              <Text style={s.emptyTitle}>No appointments</Text>
              <Text style={s.emptyBody}>
                {apptFilter === "upcoming"
                  ? "No upcoming meetings. Book one below."
                  : "Nothing here yet."}
              </Text>
              {apptFilter === "upcoming" && (
                <TouchableOpacity
                  style={s.emptyBtn}
                  onPress={() => setTab("new")}
                >
                  <PlusCircle size={16} color="#fff" />
                  <Text style={s.emptyBtnText}>BOOK A SESSION</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredAppts.map((apt, idx) => {
              const d = new Date(apt.date);
              const cfg = STATUS_STYLE[apt.status] ?? STATUS_STYLE.Pending;
              const isDone =
                apt.status === "Cancelled" ||
                apt.status === "Completed" ||
                apt.status === "No-show";
              return (
                <TouchableOpacity
                  key={apt._id}
                  style={[s.apptCard, isDone && s.apptCardDone, shadow]}
                  onPress={() => setDetailAppt(apt)}
                  activeOpacity={0.75}
                >
                  <View style={s.apptTop}>
                    <View style={s.dateBadge}>
                      <Text style={s.dateBadgeMon}>
                        {d
                          .toLocaleDateString("en-US", { month: "short" })
                          .toUpperCase()}
                      </Text>
                      <Text style={s.dateBadgeDay}>{d.getDate()}</Text>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[s.statusText, { color: cfg.text }]}>
                        {apt.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.apptTitle} numberOfLines={1}>
                    {apt.title}
                  </Text>
                  <Text style={s.apptMeta}>
                    <Clock size={11} color={C.outline} /> {fmt12(apt.time)} ·{" "}
                    {apt.duration} min
                  </Text>
                  <Text style={s.apptFreelancer}>
                    with{" "}
                    {apt.freelancerId?.businessName ??
                      apt.freelancerId?.name ??
                      "Freelancer"}
                  </Text>
                  {apt.meetingLink && (
                    <View style={s.linkDot}>
                      <View style={s.linkDotCircle} />
                      <Text style={s.linkDotText}>Meeting link attached</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* ── BOOK NEW TAB ─────────────────────────────────────────────── */}
      {tab === "new" && (
        <ScrollView
          contentContainerStyle={s.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Freelancer selector */}
          {freelancers.length === 0 ? (
            <View style={[s.infoBox, shadow]}>
              <Text style={s.infoText}>
                You're not connected to any freelancer yet.
              </Text>
            </View>
          ) : (
            <View style={s.flRow}>
              <Text style={s.flLabel}>BOOKING WITH</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 8 }}
              >
                {freelancers.map((fl) => (
                  <TouchableOpacity
                    key={fl._id}
                    style={[
                      s.flPill,
                      selectedFl?._id === fl._id && s.flPillActive,
                    ]}
                    onPress={() => {
                      setSelectedFl(fl);
                      setSelectedDate(null);
                      setSlots([]);
                    }}
                  >
                    <Text
                      style={[
                        s.flPillText,
                        selectedFl?._id === fl._id && s.flPillTextActive,
                      ]}
                    >
                      {fl.businessName ?? fl.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Calendar */}
          <View style={[s.calCard, shadow]}>
            <View style={s.calHeader}>
              <Text style={s.calTitle}>{monthLabel}</Text>
              <View style={s.calNav}>
                <TouchableOpacity
                  style={s.calNavBtn}
                  onPress={() => setCurrentDate(new Date(year, month - 1, 1))}
                >
                  <ChevronLeft size={18} color={C.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.calNavBtn}
                  onPress={() => setCurrentDate(new Date(year, month + 1, 1))}
                >
                  <ChevronRight size={18} color={C.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Day labels */}
            <View style={s.calDayRow}>
              {DAYS.map((d) => (
                <Text key={d} style={s.calDayLabel}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Day grid */}
            <View style={s.calGrid}>
              {Array.from({ length: emptyOffset }).map((_, i) => (
                <View key={`e-${i}`} style={s.calCell} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const past = isPast(day);
                const selected = isSelected(day);
                const hasAppt = apptDays.has(day);
                return (
                  // Locate the daysInMonth.map section and update the TouchableOpacity to this:
                  <TouchableOpacity
                    key={day}
                    style={[
                      s.calCell,
                      past && s.calCellPast,
                      selected && s.calCellSelected,
                      !past && !selected && s.calCellActive,
                    ]}
                    onPress={() => handleSelectDate(new Date(year, month, day))} // Simplified logic
                    disabled={past || !selectedFl} // Let the disabled prop handle the lockout
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        s.calCellText,
                        past && s.calCellTextPast,
                        selected && s.calCellTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                    {hasAppt && !selected && <View style={s.calDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Slots */}
          <View style={[s.slotsCard, shadow]}>
            <Text style={s.slotsTitle}>
              {selectedDate
                ? `Available Slots — ${selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "Available Slots"}
            </Text>

            {!selectedDate || !selectedFl ? (
              <Text style={s.slotsHint}>
                {!selectedFl
                  ? "Select a freelancer above."
                  : "Select a date to see available slots."}
              </Text>
            ) : loadingSlots ? (
              <ActivityIndicator
                color={C.primary}
                style={{ marginVertical: 24 }}
              />
            ) : slots.length === 0 ? (
              <Text style={s.slotsHint}>
                No slots available. Try a different date.
              </Text>
            ) : (
              <>
                <Text style={s.slotsMeta}>
                  {slotDuration}-min sessions · {slots.length} slot
                  {slots.length !== 1 ? "s" : ""} open
                </Text>
                <View style={s.slotsGrid}>
                  {slots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[s.slotBtn, booking && s.slotBtnDisabled]}
                      onPress={() => handleBook(time)}
                      disabled={booking}
                      activeOpacity={0.75}
                    >
                      <Clock size={13} color={C.primary} />
                      <Text style={s.slotBtnText}>{fmt12(time)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      )}

      {/* Appointment detail modal */}
      <AppointmentDetailModal
        visible={!!detailAppt}
        appointment={detailAppt}
        onClose={() => setDetailAppt(null)}
        onCancel={() => handleCancel(detailAppt)}
        actionLoading={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.background,
  },

  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.outlineVar,
    backgroundColor: C.background,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: C.primary },
  tabText: {
    fontSize: 10,
    fontWeight: "900",
    color: C.outline,
    letterSpacing: 1,
  },
  tabTextActive: { color: C.primary },
  tabBadge: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  tabBadgeText: { color: "#fff", fontSize: 9, fontWeight: "900" },

  container: { padding: 16, paddingBottom: 100 },

  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.outlineVar,
  },
  filterPillActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterText: { fontSize: 10, fontWeight: "900", color: C.onSurfaceVar },
  filterTextActive: { color: "#fff" },

  apptCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.outlineVar,
  },
  apptCardDone: { opacity: 0.6 },
  apptTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  dateBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.outlineVar,
  },
  dateBadgeMon: {
    fontSize: 9,
    fontWeight: "900",
    color: C.primary,
    letterSpacing: 0.5,
  },
  dateBadgeDay: {
    fontSize: 22,
    fontWeight: "900",
    color: C.primary,
    lineHeight: 26,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 9, fontWeight: "900" },
  apptTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.onSurface,
    marginBottom: 6,
  },
  apptMeta: { fontSize: 11, color: C.onSurfaceVar, marginBottom: 3 },
  apptFreelancer: { fontSize: 11, color: C.onSurfaceVar },
  linkDot: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  linkDotCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primary,
  },
  linkDotText: {
    fontSize: 10,
    fontWeight: "900",
    color: C.primary,
    letterSpacing: 0.5,
  },

  empty: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: C.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: C.primary },
  emptyBody: { fontSize: 13, color: C.onSurfaceVar, textAlign: "center" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyBtnText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  infoBox: {
    backgroundColor: C.surfaceLow,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoText: { fontSize: 13, color: C.onSurfaceVar, fontWeight: "600" },

  flRow: { marginBottom: 16 },
  flLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: C.onSurfaceVar,
    letterSpacing: 1.5,
  },
  flPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.outlineVar,
    marginRight: 8,
  },
  flPillActive: { backgroundColor: C.primary, borderColor: C.primary },
  flPillText: { fontSize: 13, fontWeight: "700", color: C.onSurface },
  flPillTextActive: { color: "#fff" },

  calCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.outlineVar,
  },
  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  calTitle: { fontSize: 16, fontWeight: "900", color: C.primary },
  calNav: { flexDirection: "row", gap: 8 },
  calNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },
  calDayRow: { flexDirection: "row", marginBottom: 8 },
  calDayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "900",
    color: C.outline,
    letterSpacing: 0.5,
  },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  calCellPast: { opacity: 0.25 },
  calCellSelected: { backgroundColor: C.primary, borderRadius: 10 },
  calCellActive: {},
  calCellText: { fontSize: 13, fontWeight: "700", color: C.onSurface },
  calCellTextPast: { color: C.outline },
  calCellTextSelected: { color: "#fff", fontWeight: "900" },
  calDot: {
    position: "absolute",
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.secondaryContainer,
  },

  slotsCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: C.outlineVar,
  },
  slotsTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: C.onSurfaceVar,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  slotsHint: {
    fontSize: 13,
    color: C.outline,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 24,
  },
  slotsMeta: {
    fontSize: 10,
    color: C.outline,
    fontWeight: "700",
    marginBottom: 12,
  },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slotBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.surfaceLow,
    borderWidth: 1,
    borderColor: C.outlineVar,
  },
  slotBtnDisabled: { opacity: 0.5 },
  slotBtnText: { fontSize: 13, fontWeight: "700", color: C.primary },
});
