import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  FolderOpen, TrendingUp, AlertCircle, CheckCircle2,
  DollarSign, Calendar, ChevronRight, Plus,
} from "lucide-react-native";
import { getProjects, getClients, createProject } from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";
import CreateProjectModal from "./modals/CreateProjectModal";

const FILTERS = ["All", "In Progress", "Pending", "Done", "Overdue"];

const STATUS_CFG = {
  "In Progress": { bg: "#EFF6FF", text: "#2563EB", dot: "#3B82F6", bar: "#3B82F6" },
  "Pending":     { bg: "#FFFBEB", text: "#D97706", dot: "#F59E0B", bar: "#F59E0B" },
  "Done":        { bg: "#F0FDF4", text: "#16A34A", dot: "#22C55E", bar: "#22C55E" },
  "Overdue":     { bg: "#FEF2F2", text: "#DC2626", dot: "#EF4444", bar: "#EF4444" },
  "Cancelled":   { bg: "#F9FAFB", text: "#6B7280", dot: "#9CA3AF", bar: "#D1D5DB" },
};

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

function daysUntil(dateStr) {
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (days < 0)   return { label: `${Math.abs(days)}d overdue`, color: "#EF4444" };
  if (days === 0) return { label: "Due today",                  color: "#F97316" };
  if (days <= 7)  return { label: `${days}d left`,              color: "#D97706" };
  return              { label: `${days}d left`,              color: "#9CA3AF" };
}

export default function ProjectScreen({ navigation }) {
  const [projects, setProjects]   = useState([]);
  const [clients, setClients]     = useState([]);
  const [filter, setFilter]       = useState("All");
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating]   = useState(false);

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([getProjects(), getClients()]);
      if (pRes?.success) setProjects(pRes.projects ?? []);
      if (cRes?.success) setClients(cRes.clients ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const filtered = filter === "All" ? projects : projects.filter(p => p.status === filter);

  const stats = {
    total:   projects.length,
    active:  projects.filter(p => p.status === "In Progress").length,
    overdue: projects.filter(p => p.status === "Overdue").length,
    done:    projects.filter(p => p.status === "Done").length,
    revenue: projects.reduce((s, p) => s + (p.budget ?? 0), 0),
  };

  const handleCreate = async (data) => {
    try {
      setCreating(true);
      const res = await createProject(data);
      if (res?.success) { setModalVisible(false); load(); }
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  const renderItem = ({ item }) => {
    const cfg      = STATUS_CFG[item.status] ?? STATUS_CFG["Pending"];
    const progress = item.progress ?? 0;
    const deadline = item.deadline ? daysUntil(item.deadline) : null;
    const isDone   = item.status === "Done" || item.status === "Cancelled";
    const ts       = item.taskSummary ?? { total: 0, Done: 0 };

    return (
      <TouchableOpacity
        style={[s.card, isDone && s.cardDone]}
        onPress={() => navigation.navigate("ProjectDetail", { projectId: item._id })}
        activeOpacity={0.7}
      >
        {/* Top row */}
        <View style={s.cardTop}>
          <View style={[s.badge, { backgroundColor: cfg.bg }]}>
            <View style={[s.badgeDot, { backgroundColor: cfg.dot }]} />
            <Text style={[s.badgeText, { color: cfg.text }]}>{item.status?.toUpperCase()}</Text>
          </View>
          <ChevronRight size={18} color="#D1D5DB" />
        </View>

        {/* Name + client */}
        <Text style={s.projName}>{item.name}</Text>
        <Text style={s.projClient}>{item.clientId?.name ?? "—"}</Text>

        {/* Description */}
        {item.description ? (
          <Text style={s.projDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}

        {/* Tags */}
        {item.tags?.length > 0 && (
          <View style={s.tagsRow}>
            {item.tags.slice(0, 3).map(tag => (
              <View key={tag} style={s.tag}>
                <Text style={s.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Progress */}
        <View style={s.progressSection}>
          <View style={s.progressHeader}>
            <Text style={s.progressLabel}>{ts.Done}/{ts.total} tasks</Text>
            <Text style={s.progressPct}>{progress}%</Text>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${progress}%`, backgroundColor: cfg.bar }]} />
          </View>
        </View>

        {/* Footer */}
        <View style={s.cardFooter}>
          <View style={s.footerItem}>
            <Calendar size={12} color="#9CA3AF" />
            <Text style={s.footerText}>
              {item.deadline
                ? new Date(item.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "No deadline"}
            </Text>
          </View>
          <View style={s.footerRight}>
            {deadline && !isDone && (
              <Text style={[s.deadlineText, { color: deadline.color }]}>{deadline.label}</Text>
            )}
            {item.budget > 0 && (
              <Text style={s.budgetText}>{fmt(item.budget)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      <ScreenHeader title="Projects." tagline="PORTFOLIO DIRECTORY" onPressAdd={() => setModalVisible(true)} />

      {/* Stats strip */}
      {!loading && (
        <View style={s.statsRow}>
          {[
            { label: "Total",    value: stats.total,          icon: FolderOpen,   color: "#1A1C19" },
            { label: "Active",   value: stats.active,         icon: TrendingUp,   color: "#2563EB" },
            { label: "Overdue",  value: stats.overdue,        icon: AlertCircle,  color: "#EF4444" },
            { label: "Done",     value: stats.done,           icon: CheckCircle2, color: "#16A34A" },
            { label: "Pipeline", value: fmt(stats.revenue),   icon: DollarSign,   color: "#426900" },
          ].map(({ label, value, icon: Icon, color }) => (
            <View key={label} style={s.statBox}>
              <Icon size={14} color={color} />
              <Text style={[s.statValue, { color }]}>{value}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Filter tabs */}
      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterTab, filter === f && s.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color="#1A1C19" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i._id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <FolderOpen size={48} color="#E2E3DD" />
              <Text style={s.emptyText}>No projects found.</Text>
            </View>
          }
        />
      )}

      <CreateProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreate}
        clients={clients}
        loading={creating}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#FBFDF8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list:   { paddingHorizontal: 16, paddingBottom: 100 },

  statsRow: {
    flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#F0F1EB",
  },
  statBox:  { flex: 1, alignItems: "center", gap: 2 },
  statValue:{ fontSize: 13, fontWeight: "900", color: "#1A1C19" },
  statLabel:{ fontSize: 8, fontWeight: "700", color: "#9CA3AF" },

  filterRow: {
    flexDirection: "row", paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: "#F3F4EF", gap: 6,
  },
  filterTab:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: "transparent" },
  filterTabActive: { backgroundColor: "#FFF" },
  filterText:      { fontSize: 10, fontWeight: "900", color: "#9CA3AF" },
  filterTextActive:{ color: "#1A1C19" },

  card: {
    backgroundColor: "#FFF", borderRadius: 20, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: "#F0F1EB",
  },
  cardDone: { opacity: 0.7 },

  cardTop:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  badge:    { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText:{ fontSize: 9, fontWeight: "900" },

  projName:   { fontSize: 18, fontWeight: "800", color: "#1A1C19", marginBottom: 4 },
  projClient: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", letterSpacing: 0.5, marginBottom: 8 },
  projDesc:   { fontSize: 13, color: "#6B7280", lineHeight: 18, marginBottom: 10 },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tag:     { backgroundColor: "#F3F4EF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 9, fontWeight: "900", color: "#6B7280" },

  progressSection: { marginBottom: 14 },
  progressHeader:  { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel:   { fontSize: 10, fontWeight: "700", color: "#9CA3AF" },
  progressPct:     { fontSize: 10, fontWeight: "900", color: "#1A1C19" },
  progressBg:      { height: 6, backgroundColor: "#F0F1EB", borderRadius: 3, overflow: "hidden" },
  progressFill:    { height: "100%", borderRadius: 3 },

  cardFooter:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F9FAFB" },
  footerItem:  { flexDirection: "row", alignItems: "center", gap: 5 },
  footerText:  { fontSize: 11, color: "#9CA3AF", fontWeight: "600" },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  deadlineText:{ fontSize: 10, fontWeight: "900" },
  budgetText:  { fontSize: 11, fontWeight: "900", color: "#1A1C19" },

  empty:     { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { color: "#9CA3AF", fontWeight: "600" },
});
