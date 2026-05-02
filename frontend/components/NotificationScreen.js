import { C } from "../utils/theme";
import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  Bell, Receipt, GitMerge, CalendarDays,
  ShieldCheck, Info, CheckCheck, Trash2, ArrowRight,
} from "lucide-react-native";
import {
  getNotifications, markNotifRead, markAllNotifsRead, deleteNotification,
} from "../api/apiCalls";
import ScreenHeader from "./ScreenHeader";

const FILTERS = ["all", "unread", "invoice", "project", "appointment"];

const TYPE_CFG = {
  invoice:     { icon: Receipt,      bg: "#F0FDF4",   color: "#426900",  accent: "#ADFF2F" },
  project:     { icon: GitMerge,     bg: "#EFF6FF",   color: "#2563EB",  accent: "#3B82F6" },
  appointment: { icon: CalendarDays, bg: "#F5F3FF",   color: "#7C3AED",  accent: "#8B5CF6" },
  security:    { icon: ShieldCheck,  bg: "#FEF2F2",   color: "#EF4444",  accent: "#EF4444" },
  system:      { icon: Info,         bg: C.surfaceLow, color: C.outline, accent: C.outline  },
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
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter]       = useState("all");
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetch = useCallback(async (f, p, append = false) => {
    try {
      const res = await getNotifications({ filter: f, page: p, limit: 20 });
      if (res?.success) {
        const notifs = res.notifications ?? [];
        setNotifications(prev => append ? [...prev, ...notifs] : notifs);
        setTotal(res.meta?.total ?? 0);
        setUnreadCount(res.meta?.unreadCount ?? 0);
      }
    } catch (e) {
      console.error("Notifications:", e?.response?.data ?? e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setPage(1);
      fetch(filter, 1, false);
    }, [filter])
  );

  const handleFilterChange = (f) => {
    if (f === filter) return;
    setFilter(f);
    setPage(1);
    setLoading(true);
    setNotifications([]);
    fetch(f, 1, false);
  };

  const handleMarkOne = async (id) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try { await markNotifRead(id); }
    catch { fetch(filter, 1, false); }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotifsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      Alert.alert("Error", "Could not mark all as read.");
    } finally { setMarkingAll(false); }
  };

  const handleDelete = async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    setTotal(prev => prev - 1);
    try { await deleteNotification(id); }
    catch { fetch(filter, 1, false); }
  };

  // Navigate to the related screen — matches web href logic
  const handleViewDetails = (n) => {
    if (!n.read) handleMarkOne(n._id);
    const isFreelancer = true; // both roles use same notification screen
    if (n.refModel === "Invoice") {
      navigation.navigate("Invoices");
    } else if (n.refModel === "Project") {
      navigation.navigate("Projects");
    } else if (n.refModel === "Appointment") {
      navigation.navigate("Calendar");
    }
  };

  const handleLoadMore = () => {
    if (notifications.length >= total || loadingMore || loading) return;
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    fetch(filter, next, true);
  };

  const renderItem = ({ item: n }) => {
    const cfg  = TYPE_CFG[n.type] ?? TYPE_CFG.system;
    const Icon = cfg.icon;
    const hasRef = n.refModel && n.refId;
    const isSecurityPulse = n.type === "security" && !n.read;

    return (
      <View style={[s.card, n.read ? s.cardRead : s.cardUnread]}>

        {/* Icon */}
        <View style={[s.iconBox, { backgroundColor: cfg.bg }, n.read && s.iconBoxRead]}>
          <Icon size={20} color={n.read ? C.outline : cfg.color} />
        </View>

        {/* Content */}
        <View style={s.content}>
          {/* Header row */}
          <View style={s.cardHeader}>
            <Text
              style={[s.notifTitle, n.read ? s.notifTitleRead : s.notifTitleUnread]}
              numberOfLines={1}
            >
              {n.title}
            </Text>
            <Text style={s.timeText}>{timeAgo(n.createdAt)}</Text>
          </View>

          {/* Message */}
          <Text style={[s.notifMessage, n.read && s.notifMessageRead]}>
            {n.message}
          </Text>

          {/* Actions row */}
          <View style={s.actionsRow}>
            {hasRef && (
              <TouchableOpacity
                style={s.viewDetailsBtn}
                onPress={() => handleViewDetails(n)}
                activeOpacity={0.7}
              >
                <Text style={[s.viewDetailsText, { color: cfg.color }]}>
                  VIEW DETAILS
                </Text>
                <ArrowRight size={12} color={cfg.color} />
              </TouchableOpacity>
            )}
            {!n.read && (
              <TouchableOpacity onPress={() => handleMarkOne(n._id)}>
                <Text style={s.markReadText}>Mark as read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Unread accent dot — pulses for security */}
        {!n.read && (
          <View
            style={[
              s.accentDot,
              { backgroundColor: cfg.accent },
            ]}
          />
        )}

        {/* Delete button */}
        <TouchableOpacity
          style={s.deleteBtn}
          onPress={() => handleDelete(n._id)}
          activeOpacity={0.7}
        >
          <Trash2 size={14} color={C.error} />
        </TouchableOpacity>
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
            <TouchableOpacity
              style={s.markAllBtn}
              onPress={handleMarkAll}
              disabled={markingAll}
              activeOpacity={0.8}
            >
              {markingAll
                ? <ActivityIndicator size="small" color={C.primary} />
                : <CheckCheck size={18} color={C.primary} />}
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Unread count + Mark All row — matches web header */}
      {unreadCount > 0 && (
        <View style={s.unreadRow}>
          <View style={s.unreadBadge}>
            <Text style={s.unreadBadgeText}>{unreadCount} unread</Text>
          </View>
          <TouchableOpacity
            style={s.markAllRowBtn}
            onPress={handleMarkAll}
            disabled={markingAll}
            activeOpacity={0.8}
          >
            {markingAll
              ? <ActivityIndicator size="small" color={C.primary} />
              : <CheckCheck size={15} color={C.primary} />}
            <Text style={s.markAllRowText}>Mark All as Read</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter tabs */}
      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterTab, filter === f && s.filterTabActive]}
            onPress={() => handleFilterChange(f)}
            activeOpacity={0.7}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.loadingText}>LOADING...</Text>
        </View>
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
              onRefresh={() => {
                setRefreshing(true);
                setPage(1);
                fetch(filter, 1, false);
              }}
              tintColor={C.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore
              ? <ActivityIndicator color={C.primary} style={{ marginVertical: 16 }} />
              : notifications.length < total
              ? (
                <TouchableOpacity style={s.loadMoreBtn} onPress={handleLoadMore}>
                  <Text style={s.loadMoreText}>LOAD OLDER</Text>
                </TouchableOpacity>
              )
              : null
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={s.emptyIcon}>
                <Bell size={36} color={C.outline} />
              </View>
              <Text style={s.emptyTitle}>All Clear</Text>
              <Text style={s.emptyText}>Your inbox is quiet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.background },
  center:      { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  loadingText: { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: C.primary },
  list:        { paddingHorizontal: 16, paddingBottom: 100 },

  // Unread summary row
  unreadRow:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.outlineVar },
  unreadBadge:     { backgroundColor: C.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  unreadBadgeText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  markAllRowBtn:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: C.surfaceLow, borderRadius: 12, borderWidth: 1, borderColor: C.outlineVar },
  markAllRowText:  { fontSize: 10, fontWeight: "900", color: C.primary, letterSpacing: 1 },

  // Mark all in header
  markAllBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.surfaceLow, justifyContent: "center", alignItems: "center" },

  // Filter tabs
  filterRow:        { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 8, gap: 6, borderBottomWidth: 1, borderBottomColor: C.outlineVar, backgroundColor: C.background },
  filterTab:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.surfaceLow },
  filterTabActive:  { backgroundColor: C.primary },
  filterText:       { fontSize: 10, fontWeight: "900", color: C.outline },
  filterTextActive: { color: "#fff" },

  // Notification card
  card: {
    flexDirection: "row", padding: 16, borderRadius: 20,
    marginBottom: 10, borderWidth: 1, gap: 12,
    position: "relative",
  },
  cardUnread: { backgroundColor: C.card, borderColor: C.outlineVar },
  cardRead:   { backgroundColor: C.surfaceLow, borderColor: "transparent", opacity: 0.7 },

  iconBox:     { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  iconBoxRead: { opacity: 0.5 },

  content:    { flex: 1, minWidth: 0 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5, gap: 8 },

  notifTitle:      { fontSize: 14, fontWeight: "800", flex: 1 },
  notifTitleUnread:{ color: C.onSurface },
  notifTitleRead:  { color: C.onSurfaceVar },

  timeText:    { fontSize: 10, fontWeight: "700", color: C.outline, flexShrink: 0 },

  notifMessage:     { fontSize: 13, lineHeight: 19, marginBottom: 10, color: C.onSurfaceVar },
  notifMessageRead: { color: C.outline },

  actionsRow:     { flexDirection: "row", alignItems: "center", gap: 16, flexWrap: "wrap" },
  viewDetailsBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewDetailsText:{ fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  markReadText:   { fontSize: 10, fontWeight: "900", color: C.outline, letterSpacing: 1 },

  // Unread accent dot (top-right of card)
  accentDot: { position: "absolute", top: 16, right: 44, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: C.card },

  // Delete button
  deleteBtn: { position: "absolute", top: 14, right: 12, padding: 4 },

  // Load more
  loadMoreBtn:  { alignItems: "center", paddingVertical: 16, marginTop: 8 },
  loadMoreText: { fontSize: 10, fontWeight: "900", color: C.onSurfaceVar, letterSpacing: 2, borderWidth: 1, borderColor: C.outlineVar, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },

  // Empty state
  empty:      { alignItems: "center", marginTop: 80, gap: 12 },
  emptyIcon:  { width: 72, height: 72, borderRadius: 24, backgroundColor: C.surfaceLow, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "900", color: C.primary },
  emptyText:  { fontSize: 13, color: C.outline, fontWeight: "600" },
});
