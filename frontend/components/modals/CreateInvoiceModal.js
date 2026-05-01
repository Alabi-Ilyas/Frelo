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
  Alert,
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
  const [tax, setTax] = useState("0");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState([
    { id: Date.now().toString(), description: "", quantity: "1", rate: "0" },
  ]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedProject(null);
      setLineItems([
        {
          id: Date.now().toString(),
          description: "",
          quantity: "1",
          rate: "0",
        },
      ]);
      setTax("0");
      setDueDate("");
      setNotes("");
    }
  }, [visible]);

  const subtotal = lineItems.reduce(
    (acc, i) => acc + Number(i.quantity || 0) * Number(i.rate || 0),
    0,
  );
  const total = subtotal + subtotal * (Number(tax || 0) / 100);

  const updateLineItem = (id, field, value) =>
    setLineItems(
      lineItems.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );

  const handleSave = () => {
    // 1. First check if button is firing
    console.log("Button clicked. Starting validation...");

    if (!selectedProject) {
      return Alert.alert("Error", "Please select a project.");
    }

    if (!dueDate || dueDate.length < 8) {
      return Alert.alert("Error", "Please enter a valid date (YYYY-MM-DD).");
    }

    try {
      // 2. Safer Date Padding
      const paddedDate = dueDate
        .split("-")
        .map((part) => part.padStart(2, "0"))
        .join("-");

      // 3. Calculation
      const subtotalAmount = lineItems.reduce(
        (acc, i) => acc + Number(i.quantity || 0) * Number(i.rate || 0),
        0,
      );
      const finalAmount =
        subtotalAmount + subtotalAmount * (Number(tax || 0) / 100);

      const payload = {
        clientId: selectedProject.clientId?._id || selectedProject.clientId,
        projectId: selectedProject._id,
        items: lineItems.map((i) => ({
          desc: i.description || "Service",
          qty: Number(i.quantity) || 1,
          rate: Number(i.rate) || 0,
        })),
        tax: Number(tax) || 0,
        dueDate: paddedDate, // Explicitly sending this to match backend summarize logic
        notes: notes.trim(),
      };

      console.log("PAYLOAD READY:", JSON.stringify(payload, null, 2));

      // 4. Fire the save
      onSave(payload);
    } catch (error) {
      console.error("CRASH IN HANDLE SAVE:", error);
      Alert.alert(
        "Logic Error",
        "Something went wrong while preparing the invoice.",
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          // FIX: Changed behavior to avoid the "sinking" effect
          behavior={Platform.OS === "ios" ? "padding" : undefined}
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

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.scrollArea} // Added explicit style
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <Text style={styles.sectionTitle}>SELECT PROJECT</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                style={styles.projectScroller}
              >
                {projects.map((p) => (
                  <TouchableOpacity
                    key={p._id}
                    onPress={() => setSelectedProject(p)}
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
                        selectedProject?._id === p._id && styles.activePillText,
                      ]}
                    >
                      {p.name?.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedProject && (
                <View style={styles.clientBanner}>
                  <User size={12} color="#426900" />
                  <Text style={styles.bannerText}>
                    LINKED:{" "}
                    <Text style={{ fontWeight: "900" }}>
                      {selectedProject.clientId?.name || "PRIVATE"}
                    </Text>
                  </Text>
                </View>
              )}

              <Text style={styles.sectionTitle}>LINE ITEMS</Text>
              {lineItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <TextInput
                    style={styles.itemInput}
                    placeholder="Description"
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
                        value={item.quantity}
                        onChangeText={(v) =>
                          updateLineItem(item.id, "quantity", v)
                        }
                      />
                    </View>
                    <View style={{ flex: 1.5, marginHorizontal: 10 }}>
                      <Text style={styles.metaLabel}>RATE</Text>
                      <TextInput
                        style={styles.smallInput}
                        keyboardType="numeric"
                        value={item.rate}
                        onChangeText={(v) => updateLineItem(item.id, "rate", v)}
                      />
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
                      quantity: "1",
                      rate: "0",
                    },
                  ])
                }
              >
                <Plus size={16} color="#426900" />
                <Text style={styles.addBtnText}>ADD ITEM</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>DUE DATE</Text>
              <TextInput
                style={styles.dueDateInput}
                placeholder="YYYY-MM-DD"
                value={dueDate}
                onChangeText={setDueDate}
              />

              <Text style={styles.sectionTitle}>TAX %</Text>
              <TextInput
                style={styles.dueDateInput}
                placeholder="0"
                keyboardType="numeric"
                value={tax}
                onChangeText={setTax}
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
              <TouchableOpacity onPress={handleSave} style={styles.mainBtn}>
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
    backgroundColor: "rgba(0,0,0,0.6)", // Darker overlay for focus
    justifyContent: "flex-end",
  },
  keyboardView: {
    width: "100%",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    height: "92%", // Fixed height prevents the "sinking" feel
  },
  scrollArea: {
    flex: 1, // Allow ScrollView to take available space
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    borderRadius: 2,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#000613" },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9CA3AF",
    letterSpacing: 1,
  },
  closeCircle: {
    width: 36,
    height: 36,
    backgroundColor: "#E5E7EB",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9CA3AF",
    marginTop: 20,
    marginBottom: 10,
  },
  projectScroller: { flexDirection: "row" },
  projectPill: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activePill: { backgroundColor: "#000613", borderColor: "#000613" },
  pillText: { fontSize: 12, fontWeight: "800", color: "#000613" },
  activePillText: { color: "#FFF" },
  clientBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  bannerText: { fontSize: 11, color: "#426900" },
  itemCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  itemInput: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  itemMetaRow: { flexDirection: "row", alignItems: "center" },
  metaLabel: { fontSize: 8, fontWeight: "900", color: "#9CA3AF" },
  smallInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 8,
    fontSize: 12,
    fontWeight: "900",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  trash: { marginLeft: 10 },
  addBtn: { flexDirection: "row", alignItems: "center", padding: 10 },
  addBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#426900",
    marginLeft: 5,
  },
  dueDateInput: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 15,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  totalLabel: { fontSize: 10, fontWeight: "900", color: "#9CA3AF" },
  amount: { fontSize: 28, fontWeight: "900" },
  mainBtn: {
    backgroundColor: "#000613",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  mainBtnText: { color: "#FFF", fontWeight: "900" },
});
