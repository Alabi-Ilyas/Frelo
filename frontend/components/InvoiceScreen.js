import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { getInvoices, getUnbilledTasks } from "../api/apiCalls"; 
import ScreenHeader from "./ScreenHeader";
import CreateInvoiceModal from "../components/modals/CreateInvoiceModal";
import InvoiceDetailsModal from "../components/modals/InvoiceDetailsModal"; // New details modal

export default function InvoiceScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({ Paid: { total: 0 }, Unpaid: { total: 0 } });
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [createVisible, setCreateVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, taskRes] = await Promise.all([getInvoices(), getUnbilledTasks()]);
      
      if (invRes.success) {
        setInvoices(invRes.invoices);
        setSummary(invRes.summary);
      }
      if (taskRes.success) setPendingTasks(taskRes.tasks);
    } catch (err) {
      console.error("Ledger load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailsVisible(true);
  };

  const handleGenerateInvoice = async (tasks) => {
    // Logic to save invoice to backend would go here
    setCreateVisible(false);
    loadData(); // Refresh list
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScreenHeader
        title="Ledger"
        tagline="FINANCIAL OVERVIEW"
        onPressAdd={() => setCreateVisible(true)}
      />

      <View style={styles.financeSummary}>
        <View style={styles.sumBox}>
          <Text style={styles.sumLabel}>COLLECTED</Text>
          <Text style={styles.sumAmount}>₦{summary.Paid?.total?.toLocaleString() || 0}</Text>
        </View>
        <View style={styles.vDivider} />
        <View style={styles.sumBox}>
          <Text style={styles.sumLabel}>PENDING</Text>
          <Text style={[styles.sumAmount, { color: "#F59E0B" }]}>
            ₦{summary.Unpaid?.total?.toLocaleString() || 0}
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#1A1C19" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.invoiceCard} onPress={() => handleOpenDetails(item)}>
              <View style={styles.cardMain}>
                <View>
                  <Text style={styles.invoiceNumber}>#{item.invoiceNumber}</Text>
                  <Text style={styles.clientName}>{item.clientId?.name || "Private Client"}</Text>
                </View>
                <View style={styles.amountContainer}>
                  <Text style={styles.amountText}>₦{item.amount.toLocaleString()}</Text>
                  <Text style={[styles.statusLabel, { color: item.status === "Paid" ? "#10B981" : "#F59E0B" }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* MODALS */}
      <CreateInvoiceModal
        visible={createVisible}
        pendingTasks={pendingTasks}
        onClose={() => setCreateVisible(false)}
        onSave={handleGenerateInvoice}
      />

      <InvoiceDetailsModal
        visible={detailsVisible}
        invoice={selectedInvoice}
        onClose={() => setDetailsVisible(false)}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFDF8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  financeSummary: {
    flexDirection: "row",
    backgroundColor: "#1A1C19",
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  sumBox: { flex: 1, alignItems: "center" },
  vDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 10,
  },
  sumLabel: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  sumAmount: { color: "#FFF", fontSize: 22, fontWeight: "900", marginTop: 4 },
  listContent: { paddingHorizontal: 24 },
  invoiceCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F1EB",
  },
  cardMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  invoiceNumber: { fontSize: 12, fontWeight: "900", color: "#6B7280" },
  clientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1C19",
    marginTop: 2,
  },
  amountContainer: { alignItems: "flex-end" },
  amountText: { fontSize: 18, fontWeight: "900", color: "#1A1C19" },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  statusLabel: { fontSize: 10, fontWeight: "900" },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280",
    fontWeight: "600",
  },
});
