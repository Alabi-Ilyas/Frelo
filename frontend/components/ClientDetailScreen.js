import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, Mail, Phone, TrendingUp, Receipt, CheckCircle2 } from "lucide-react-native";
import { getClientDetails } from "../api/apiCalls";

const TABS = ["Overview", "Projects", "Invoices"];

const STATUS_COLORS = {
  "In Progress": { bg: "#EFF6FF", text: "#2563EB" },
  "Pending":     { bg: "#FFFBEB", text: "#D97706" },
  "Done":        { bg: "#F0FDF4", text: "#16A34A" },
  "Overdue":     { bg: "#FEF2F2", text: "#DC2626" },
  "Cancelled":   { bg: "#F9FAFB", text: "#6B7280" },
};

const INV_COLORS = {
  "Paid":      "#16A34A",
  "Unpaid":    "#D97706",
  "Review":    "#F97316",
  "Cancelled": "#9CA3AF",
};

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function ClientDetailScreen({ route, navigation }) {
  const { clientId } = route.params;
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState("Overview");

  const load = async () => {
    try {
      const res = await getClientDetails(clientId);
      if (res?.success) setData(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, [clientId]));

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A1C19" /></View>;
  if (!data?.client) return (
    <View style={s.center}>
      <Text style={s.errorText}>Client not found.</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
        <Text style={s.backBtnText}>GO BACK</Text>
      </TouchableOpacity>
    </View>
  );

  const { client, projects = [], invoices = [] } = data;
  const initials     = client.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const unpaidTotal  = invoices.filter(i => i.status === "Unpaid").reduce((s, i) => s + i.amount, 0);

  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity style={s.backRow} onPress={() => navigation.goBack()}>
          <ChevronLeft size={18} color="#6B7280" />
          <Text style={s.backText}>All Clients</Text>
        </TouchableOpacity>

        {/* Profile header */}
        <View style={s.profileCard}>
          <View style={[s.avatar, { backgroundColor: client.color ?? "#7C6EF8" }]}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.tagline}>CLIENT PROFILE</Text>
          <Text style={s.clientName}>{client.name}.</Text>
          <TouchableOpacity style={s.emailRow} onPress={() => Linking.openURL(`mailto:${client.email}`)}>
            <Mail size={14} color="#1A1C19" />
            <Text style={s.contactText}>{client.email}</Text>
          </TouchableOpacity>
          {client.phone && (
            <TouchableOpacity style={s.emailRow} onPress={() => Linking.openURL(`tel:${client.phone}`)}>
              <Phone size={14} color="#1A1C19" />
              <Text style={s.contactText}>{client.phone}</Text>
            </TouchableOpacity>
          )}
          {client.tags?.length > 0 && (
            <View style={s.tagsRow}>
              {client.tags.map(tag => (
                <View key={tag} style={s.tag}><Text style={s.tagText}>{tag}</Text></View>
              ))}
            </View>
          )}

          {/* Stats */}
          <View style={s.statsRow}>
            {[
              { label: "Projects", value: projects.length },
              { label: "Revenue",  value: fmt(totalRevenue) },
              { label: "Unpaid",   value: fmt(unpaidTotal) },
              { label: "Portal",   value: client.hasPortalAccess ? "Active" : "Inactive" },
            ].map(({ label, value }) => (
              <View key={label} style={s.statBox}>
                <Text style={s.statValue}>{value}</Text>
                <Text style={s.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          {TABS.map(t => (
            <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabBtnActive]} onPress={() => setTab(t)}>
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview */}
        {tab === "Overview" && (
          <View>
            <View style={s.card}>
              <Text style={s.sectionLabel}>NOTES</Text>
              <Text style={s.notesText}>{client.notes || "No notes added yet."}</Text>
              <View style={s.overviewGrid}>
                <View style={s.overviewItem}>
                  <Text style={s.overviewLabel}>Member Since</Text>
                  <Text style={s.overviewValue}>
                    {new Date(client.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </Text>
                </View>
                <View style={s.overviewItem}>
                  <Text style={s.overviewLabel}>Total Revenue</Text>
                  <Text style={s.overviewValue}>{fmt(totalRevenue)}</Text>
                </View>
              </View>
            </View>
            <View style={[s.card, { backgroundColor: "#1A1C19" }]}>
              <Text style={s.quickStatsTitle}>Quick Stats</Text>
              {[
                { label: "Active Projects", value: projects.filter(p => p.status === "In Progress").length },
                { label: "Completed",       value: projects.filter(p => p.status === "Done").length },
                { label: "Invoices",        value: invoices.length },
              ].map(({ label, value }) => (
                <View key={label} style={s.quickRow}>
                  <Text style={s.quickLabel}>{label}</Text>
                  <Text style={s.quickValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {tab === "Projects" && (
          <View>
            {projects.length === 0 ? (
              <View style={s.empty}><TrendingUp size={40} color="#E2E3DD" /><Text style={s.emptyText}>No projects yet.</Text></View>
            ) : projects.map((proj) => {
              const cfg = STATUS_COLORS[proj.status] ?? STATUS_COLORS["Pending"];
              return (
                <TouchableOpacity
                  key={proj._id}
                  style={s.projCard}
                  onPress={() => navigation.navigate("ProjectDetail", { projectId: proj._id })}
                >
                  <View style={s.projTop}>
                    <View style={[s.badge, { backgroundColor: cfg.bg }]}>
                      <Text style={[s.badgeText, { color: cfg.text }]}>{proj.status}</Text>
                    </View>
                    <TrendingUp size={14} color="#D1D5DB" />
                  </View>
                  <Text style={s.projName}>{proj.name}</Text>
                  {proj.budget > 0 && <Text style={s.projBudget}>{fmt(proj.budget)}</Text>}
                  <View style={s.progressBg}>
                    <View style={[s.progressFill, { width: `${proj.progress ?? 0}%` }]} />
                  </View>
                  <Text style={s.progressPct}>{proj.progress ?? 0}%</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Invoices */}
        {tab === "Invoices" && (
          <View>
            {invoices.length === 0 ? (
              <View style={s.empty}><Receipt size={40} color="#E2E3DD" /><Text style={s.emptyText}>No invoices yet.</Text></View>
            ) : (
              <View style={s.card}>
                {invoices.map((inv) => (
                  <View key={inv._id} style={s.invRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.invNum}>{inv.invoiceNumber}</Text>
                      <Text style={s.invProject}>{inv.projectId?.name ?? "—"}</Text>
                      <Text style={s.invDate}>
                        {new Date(inv.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={s.invAmount}>{fmt(inv.amount)}</Text>
                      <Text style={[s.invStatus, { color: INV_COLORS[inv.status] ?? "#6B7280" }]}>
                        {inv.status?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: "#FBFDF8" },
  center:  { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  container: { padding: 20, paddingBottom: 100 },
  errorText: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
  backBtn:   { backgroundColor: "#1A1C19", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backBtnText: { color: "#FFF", fontWeight: "900", fontSize: 11 },

  backRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 16, marginTop: 8 },
  backText: { fontSize: 13, fontWeight: "700", color: "#6B7280" },

  profileCard: { backgroundColor: "#FFF", borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#F0F1EB", alignItems: "center" },
  avatar:      { width: 72, height: 72, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText:  { fontSize: 28, fontWeight: "900", color: "#FFF" },
  tagline:     { fontSize: 10, fontWeight: "900", color: "#9CA3AF", letterSpacing: 2, marginBottom: 4 },
  clientName:  { fontSize: 26, fontWeight: "900", color: "#1A1C19", letterSpacing: -1, marginBottom: 8 },
  emailRow:    { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  contactText: { fontSize: 13, fontWeight: "700", color: "#1A1C19" },
  tagsRow:     { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8, justifyContent: "center" },
  tag:         { backgroundColor: "#F3F4EF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText:     { fontSize: 9, fontWeight: "900", color: "#6B7280" },

  statsRow: { flexDirection: "row", width: "100%", marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F0F1EB" },
  statBox:  { flex: 1, alignItems: "center" },
  statValue:{ fontSize: 14, fontWeight: "900", color: "#1A1C19" },
  statLabel:{ fontSize: 9, fontWeight: "700", color: "#9CA3AF", marginTop: 2 },

  tabRow:       { flexDirection: "row", marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#F0F1EB" },
  tabBtn:       { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabBtnActive: { borderBottomColor: "#1A1C19" },
  tabText:      { fontSize: 12, fontWeight: "900", color: "#9CA3AF" },
  tabTextActive:{ color: "#1A1C19" },

  card:         { backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#F0F1EB" },
  sectionLabel: { fontSize: 10, fontWeight: "900", color: "#9CA3AF", letterSpacing: 1, marginBottom: 8 },
  notesText:    { fontSize: 14, color: "#6B7280", lineHeight: 20, marginBottom: 16 },
  overviewGrid: { flexDirection: "row", gap: 12 },
  overviewItem: { flex: 1, backgroundColor: "#F9FAFB", borderRadius: 12, padding: 12 },
  overviewLabel:{ fontSize: 9, fontWeight: "900", color: "#9CA3AF", marginBottom: 4 },
  overviewValue:{ fontSize: 15, fontWeight: "900", color: "#1A1C19" },

  quickStatsTitle: { fontSize: 10, fontWeight: "900", color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginBottom: 12 },
  quickRow:  { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  quickLabel:{ fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.5)" },
  quickValue:{ fontSize: 18, fontWeight: "900", color: "#FFF" },

  projCard:    { backgroundColor: "#FFF", borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#F0F1EB" },
  projTop:     { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText:   { fontSize: 9, fontWeight: "900" },
  projName:    { fontSize: 16, fontWeight: "800", color: "#1A1C19", marginBottom: 4 },
  projBudget:  { fontSize: 12, fontWeight: "700", color: "#6B7280", marginBottom: 8 },
  progressBg:  { height: 5, backgroundColor: "#F0F1EB", borderRadius: 3, overflow: "hidden" },
  progressFill:{ height: "100%", backgroundColor: "#426900", borderRadius: 3 },
  progressPct: { fontSize: 10, fontWeight: "700", color: "#9CA3AF", marginTop: 4 },

  invRow:    { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
  invNum:    { fontSize: 13, fontWeight: "900", color: "#1A1C19" },
  invProject:{ fontSize: 11, color: "#6B7280", marginTop: 2 },
  invDate:   { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
  invAmount: { fontSize: 15, fontWeight: "900", color: "#1A1C19" },
  invStatus: { fontSize: 9, fontWeight: "900", marginTop: 3 },

  empty:     { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyText: { color: "#9CA3AF", fontWeight: "600" },
});
