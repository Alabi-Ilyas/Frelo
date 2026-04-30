import React, { useState, useCallback } from "react";
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  Briefcase, DollarSign, CalendarDays, ListTodo,
  Clock, AlertCircle, RefreshCcw,
} from "lucide-react-native";
import { useAuth } from "../components/context/AuthContext";
import { getDashboardData, getClientDashboard } from "../api/apiCalls";
import { C, shadow } from "../utils/theme";

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState(null);

  const load = async () => {
    try {
      setError(null);
      const res = user?.role === "client"
        ? await getClientDashboard()
        : await getDashboardData();
      // Client dashboard returns success:true even with no linked profile
      if (res.success) setData(res);
      else setError("Could not sync workspace.");
    } catch (e) {
      setError("Could not sync workspace.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading && !data) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={s.loaderText}>SYNCING WORKSPACE...</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={s.center}>
        <AlertCircle size={40} color={C.error} />
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={load}>
          <Text style={s.retryText}>RETRY</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats         = data?.stats ?? {};
  const isClient       = user?.role === "client";
  const upcoming48     = data?.upcoming48 ?? data?.upcomingAppointments ?? [];
  const pendingTasks   = data?.pendingTasks ?? [];
  const recentInvoices = data?.recentInvoices ?? [];
  const projectProgress = data?.projectProgress ?? [];

  // Client with no linked freelancer — show inline banner, not fullscreen blocker
  const isUnlinkedClient = isClient && data && !data.profile;

  const statCards = isClient ? [
    { label: "ACTIVE PROJECTS",  value: String(stats.activeProjects ?? 0).padStart(2, "0"), sub: `${stats.totalProjects ?? 0} Total`,                                icon: Briefcase,     dark: false },
    { label: "UNPAID INVOICES",  value: fmt(stats.unpaidTotal),                             sub: `${stats.unpaidCount ?? 0} Outstanding`,                          icon: DollarSign,    dark: true  },
    { label: "UPCOMING APPTS",   value: String(upcoming48.length).padStart(2, "0"),         sub: upcoming48[0] ? `Next: ${upcoming48[0].time}` : "Clear schedule", icon: CalendarDays,  dark: false },
    { label: "PAID TO DATE",     value: fmt(stats.paidTotal),                               sub: "Total paid",                                                     icon: ListTodo,      dark: false },
  ] : [
    { label: "ACTIVE PROJECTS",  value: String(stats.activeProjects ?? 0).padStart(2, "0"), sub: `${stats.totalProjects ?? 0} Total`,                                icon: Briefcase,     dark: false },
    { label: "UNPAID INVOICES",  value: fmt(stats.unpaidTotal),                             sub: `${stats.unpaidCount ?? 0} Outstanding`,                          icon: DollarSign,    dark: true  },
    { label: "UPCOMING (48H)",   value: String(stats.upcoming48Count ?? 0).padStart(2, "0"),sub: upcoming48[0] ? `Next: ${upcoming48[0].time}` : "Clear schedule", icon: CalendarDays,  dark: false },
    { label: "PENDING TASKS",    value: String(stats.pendingTaskCount ?? 0).padStart(2, "0"),sub: stats.overdueTaskCount > 0 ? `${stats.overdueTaskCount} Overdue` : "All on track", icon: ListTodo, dark: false },
  ];

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.tagline}>ARCHITECTURAL WORKSPACE</Text>
            <Text style={s.greeting}>Ready to build,{"\n"}{user?.name?.split(" ")[0] ?? "User"}.</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={s.avatar}>
            <Text style={s.avatarText}>{user?.name?.[0] ?? "U"}</Text>
          </TouchableOpacity>
        </View>

        {/* Unlinked client inline banner */}
        {isUnlinkedClient && (
          <View style={s.unlinkedBanner}>
            <View style={s.unlinkedBannerLeft}>
              <Text style={s.unlinkedBannerTitle}>Account Pending Connection</Text>
              <Text style={s.unlinkedBannerBody}>
                Your account isn't linked to a freelancer yet. Once your freelancer invites <Text style={{ fontWeight: "900" }}>{user?.email}</Text>, your data will appear here.
              </Text>
            </View>
          </View>
        )}

        {/* 4 Stat Cards */}
        <View style={s.statsGrid}>
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <View key={i} style={[s.statCard, card.dark && s.statCardDark, shadow]}>
                <View style={[s.statIconBox, card.dark && s.statIconBoxDark]}>
                  <Icon size={17} color={card.dark ? C.secondaryContainer : C.primary} />
                </View>
                <Text style={[s.statLabel, card.dark && s.statLabelDark]}>{card.label}</Text>
                <Text style={[s.statValue, card.dark && s.statValueDark]} numberOfLines={1}>{card.value}</Text>
                <Text style={[s.statSub, card.dark && s.statSubDark]}>{card.sub}</Text>
              </View>
            );
          })}
        </View>

        {/* Upcoming Appointments */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>UPCOMING APPOINTMENTS</Text>
            <TouchableOpacity onPress={() => navigation.navigate(isClient ? "Booking" : "Calendar")}>
              <Text style={s.sectionLink}>VIEW CALENDAR</Text>
            </TouchableOpacity>
          </View>
          <View style={[s.card, shadow]}>
            {upcoming48.length > 0 ? (
              upcoming48.map((apt, i) => {
                const personName = isClient
                  ? (apt.freelancerId?.businessName ?? apt.freelancerId?.name ?? "Freelancer")
                  : (apt.clientId?.name ?? "Client");
                const initials = personName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <View key={apt._id} style={[s.aptRow, i > 0 && s.aptRowBorder]}>
                    <View style={s.aptAvatar}>
                      <Text style={s.aptAvatarText}>{initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.aptName}>{personName}</Text>
                      <Text style={s.aptTitle} numberOfLines={1}>{apt.title}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={s.aptTime}>{apt.time}</Text>
                      <Text style={s.aptType}>{apt.type ?? "Meeting"}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={s.empty}>
                <CalendarDays size={28} color={C.outlineVar} />
                <Text style={s.emptyText}>Clean 48 hours. Use your time wisely.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Pending Tasks / Project Progress */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{isClient ? "MY PROJECTS" : "MY TO-DO LIST"}</Text>
            <TouchableOpacity onPress={() => navigation.navigate(isClient ? "Projects" : "Tasks")}>
              <Text style={s.sectionLink}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>
          <View style={[s.card, shadow]}>
            {isClient ? (
              projectProgress.length > 0 ? (
                projectProgress.slice(0, 4).map((proj, i) => (
                  <View key={proj._id} style={[s.taskRow, i > 0 && s.taskRowBorder]}>
                    <View style={[s.taskDot, proj.status === "Overdue" && s.taskDotOverdue]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.taskText} numberOfLines={1}>{proj.name}</Text>
                      <View style={s.taskMeta}>
                        <View style={s.taskProjectBadge}>
                          <Text style={s.taskProjectText}>{proj.status}</Text>
                        </View>
                        <View style={s.taskTimeBadge}>
                          <Clock size={10} color={C.outline} />
                          <Text style={s.taskTimeText}>{proj.progress}% done</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={s.empty}>
                  <RefreshCcw size={28} color={C.outlineVar} />
                  <Text style={s.emptyText}>No active projects yet.</Text>
                </View>
              )
            ) : (
              pendingTasks.length > 0 ? (
                pendingTasks.map((task, i) => {
                  const isOverdue = task.status === "Overdue";
                  return (
                    <View key={task._id} style={[s.taskRow, i > 0 && s.taskRowBorder]}>
                      <View style={[s.taskDot, isOverdue && s.taskDotOverdue]} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.taskText} numberOfLines={2}>{task.text}</Text>
                        <View style={s.taskMeta}>
                          <View style={s.taskProjectBadge}>
                            <Text style={s.taskProjectText}>{task.projectName}</Text>
                          </View>
                          <View style={s.taskTimeBadge}>
                            <Clock size={10} color={isOverdue ? C.error : C.outline} />
                            <Text style={[s.taskTimeText, isOverdue && { color: C.error }]}>
                              {task.due
                                ? new Date(task.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                : task.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={s.empty}>
                  <RefreshCcw size={28} color={C.outlineVar} />
                  <Text style={s.emptyText}>All tasks cleared. Architecture is complete.</Text>
                </View>
              )
            )}
            <TouchableOpacity style={s.viewAllBtn} onPress={() => navigation.navigate("Projects")}>
              <Text style={s.viewAllBtnText}>+ VIEW ALL PROJECTS & TASKS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Invoices */}
        {recentInvoices.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>RECENT INVOICES</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Invoices")}>
                <Text style={s.sectionLink}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>
            <View style={[s.card, shadow]}>
              {recentInvoices.map((inv, i) => {
                const label = isClient
                  ? (inv.freelancerId?.businessName ?? inv.freelancerId?.name ?? "Freelancer")
                  : (inv.clientId?.name ?? "Unknown");
                const initials = label.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <View key={inv._id} style={[s.invRow, i > 0 && s.invRowBorder]}>
                    <View style={s.invAvatar}>
                      <Text style={s.invAvatarText}>{initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.invClient}>{label}</Text>
                      <Text style={s.invNum}>{inv.invoiceNumber}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={s.invAmount}>{fmt(inv.amount)}</Text>
                      <Text style={[s.invStatus, { color: inv.status === "Paid" ? C.success : inv.status === "Overdue" ? C.error : C.yellow }]}>
                        {inv.status?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.background },
  center:     { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.background, gap: 12 },
  loaderText: { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: C.primary, marginTop: 8 },
  errorText:  { fontSize: 14, fontWeight: "700", color: C.error, textAlign: "center", marginHorizontal: 32, marginTop: 8 },
  retryBtn:   { marginTop: 16, backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  retryText:  { color: "#fff", fontWeight: "900", fontSize: 11, letterSpacing: 2 },

  container:  { padding: 20, paddingBottom: 100 },

  header:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  tagline:    { fontSize: 10, fontWeight: "900", letterSpacing: 2.5, color: C.secondary, marginBottom: 4 },
  greeting:   { fontSize: 32, fontWeight: "900", letterSpacing: -1, color: C.primary, lineHeight: 38 },
  avatar:     { width: 48, height: 48, borderRadius: 24, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "900", fontSize: 18 },

  statsGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statCard:   { width: "47.5%", backgroundColor: C.card, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: C.outlineVar, minHeight: 160, justifyContent: "space-between" },
  statCardDark: { backgroundColor: C.primary, borderColor: C.primary },
  statIconBox:  { width: 38, height: 38, borderRadius: 12, backgroundColor: C.surfaceLow, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  statIconBoxDark: { backgroundColor: "rgba(255,255,255,0.08)" },
  statLabel:  { fontSize: 9, fontWeight: "900", color: C.onSurfaceVar, letterSpacing: 1.2 },
  statLabelDark: { color: "rgba(255,255,255,0.4)" },
  statValue:  { fontSize: 26, fontWeight: "900", color: C.primary, letterSpacing: -1, marginTop: 6 },
  statValueDark: { color: "#fff" },
  statSub:    { fontSize: 10, fontWeight: "700", color: C.outline },
  statSubDark: { color: C.secondaryContainer },

  section:      { marginBottom: 20 },
  sectionHeader:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 1.8, color: C.primary },
  sectionLink:  { fontSize: 10, fontWeight: "700", color: C.secondary },

  card: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.outlineVar, overflow: "hidden" },

  aptRow:       { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  aptRowBorder: { borderTopWidth: 1, borderTopColor: C.surfaceLow },
  aptAvatar:    { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  aptAvatarText:{ color: "#fff", fontWeight: "900", fontSize: 13 },
  aptName:      { fontSize: 14, fontWeight: "700", color: C.onSurface },
  aptTitle:     { fontSize: 11, color: C.onSurfaceVar, marginTop: 2 },
  aptTime:      { fontSize: 13, fontWeight: "700", color: C.primary },
  aptType:      { fontSize: 9, fontWeight: "900", color: C.outline, letterSpacing: 1 },

  taskRow:      { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 12 },
  taskRowBorder:{ borderTopWidth: 1, borderTopColor: C.surfaceLow },
  taskDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary, marginTop: 6 },
  taskDotOverdue: { backgroundColor: C.error },
  taskText:     { fontSize: 13, fontWeight: "700", color: C.onSurface, lineHeight: 18 },
  taskMeta:     { flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" },
  taskProjectBadge: { backgroundColor: C.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  taskProjectText:  { color: "#fff", fontSize: 9, fontWeight: "900" },
  taskTimeBadge:    { flexDirection: "row", alignItems: "center", gap: 4 },
  taskTimeText:     { fontSize: 10, fontWeight: "700", color: C.outline },
  viewAllBtn:   { padding: 14, alignItems: "center", borderTopWidth: 1, borderTopColor: C.surfaceLow },
  viewAllBtnText: { fontSize: 10, fontWeight: "900", color: C.primary, letterSpacing: 1.5 },

  invRow:       { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  invRowBorder: { borderTopWidth: 1, borderTopColor: C.surfaceLow },
  invAvatar:    { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surfaceLow, alignItems: "center", justifyContent: "center" },
  invAvatarText:{ fontSize: 12, fontWeight: "900", color: C.primary },
  invClient:    { fontSize: 13, fontWeight: "700", color: C.onSurface },
  invNum:       { fontSize: 10, fontWeight: "700", color: C.outline, marginTop: 2 },
  invAmount:    { fontSize: 14, fontWeight: "900", color: C.primary },
  invStatus:    { fontSize: 9, fontWeight: "900", letterSpacing: 1, marginTop: 2 },

  empty:        { alignItems: "center", padding: 32, gap: 8 },
  emptyText:    { fontSize: 11, fontWeight: "600", color: C.outline, textAlign: "center" },

  unlinkedBanner:      { backgroundColor: C.surfaceLow, borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: C.outlineVar, borderLeftWidth: 4, borderLeftColor: C.secondaryContainer },
  unlinkedBannerLeft:  { gap: 6 },
  unlinkedBannerTitle: { fontSize: 14, fontWeight: "900", color: C.primary },
  unlinkedBannerBody:  { fontSize: 13, color: C.onSurfaceVar, lineHeight: 19 },

  // Removed fullscreen unlinked styles — now uses inline banner above
});
