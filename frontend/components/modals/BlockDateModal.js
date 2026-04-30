import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";

export default function BlockDateModal({ visible, date, onClose, onSave }) {
  const [reason, setReason] = useState("");

  return (
    <Modal visible={visible} transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>BLOCK {date}</Text>
          <TextInput
            style={styles.input}
            placeholder="Reason (e.g. Public Holiday, Deep Work)"
            onChangeText={setReason}
          />
          <TouchableOpacity
            style={styles.blockBtn}
            onPress={() => onSave(reason)}
          >
            <Text style={styles.blockText}>Confirm Block</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
export const modalStyles = {
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26,28,25,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "90%",
    backgroundColor: "#f8f9fa",
    borderRadius: 32,
    padding: 24,
    elevation: 10,
  },
  title: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#6B7280",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(196,198,207,0.4)",
    color: "#000613",
  },
  primaryBtn: {
    backgroundColor: "#426900",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
};
