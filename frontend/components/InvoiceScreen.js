import { C } from "../utils/theme";
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  MessageSquare,
  Pencil,
} from "lucide-react-native";

import {
  getInvoices,
  getClientInvoices,
  createInvoice,
  updateInvoiceStatus,
  getProjects,
} from "../api/apiCalls";

import { useAuth } from "../components/context/AuthContext";
import ScreenHeader from "./ScreenHeader";
import CreateInvoiceModal from "./modals/CreateInvoiceModal";
import InvoiceDetailModal from "./modals/InvoiceDetailModal";
import ClientInvoiceDetailModal from "./modals/ClientInvoiceDetailModal";
import EditInvoiceModal from "./modals/EditInvoiceModal";

const TABS = ["All", "Unpaid", "Paid", "Review"];

const STATUS_CLASS = {
  Paid: { bg: "#F0FDF4", text: "#16A34A" },
  Unpaid: { bg: "#FFFBEB", text: "#D97706" },
  Review: { bg: "#FFF7ED", text: "#F97316" },
  Cancelled: { bg: "#f8f9fa", text: "#9CA3AF" },
};

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function InvoiceScreen() {
  const { user } = useAuth();
  const isClient = user?.role === "client";

  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({});
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState("All");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [createVisible, setCreateVisible] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState(null);

  // ✅ missing states (added)
  const [editInvoice, setEditInvoice] = useState(null);
  const [reviewInvoice, setReviewInvoice] = useState(null);

  const load = async () => {
    try {
      if (isClient) {
        const invRes = await getClientInvoices();
        if (invRes?.success) {
          setInvoices(invRes.invoices ?? []);
          setSummary(invRes.summary ?? {});
        }
      } else {
        const params = tab !== "All" ? { status: tab } : undefined;
        const [invRes, projRes] = await Promise.all([
          getInvoices(params),
          getProjects(),
        ]);

        if (invRes?.success) {
          setInvoices(invRes.invoices ?? []);
          setSummary(invRes.summary ?? {});
        }

        if (projRes?.success) {
          setProjects(projRes.projects ?? []);
        }
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
      if (!createVisible && !detailInvoice) {
        load();
      }
    }, [tab, createVisible, detailInvoice]),
  );

  useEffect(() => {
    console.log("Create Modal Visible:", createVisible);
  }, [createVisible]);

  const handleMarkPaid = (inv) => {
    Alert.alert("Mark as Paid", `Mark invoice ${inv.invoiceNumber} as paid?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Paid",
        onPress: async () => {
          try {
            await updateInvoiceStatus(inv._id, "Paid", "Manual");
            load();
          } catch (e) {
            Alert.alert("Error", "Could not update invoice.");
          }
        },
      },
    ]);
  };

  const handleCreate = async (data) => {
    try {
      const res = await createInvoice(data);
      if (res?.success) {
        setCreateVisible(false);
        load();
      }
    } catch (e) {
      Alert.alert("Error", "Could not create invoice.");
    }
  };

  // ✅ unified stats (fixed merge)
  const stats = [
    {
      label: "OUTSTANDING",
      value: fmt(
        isClient ? (summary?.unpaid ?? 0) : (summary?.Unpaid?.total ?? 0),
      ),
      icon: TrendingUp,
      color: "#EF4444",
    },
    {
      label: "COLLECTED",
      value: fmt(isClient ? (summary?.paid ?? 0) : (summary?.Paid?.total ?? 0)),
      icon: CheckCircle,
      color: "#16A34A",
    },
    {
      label: "UNDER REVIEW",
      value: fmt(
        isClient ? (summary?.review ?? 0) : (summary?.Review?.total ?? 0),
      ),
      icon: Clock,
      color: "#F97316",
    },
  ];

  const renderItem = ({ item }) => {
    const cfg = STATUS_CLASS[item.status] ?? STATUS_CLASS.Cancelled;

    // ✅ removed duplicate declaration
    const isPastDue =
      item.status === "Unpaid" && new Date(item.dueDate) < new Date();

    const clientLabel = isClient
      ? (item.freelancerId?.businessName ??
        item.freelancerId?.name ??
        "Your Freelancer")
      : (item.clientId?.name ?? "Private Client");

    const statusLabel =
      item.status === "Review" ? "UNDER REVIEW" : item.status?.toUpperCase();

    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => setDetailInvoice(item)}
        activeOpacity={0.7}
      >
        <View style={s.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.invNum}>{item.invoiceNumber}</Text>
            <Text style={s.invClient}>{clientLabel}</Text>

            {item.projectId?.name && (
              <Text style={s.invProject}>{item.projectId.name}</Text>
            )}
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.invAmount}>{fmt(item.amount)}</Text>

            <View style={[s.badge, { backgroundColor: cfg.bg }]}>
              <Text style={[s.badgeText, { color: cfg.text }]}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.cardBottom}>
          <Text style={s.dateText}>
            Issued: {new Date(item.issueDate).toLocaleDateString()}
          </Text>

          <Text style={[s.dateText, isPastDue && { color: "#EF4444" }]}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={s.cardActions}>
          {!isClient && item.status === "Unpaid" && (
            <TouchableOpacity
              style={s.markPaidBtn}
              onPress={() => handleMarkPaid(item)}
            >
              <Text style={s.markPaidText}>MARK PAID</Text>
            </TouchableOpacity>
          )}

          {!isClient &&
            (item.status === "Unpaid" || item.status === "Review") && (
              <TouchableOpacity
                style={s.editCardBtn}
                onPress={() => setEditInvoice(item)}
              >
                <Pencil size={14} color={C.primary} />
                <Text style={s.editCardBtnText}>EDIT</Text>
              </TouchableOpacity>
            )}

          {isClient && item.status === "Unpaid" && (
            <TouchableOpacity
              style={s.flagBtn}
              onPress={() => setReviewInvoice(item)}
            >
              <MessageSquare size={14} color="#F97316" />
              <Text style={s.flagBtnText}>FLAG FOR REVIEW</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={s.viewBtn}
            onPress={() => setDetailInvoice(item)}
          >
            <Eye size={16} color="#000613" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar style="dark" />

      {/* ✅ kept only ONE header */}
      <ScreenHeader
        title="Invoices."
        tagline={isClient ? "CLIENT PORTAL" : "FINANCIAL LEDGER"}
        onPressAdd={isClient ? undefined : () => setCreateVisible(true)}
      />

      {/* Stats */}
      <View style={s.statsRow}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <View key={label} style={s.statBox}>
            <Icon size={14} color={color} />
            <Text style={[s.statValue, { color }]}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
          </View>
        ))}

        <View
          style={[
            s.statBox,
            {
              backgroundColor: "#000613",
              borderRadius: 12,
              padding: 8,
            },
          ]}
        >
          <Text style={[s.statValue, { color: "#FFF" }]}>
            {invoices.length}
          </Text>
          <Text style={[s.statLabel, { color: "rgba(255,255,255,0.5)" }]}>
            TOTAL
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tabBtn, tab === t && s.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color="#000613" />
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
        />
      )}

      {/* FAB */}
      {!isClient && (
        <TouchableOpacity style={s.fab} onPress={() => setCreateVisible(true)}>
          <Plus size={26} color="#FFF" />
        </TouchableOpacity>
      )}

      <CreateInvoiceModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSave={handleCreate}
        projects={projects}
      />

      {isClient ? (
        <ClientInvoiceDetailModal
          visible={!!detailInvoice}
          invoice={detailInvoice}
          onClose={() => setDetailInvoice(null)}
          onRefresh={load}
        />
      ) : (
        <InvoiceDetailModal
          visible={!!detailInvoice}
          invoice={detailInvoice}
          onClose={() => setDetailInvoice(null)}
          onMarkPaid={() => {
            handleMarkPaid(detailInvoice);
            setDetailInvoice(null);
          }}
          onRefresh={load}
        />
      )}

      <EditInvoiceModal
        visible={!!editInvoice}
        invoice={editInvoice}
        onClose={() => setEditInvoice(null)}
        onSaved={() => {
          setEditInvoice(null);
          load();
        }}
      />

      <ClientInvoiceDetailModal
        visible={!!reviewInvoice}
        invoice={reviewInvoice}
        onClose={() => setReviewInvoice(null)}
        onRefresh={load}
        openReviewForm
      />
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(196,198,207,0.4)",
    gap: 4,
  },
  statBox: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontSize: 12, fontWeight: "900", color: "#000613" },
  statLabel: {
    fontSize: 7,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },

  tabRow: {
    flexDirection: "row",
    backgroundColor: "#f3f4f5",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: "#FFF" },
  tabText: { fontSize: 10, fontWeight: "900", color: "#9CA3AF" },
  tabTextActive: { color: "#000613" },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
  },
  cardTop: { flexDirection: "row", marginBottom: 10 },
  invNum: { fontSize: 12, fontWeight: "900", color: "#9CA3AF" },
  invClient: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000613",
    marginTop: 2,
  },
  invProject: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    fontStyle: "italic",
  },
  invAmount: { fontSize: 18, fontWeight: "900", color: "#000613" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  badgeText: { fontSize: 9, fontWeight: "900" },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f8f9fa",
  },
  dateText: { fontSize: 11, fontWeight: "600", color: "#9CA3AF" },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
  },
  markPaidBtn: {
    borderWidth: 1,
    borderColor: "#426900",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  markPaidText: { fontSize: 10, fontWeight: "900", color: "#426900" },
  viewBtn: {
    width: 34,
    height: 34,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
  },
  cardTop: { flexDirection: "row", marginBottom: 10 },
  invNum: { fontSize: 12, fontWeight: "900", color: "#9CA3AF" },
  invClient: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000613",
    marginTop: 2,
  },
  invProject: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    fontStyle: "italic",
  },
  invAmount: { fontSize: 18, fontWeight: "900", color: "#000613" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  badgeText: { fontSize: 9, fontWeight: "900" },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f8f9fa",
  },
  dateText: { fontSize: 11, fontWeight: "600", color: "#9CA3AF" },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
  },
  markPaidBtn: {
    borderWidth: 1,
    borderColor: "#426900",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  markPaidText: { fontSize: 10, fontWeight: "900", color: "#426900" },
  viewBtn: {
    width: 34,
    height: 34,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
  },
  editCardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: C.outlineVar,
    backgroundColor: C.surfaceLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editCardBtnText: { fontSize: 9, fontWeight: "900", color: C.primary },
  flagBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#FED7AA",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  flagBtnText: { fontSize: 9, fontWeight: "900", color: "#F97316" },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#000613",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  empty: { alignItems: "center", marginTop: 60, gap: 8 },
  emptyText: { color: "#9CA3AF", fontWeight: "600" },
});
