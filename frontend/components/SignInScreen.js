import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
export default function SignIn({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-SemiBold": require("../assets/fonts/Outfit-SemiBold.ttf"),
  });

  const [checked, setChecked] = useState(false);
  if (!fontsLoaded) {
    return null; // Or a loading screen
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.logo}>
        <Image
          source={require("./../assets/images/logo.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.heading}>Sign In</Text>
      <View>
        <Text style={styles.Header}> Email</Text>
        <View style={styles.input}>
          <TextInput placeholder="Enter Email" />
        </View>
      </View>
      <View>
        <Text style={styles.Header}> Password</Text>
        <View style={styles.input}>
          <TextInput placeholder="Enter Password" />
        </View>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.text2}> Forgot Password?</Text>
      </TouchableOpacity>
      <View style={styles.button}>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        <Text style={styles.text3}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.text4}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logo: {
    alignItems: "center",
    alignSelf: "center",
  },
  image: {
    width: 230,
    height: 230,
  },
  heading: {
    fontSize: 30,
    fontFamily: "Outfit-SemiBold",
    textAlign: "left",
    fontWeight: "300",
  },
  Header: {
    fontFamily: "Outfit-Regular",
    fontSize: 15,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    height: 48,
    borderRadius: 8,
    borderColor: "black",
    flexDirection: "row",
    width: 348,
    paddingLeft: 3,
    marginTop: 5,
    alignItems: "center",
  },
  text2: {
    color: "#FF6600",
    fontFamily: "Outfit-SemiBold",
    textAlign: "Right",
    marginTop: 10,
    fontSize: 14,
    alignSelf: "flex-end",
    marginRight: 10,
  },
  button: {
    backgroundColor: "#0A2166",
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    fontWeight: "600",
    textAlign: "center",
  },
  text3: {
    fontFamily: "Outfit-Regular",
    fontSize: 14,
  },
  text4: {
    fontFamily: "Outfit-SemiBold",
    fontSize: 14,
    color: "#0A2166",
    marginLeft: 5,
  },
});
