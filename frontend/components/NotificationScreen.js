import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  Bell, Receipt, GitMerge, CalendarDays, ShieldCheck,
  Info, CheckCheck, Trash2, ArrowRight,
} from "lucide-react-native";
import { getNotifications, markNotifRead, markAllNotifsRead, deleteNotification } from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";

const FILTERS = ["all", "unread", "invoice", "project", "appointment"];

const TYPE_CFG = {
  invoice:     { icon: Receipt,      bg: "#F0FDF4", color: "#16A34A" },
  project:     { icon: GitMerge,     bg: "#EFF6FF", color: "#2563EB" },
  appointment: { icon: CalendarDays, bg: "#F5F3FF", color: "#7C3AED" },
  security:    { icon: ShieldCheck,  bg: "#FEF2F2", color: "#EF4444" },
  system:      { icon: Info,         bg: "#F9FAFB", color: "#6B7280" },
};

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter]   = useState("all");
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = async (f = filter, p = 1, append = false) => {
    try {
      const res = await getNotifications({ filter: f, page: p, limit: 20 });
      if (res?.success) {
        const notifs = res.notifications ?? [];
        setNotifications(prev => append ? [...prev, ...notifs] : notifs);
        setTotal(res.meta?.total ?? 0);
        setUnreadCount(res.meta?.unreadCount ?? 0);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); setLoadingMore(false); }
  };

  useFocusEffect(useCallback(() => { load(filter, 1, false); }, [filter]));

  const handleFilterChange = (f) => {
    setFilter(f);
    setPage(1);
    setLoading(true);
    load(f, 1, false);
  };

  const handleMarkOne = async (id) => {
    try { await markNotifRead(id); load(filter, 1, false); }
    catch (e) { console.error(e); }
  };

  const handleMarkAll = async () => {
    try { await markAllNotifsRead(); load(filter, 1, false); }
    catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try { await deleteNotification(id); load(filter, 1, false); }
    catch (e) { console.error(e); }
  };

  const handleLoadMore = () => {
    if (notifications.length >= total || loadingMore) return;
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    load(filter, next, true);
  };

  const renderItem = ({ item }) => {
    const cfg  = TYPE_CFG[item.type] ?? TYPE_CFG.system;
    const Icon = cfg.icon;
    return (
      <View style={[s.card, !item.read && s.cardUnread]}>
        <View style={[s.iconBox, { backgroundColor: cfg.bg }]}>
          <Icon size={18} color={cfg.color} />
        </View>
        <View style={s.content}>
          <View style={s.notifHeader}>
            <Text style={[s.notifTitle, !item.read && s.notifTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={s.timeText}>{timeAgo(item.createdAt)}</Text>
          </View>
          <Text style={s.notifMessage} numberOfLines={3}>{item.message}</Text>
          <View style={s.notifActions}>
            {!item.read && (
              <TouchableOpacity onPress={() => handleMarkOne(item._id)}>
                <Text style={s.markReadText}>Mark as read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={s.deleteBtn}>
              <Trash2 size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
        {!item.read && <View style={[s.unreadDot, { backgroundColor: cfg.color }]} />}
      </View>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      <ScreenHeader
        title="Notifications."
        tagline="UPDATES & ALERTS"
        rightElement={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAll} style={s.markAllBtn}>
              <CheckCheck size={18} color="#1A1C19" />
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Filter tabs */}
      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterTab, filter === f && s.filterTabActive]}
            onPress={() => handleFilterChange(f)}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color="#1A1C19" /></View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={i => i._id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(filter, 1, false); }}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color="#1A1C19" style={{ marginVertical: 16 }} /> : null
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Bell size={48} color="#E2E3DD" />
              <Text style={s.emptyText}>Your inbox is quiet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#FBFDF8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list:   { paddingHorizontal: 16, paddingBottom: 100 },

  markAllBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#F3F4EF", justifyContent: "center", alignItems: "center" },

  filterRow: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 8, gap: 6, borderBottomWidth: 1, borderBottomColor: "#F0F1EB" },
  filterTab:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#F3F4EF" },
  filterTabActive: { backgroundColor: "#1A1C19" },
  filterText:      { fontSize: 10, fontWeight: "900", color: "#9CA3AF" },
  filterTextActive:{ color: "#FFF" },

  card: {
    flexDirection: "row", padding: 14, borderRadius: 18,
    backgroundColor: "#FFF", marginBottom: 10,
    borderWidth: 1, borderColor: "#F0F1EB", gap: 12,
  },
  cardUnread: { backgroundColor: "#F3FBF4", borderColor: "#D7E8CD" },
  iconBox:    { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  content:    { flex: 1 },
  notifHeader:{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  notifTitle: { fontSize: 14, fontWeight: "700", color: "#6B7280", flex: 1, marginRight: 8 },
  notifTitleUnread: { color: "#1A1C19", fontWeight: "800" },
  timeText:   { fontSize: 10, fontWeight: "700", color: "#9CA3AF" },
  notifMessage: { fontSize: 13, color: "#6B7280", lineHeight: 18, marginBottom: 8 },
  notifActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  markReadText: { fontSize: 11, fontWeight: "900", color: "#1A1C19" },
  deleteBtn:    { padding: 4 },
  unreadDot:    { width: 8, height: 8, borderRadius: 4, position: "absolute", top: 14, right: 14 },

  empty:     { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { color: "#9CA3AF", fontWeight: "600" },
});
