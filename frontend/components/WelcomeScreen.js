import React, { useEffect, useRef } from "react";
import {
  StyleSheet, Text, View, Image,
  TouchableOpacity, Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { ArrowRight } from "lucide-react-native";
import { C } from "../utils/theme";

export default function Welcome({ navigation }) {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={s.root}>
      <StatusBar style="dark" />

      {/* Decorative lime accent blob */}
      <View style={s.blob} />

      <Animated.View style={[s.content, { opacity: fade, transform: [{ translateY: slide }] }]}>

        {/* Logo mark */}
        <View style={s.logoRow}>
          <View style={s.logoMark}>
            <Image
              source={require("./../assets/images/logo.png")}
              style={s.logoImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Editorial text */}
        <View style={s.textBlock}>
          <Text style={s.tagline}>VERDANT EDITION  •  v1.0.4</Text>
          <Text style={s.heading}>Infrastructure{"\n"}for Modern Work</Text>
          <Text style={s.body}>
            A unified ecosystem for freelancers and clients to build, manage, and scale projects.
          </Text>
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate("SignUp")} activeOpacity={0.85}>
            <Text style={s.primaryBtnText}>GET STARTED</Text>
            <ArrowRight size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={s.ghostBtn} onPress={() => navigation.navigate("SignIn")} activeOpacity={0.7}>
            <Text style={s.ghostBtnText}>
              ALREADY REGISTERED?{"  "}
              <Text style={s.ghostBtnAccent}>LOG IN</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Footer */}
      <Text style={s.footer}>© {new Date().getFullYear()} FreloPro Verdant Systems</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.background, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 36 },
  blob:    { position: "absolute", top: -80, left: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: C.secondaryContainer, opacity: 0.18 },
  content: { flex: 1, justifyContent: "center" },

  logoRow:  { marginBottom: 44 },
  logoMark: { width: 56, height: 56, borderRadius: 16, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  logoImg:  { width: 36, height: 36, tintColor: C.secondaryContainer },

  textBlock: { marginBottom: 56 },
  tagline:   { fontSize: 10, fontWeight: "900", letterSpacing: 2.5, color: C.onSurfaceVar, marginBottom: 14 },
  heading:   { fontSize: 44, fontWeight: "900", color: C.primary, lineHeight: 50, letterSpacing: -1.5, marginBottom: 20 },
  body:      { fontSize: 16, color: C.onSurfaceVar, lineHeight: 26, maxWidth: "88%" },

  actions:       { width: "100%" },
  primaryBtn:    { backgroundColor: C.primary, height: 64, borderRadius: 32, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  primaryBtnText:{ color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 2.5 },

  ghostBtn:      { marginTop: 28, alignItems: "center" },
  ghostBtnText:  { fontSize: 11, fontWeight: "900", color: C.onSurfaceVar, letterSpacing: 1 },
  ghostBtnAccent:{ color: C.primary },

  footer: { textAlign: "center", fontSize: 9, fontWeight: "700", color: C.outline, letterSpacing: 1 },
});
