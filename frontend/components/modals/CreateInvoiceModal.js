import { C } from "../../utils/theme";
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Briefcase,
  User,
} from "lucide-react-native";

export default function CreateInvoiceModal({
  visible,
  onClose,
  onSave,
  projects = [],
}) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [tax, setTax] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState([
    { id: Date.now().toString(), description: "", quantity: 1, rate: 0 },
  ]);

  useEffect(() => {
    if (!visible) {
      setSelectedProject(null);
      setLineItems([
        { id: Date.now().toString(), description: "", quantity: 1, rate: 0 },
      ]);
      setTax(0);
      setDueDate("");
      setNotes("");
    }
  }, [visible]);

  // Debugging: Check if projects are actually arriving
  useEffect(() => {
    if (visible) console.log("Projects available in Modal:", projects.length);
  }, [visible, projects]);

  const subtotal = lineItems.reduce(
    (acc, i) => acc + Number(i.quantity) * Number(i.rate),
    0,
  );
  const total = subtotal + subtotal * (Number(tax) / 100);

  const updateLineItem = (id, field, value) =>
    setLineItems(
      lineItems.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );

  const handleSave = () => {
    if (!selectedProject) return;
    if (!dueDate.trim()) return alert("Due date is required (YYYY-MM-DD).");
    const items = lineItems.map(i => ({
      desc: i.description,
      qty:  Number(i.quantity),
      rate: Number(i.rate),
    }));
    onSave({
      projectId: selectedProject._id,
      clientId:  selectedProject.clientId?._id,
      items,
      tax:     Number(tax),
      dueDate,
      notes,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      {/* 1. We wrap the overlay in a View instead of TouchableWithoutFeedback to prevent touch-theft */}
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.card}>
            <View style={styles.dragHandle} />

            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>BILLING ENGINE.</Text>
                <Text style={styles.headerSubtitle}>
                  LIFESTYLE INFRASTRUCTURE
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
                <X size={20} color="#000613" />
              </TouchableOpacity>
            </View>

            {/* 2. Main ScrollView must have keyboardShouldPersistTaps="handled" */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <Text style={styles.sectionTitle}>SELECT PROJECT (STEP 01)</Text>

              {/* 3. Added keyboardShouldPersistTaps to the horizontal scroller too */}
              <View style={{ minHeight: 60 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.projectScroller}
                  keyboardShouldPersistTaps="always"
                >
                  {projects.map((p) => (
                    <TouchableOpacity
                      key={p._id}
                      activeOpacity={0.7}
                      onPress={() => {
                        console.log("Selected Project:", p.name);
                        setSelectedProject(p);
                      }}
                      style={[
                        styles.projectPill,
                        selectedProject?._id === p._id && styles.activePill,
                      ]}
                    >
                      <Briefcase
                        size={14}
                        color={
                          selectedProject?._id === p._id ? "#FFF" : "#9CA3AF"
                        }
                      />
                      <Text
                        style={[
                          styles.pillText,
                          selectedProject?._id === p._id &&
                            styles.activePillText,
                        ]}
                      >
                        {p.name?.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {projects.length === 0 && (
                    <Text style={styles.noProjects}>
                      No active projects found.
                    </Text>
                  )}
                </ScrollView>
              </View>

              {selectedProject && (
                <View style={styles.clientBanner}>
                  <User size={12} color="#426900" />
                  <Text style={styles.bannerText}>
                    LINKED CLIENT:{" "}
                    <Text style={{ fontWeight: "900" }}>
                      {selectedProject.clientId?.name || "PRIVATE CLIENT"}
                    </Text>
                  </Text>
                </View>
              )}

              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                LINE ITEMS (STEP 02)
              </Text>
              {lineItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <TextInput
                    style={styles.itemInput}
                    placeholder="Service / Task Description"
                    placeholderTextColor="#9CA3AF"
                    value={item.description}
                    onChangeText={(v) =>
                      updateLineItem(item.id, "description", v)
                    }
                  />
                  <View style={styles.itemMetaRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.metaLabel}>QTY</Text>
                      <TextInput
                        style={styles.smallInput}
                        keyboardType="numeric"
                        value={String(item.quantity)}
                        onChangeText={(v) =>
                          updateLineItem(item.id, "quantity", v)
                        }
                      />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                      <Text style={styles.metaLabel}>RATE</Text>
                      <TextInput
                        style={styles.smallInput}
                        keyboardType="numeric"
                        value={String(item.rate)}
                        onChangeText={(v) => updateLineItem(item.id, "rate", v)}
                      />
                    </View>
                    <View style={{ flex: 1.5, alignItems: "flex-end" }}>
                      <Text style={styles.metaLabel}>TOTAL</Text>
                      <Text style={styles.rowTotal}>
                        ₦{(item.quantity * item.rate).toLocaleString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        setLineItems(lineItems.filter((i) => i.id !== item.id))
                      }
                      style={styles.trash}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() =>
                  setLineItems([
                    ...lineItems,
                    {
                      id: Date.now().toString(),
                      description: "",
                      quantity: 1,
                      rate: 0,
                    },
                  ])
                }
              >
                <Plus size={16} color="#426900" />
                <Text style={styles.addBtnText}>ADD NEW ITEM</Text>
              </TouchableOpacity>

              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>DUE DATE (STEP 03)</Text>
              <TextInput
                style={styles.dueDateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={dueDate}
                onChangeText={setDueDate}
                keyboardType="numbers-and-punctuation"
              />

              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>TAX % (OPTIONAL)</Text>
              <TextInput
                style={styles.dueDateInput}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                value={String(tax)}
                onChangeText={v => setTax(Number(v) || 0)}
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <View>
                  <Text style={styles.totalLabel}>GRAND TOTAL</Text>
                  <Text style={styles.taxNote}>Incl. {tax}% Tax</Text>
                </View>
                <Text style={styles.amount}>₦{total.toLocaleString()}</Text>
              </View>

              <TouchableOpacity
                onPress={handleSave}
                disabled={!selectedProject}
                style={[styles.mainBtn, !selectedProject && { opacity: 0.5 }]}
              >
                <Sparkles size={18} color="#FFF" />
                <Text style={styles.mainBtnText}>GENERATE INVOICE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26,28,25,0.8)",
    justifyContent: "flex-end",
  },
  keyboardView: { width: "100%", height: "94%" },
  card: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    borderRadius: 2,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#000613" },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 1.5,
  },
  closeCircle: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(196,198,207,0.4)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 12,
  },
  projectScroller: { paddingBottom: 10 },
  projectPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
    marginRight: 10,
    gap: 8,
  },
  activePill: { backgroundColor: "#000613", borderColor: "#000613" },
  pillText: { fontSize: 12, fontWeight: "800", color: "#000613" },
  activePillText: { color: "#FFF" },
  noProjects: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
    paddingVertical: 10,
  },
  clientBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 10,
  },
  bannerText: { fontSize: 10, color: "#426900", fontWeight: "700" },
  itemCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
  },
  itemInput: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000613",
    marginBottom: 12,
  },
  itemMetaRow: { flexDirection: "row", alignItems: "center" },
  metaLabel: {
    fontSize: 8,
    fontWeight: "900",
    color: "#9CA3AF",
    marginBottom: 4,
  },
  smallInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 8,
    fontSize: 12,
    fontWeight: "900",
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
    color: "#000613",
  },
  rowTotal: { fontSize: 14, fontWeight: "900", color: "#000613" },
  trash: { marginLeft: 15, padding: 5 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10 },
  addBtnText: { fontSize: 10, fontWeight: "900", color: "#426900" },
  dueDateInput: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: "700",
    color: "#000613",
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
    marginBottom: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(196,198,207,0.4)",
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: { fontSize: 10, fontWeight: "900", color: "#9CA3AF" },
  taxNote: { fontSize: 11, fontWeight: "700", color: "#000613" },
  amount: { fontSize: 32, fontWeight: "900", color: "#000613" },
  mainBtn: {
    backgroundColor: "#000613",
    height: 60,
    borderRadius: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  mainBtnText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
