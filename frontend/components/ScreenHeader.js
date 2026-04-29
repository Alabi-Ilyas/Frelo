import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Menu, Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { C } from "../utils/theme";

export default function ScreenHeader({ title, tagline, onPressAdd, rightElement }) {
  const navigation = useNavigation();

  return (
    <View style={s.root}>
      {/* Left: tagline + title */}
      <View style={s.left}>
        {tagline ? <Text style={s.tagline}>{tagline}</Text> : null}
        <Text style={s.title} numberOfLines={1}>{title}</Text>
      </View>

      {/* Right: optional extra element, add button, menu */}
      <View style={s.right}>
        {rightElement ?? null}

        {onPressAdd && (
          <TouchableOpacity style={s.addBtn} onPress={onPressAdd} activeOpacity={0.85}>
            <Plus size={20} color={C.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.menuBtn} onPress={() => navigation.openDrawer()} activeOpacity={0.7}>
          <Menu size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: C.background,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.outlineVar,
  },
  left:    { flex: 1, paddingRight: 12 },
  tagline: { fontSize: 10, fontWeight: "900", color: C.secondary, letterSpacing: 2.5, marginBottom: 4 },
  title:   { fontSize: 30, fontWeight: "900", color: C.primary, letterSpacing: -1 },

  right:   { flexDirection: "row", alignItems: "center", gap: 10 },
  addBtn:  { width: 42, height: 42, borderRadius: 12, backgroundColor: C.secondaryContainer, alignItems: "center", justifyContent: "center" },
  menuBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
});
