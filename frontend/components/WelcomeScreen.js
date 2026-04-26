import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useFonts } from "expo-font";
import { ArrowRight } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function Welcome({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-SemiBold": require("../assets/fonts/Outfit-SemiBold.ttf"),
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (fontsLoaded) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Decorative Branding */}
      <View style={styles.topAccent} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Simplified Logo Area */}
        <View style={styles.logoContainer}>
          <Image
            source={require("./../assets/images/logo.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Text Area - Editorial Style */}
        <View style={styles.textContainer}>
          <Text style={styles.tagline}>VERDANT EDITION • v1.0.4</Text>
          <Text style={styles.heading}>Infrastructure for Modern Work</Text>
          <Text style={styles.body}>
            A unified ecosystem for freelancers and clients to build, manage,
            and scale projects.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.getStartedText}>GET STARTED</Text>
            <ArrowRight size={18} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={styles.signInText}>
              ALREADY REGISTERED? <Text style={styles.signInLink}>LOG IN</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFDF8", // Recessed Sage/White
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  topAccent: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#D7E8CD", // Very soft sage green
    opacity: 0.3,
    zIndex: -1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start", // Left-aligned for a modern architect feel
  },
  logoContainer: {
    marginBottom: 40,
  },
  image: {
    width: 80, // Smaller, more professional logo size
    height: 80,
  },
  textContainer: {
    marginBottom: 60,
  },
  tagline: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#6B7280",
    marginBottom: 12,
  },
  heading: {
    fontSize: 42,
    fontWeight: "900",
    color: "#1A1C19",
    lineHeight: 48,
    letterSpacing: -1.5,
  },
  body: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 20,
    lineHeight: 24,
    maxWidth: "90%",
  },
  buttonContainer: {
    width: "100%",
  },
  getStartedBtn: {
    backgroundColor: "#1A1C19",
    width: "100%",
    height: 64,
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  getStartedText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  signInBtn: {
    marginTop: 30,
    alignItems: "center",
    width: "100%",
  },
  signInText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6B7280",
    letterSpacing: 1,
  },
  signInLink: {
    color: "#1A1C19",
  },
});
