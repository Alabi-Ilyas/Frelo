import { C } from "../utils/theme";
import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  ChevronLeft, Building2, CalendarDays, DollarSign,
  CheckCircle2, Clock, AlertCircle, Circle,
} from "lucide-react-native";
import { getClientProjectById } from "../api/apiCalls";

const TASK_CFG = {
  "Done":        { icon: CheckCircle2, color: "#16A34A", bg: "#F0FDF4", text: "#16A34A" },
  "In Progress": { icon: Clock,        color: "#2563EB", bg: "#EFF6FF", text: "#2563EB" },
  "Pending":     { icon: Circle,       color: "#9CA3AF", bg: "#f8f9fa", text: "#6B7280" },
  "Overdue":     { icon: AlertCircle,  color: "#EF4444", bg: "#FEF2F2", text: "#DC2626" },
};

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function ClientProjectDetailScreen({ route, navigation }) {
  const { projectId } = route.params;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getClientProjectById(projectId);
      if (res?.success) setProject(res.project);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [projectId]));

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={s.center}>
        <AlertCircle size={40} color="#EF4444" />
        <Text style={s.errorText}>Project not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tasks    = project.tasks ?? [];
  const progress = project.progress ?? 0;
  const doneCnt  = tasks.filter(t => t.status === "Done").length;
  const ipCnt    = tasks.filter(t => t.status === "In Progress").length;
  const pendCnt  = tasks.filter(t => t.status === "Pending").length;
  const ovCnt    = tasks.filter(t => t.status === "Overdue").length;

  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity style={s.backRow} onPress={() => navigation.goBack()}>
          <ChevronLeft size={18} color="#6B7280" />
          <Text style={s.backText}>Projects</Text>
        </TouchableOpacity>

        {/* Hero card */}
        <View style={s.heroCard}>
          <View style={s.heroTop}>
            <View style={s.statusBadge}>
              <Text style={s.statusText}>{project.status}</Text>
            </View>
          </View>
          <Text style={s.heroName}>{project.name}.</Text>

          <View style={s.heroMeta}>
            {project.deadline && (
              <View style={s.metaItem}>
                <CalendarDays size={14} color="#9CA3AF" />
                <Text style={s.metaText}>
                  {new Date(project.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </Text>
              </View>
            )}
            {project.budget > 0 && (
              <View style={s.metaItem}>
                <DollarSign size={14} color="#9CA3AF" />
                <Text style={s.metaText}>{fmt(project.budget)}</Text>
              </View>
            )}
          </View>

          {project.description ? (
            <Text style={s.heroDesc}>"{project.description}"</Text>
          ) : null}

          {/* Progress */}
          <View style={s.progressSection}>
            <View style={s.progressHeader}>
              <Text style={s.progressLabel}>Progress</Text>
              <Text style={s.progressPct}>{progress}%</Text>
            </View>
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>

        {/* Tasks — read-only */}
        <View style={s.tasksCard}>
          <View style={s.tasksHeader}>
            <View>
              <Text style={s.tasksTitle}>Tasks</Text>
              <Text style={s.tasksSub}>{doneCnt}/{tasks.length} complete</Text>
            </View>
          </View>

          {tasks.length === 0 ? (
            <View style={s.emptyTasks}>
              <CheckCircle2 size={32} color="#e6e8ea" />
              <Text style={s.emptyTasksText}>No tasks yet.</Text>
            </View>
          ) : (
            tasks.map((task) => {
              const cfg  = TASK_CFG[task.status] ?? TASK_CFG["Pending"];
              const Icon = cfg.icon;
              const isOverdue = task.status === "Overdue";
              return (
                <View key={task._id} style={s.taskRow}>
                  <Icon size={20} color={cfg.color} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.taskText, task.status === "Done" && s.taskDone]}>
                      {task.text}
                    </Text>
                    {task.due && (
                      <Text style={[s.taskDue, isOverdue && { color: "#EF4444" }]}>
                        {isOverdue ? "Overdue: " : "Due: "}
                        {new Date(task.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </Text>
                    )}
                  </View>
                  <View style={[s.taskBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[s.taskBadgeText, { color: cfg.text }]}>{task.status}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Details */}
        <View style={s.detailsCard}>
          <Text style={s.detailsTitle}>Project Details</Text>
          {[
            { label: "Status",   value: project.status },
            { label: "Budget",   value: project.budget > 0 ? fmt(project.budget) : "—" },
            { label: "Deadline", value: project.deadline ? new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
            { label: "Tasks",    value: `${tasks.length} total` },
          ].map(({ label, value }) => (
            <View key={label} style={s.detailRow}>
              <Text style={s.detailLabel}>{label}</Text>
              <Text style={s.detailValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Task summary */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Task Summary</Text>
          {[
            { label: "Done",        value: doneCnt, color: "#ADFF2F" },
            { label: "In Progress", value: ipCnt,   color: "#FFF" },
            { label: "Pending",     value: pendCnt, color: "rgba(255,255,255,0.6)" },
            { label: "Overdue",     value: ovCnt,   color: "#FCA5A5" },
          ].map(({ label, value, color }) => (
            <View key={label} style={s.summaryRow}>
              <Text style={s.summaryLabel}>{label}</Text>
              <Text style={[s.summaryValue, { color }]}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  container: { padding: 20, paddingBottom: 100 },

  errorText: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
  backBtn:   { marginTop: 8, backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backBtnText: { color: "#FFF", fontWeight: "900", fontSize: 11 },

  backRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 16, marginTop: 8 },
  backText: { fontSize: 13, fontWeight: "700", color: "#6B7280" },

  heroCard: { backgroundColor: "#FFF", borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)" },
  heroTop:  { flexDirection: "row", justifyContent: "flex-end", marginBottom: 12 },
  statusBadge: { backgroundColor: "#ADFF2F", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusText:  { fontSize: 10, fontWeight: "900", color: C.primary },
  heroName:    { fontSize: 26, fontWeight: "900", color: C.primary, letterSpacing: -1, marginBottom: 12 },
  heroMeta:    { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  metaItem:    { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText:    { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  heroDesc:    { fontSize: 14, color: "#6B7280", fontStyle: "italic", lineHeight: 20, marginBottom: 16 },

  progressSection: { marginTop: 4 },
  progressHeader:  { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel:   { fontSize: 10, fontWeight: "700", color: "#9CA3AF" },
  progressPct:     { fontSize: 10, fontWeight: "900", color: C.primary },
  progressBg:      { height: 6, backgroundColor: "rgba(196,198,207,0.4)", borderRadius: 3, overflow: "hidden" },
  progressFill:    { height: "100%", backgroundColor: "#426900", borderRadius: 3 },

  tasksCard:   { backgroundColor: "#FFF", borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)" },
  tasksHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  tasksTitle:  { fontSize: 18, fontWeight: "900", color: C.primary },
  tasksSub:    { fontSize: 10, fontWeight: "700", color: "#9CA3AF", marginTop: 2 },

  emptyTasks:     { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyTasksText: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },

  taskRow:    { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f8f9fa", gap: 10 },
  taskText:   { fontSize: 14, fontWeight: "700", color: C.primary },
  taskDone:   { textDecorationLine: "line-through", opacity: 0.4 },
  taskDue:    { fontSize: 10, fontWeight: "700", color: "#9CA3AF", marginTop: 3 },
  taskBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  taskBadgeText: { fontSize: 9, fontWeight: "900" },

  detailsCard:  { backgroundColor: "#FFF", borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "rgba(196,198,207,0.4)" },
  detailsTitle: { fontSize: 11, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1, marginBottom: 12 },
  detailRow:    { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f8f9fa" },
  detailLabel:  { fontSize: 11, fontWeight: "900", color: "#9CA3AF", letterSpacing: 0.5 },
  detailValue:  { fontSize: 12, fontWeight: "700", color: C.primary },

  summaryCard:  { backgroundColor: C.primary, borderRadius: 24, padding: 20, marginBottom: 16 },
  summaryTitle: { fontSize: 11, fontWeight: "900", color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginBottom: 12 },
  summaryRow:   { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  summaryLabel: { fontSize: 11, fontWeight: "900", color: "rgba(255,255,255,0.5)", letterSpacing: 0.5 },
  summaryValue: { fontSize: 20, fontWeight: "900" },
});
