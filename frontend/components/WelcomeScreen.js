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

const { width } = Dimensions.get("window");

export default function Welcome({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-SemiBold": require("../assets/fonts/Outfit-SemiBold.ttf"),
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (fontsLoaded) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Decorative Background Element */}
      <View style={styles.circleDecorator} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo Area */}
        <View style={styles.logoContainer}>
          <Image
            source={require("./../assets/images/logo.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Text Area */}
        <View style={styles.textContainer}>
          <Text style={styles.heading}>Master Your Craft</Text>
          <Text style={styles.body}>
            Your work. Your progress.{"\n"}All in one professional place.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={styles.signInText}>
              Already have an account?{" "}
              <Text style={styles.signInLink}>Sign In</Text>
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
    backgroundColor: "#F8F9FF", 
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  circleDecorator: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#E8EBF5", 
    zIndex: -1,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: "#0A2166",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  heading: {
    fontSize: 34,
    fontFamily: "Outfit-SemiBold",
    color: "#0A2166",
    textAlign: "center",
  },
  body: {
    fontFamily: "Outfit-Regular",
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 15,
    lineHeight: 26,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  getStartedBtn: {
    backgroundColor: "#0A2166",
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#0A2166",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  getStartedText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
  },
  signInBtn: {
    marginTop: 25,
    padding: 10,
  },
  signInText: {
    fontFamily: "Outfit-Regular",
    fontSize: 16,
    color: "#666",
  },
  signInLink: {
    color: "#0A2166",
    fontFamily: "Outfit-SemiBold",
  },
});
