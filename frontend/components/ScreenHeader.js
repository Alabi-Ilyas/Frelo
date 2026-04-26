import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Menu, Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

export default function ScreenHeader({ title, tagline, onPressAdd }) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.tagline}>{tagline}</Text>
        <Text style={styles.heading}>{title}</Text>
      </View>
      
      <View style={styles.rightActions}>
        {/* Only show the Add button if an onPressAdd function is passed */}
        {onPressAdd && (
          <TouchableOpacity style={styles.addBtn} onPress={onPressAdd}>
            <Plus size={24} color="#FFF" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.menuBtn} 
          onPress={() => navigation.openDrawer()}
        >
          <Menu size={24} color="#1A1C19" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: "#FBFDF8",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tagline: { fontSize: 10, fontWeight: "900", color: "#6B7280", letterSpacing: 2 },
  heading: { fontSize: 32, fontWeight: "900", color: "#1A1C19", letterSpacing: -1 },
  menuBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4EF",
    borderRadius: 12,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1A1C19",
    justifyContent: "center",
    alignItems: "center",
  },
});