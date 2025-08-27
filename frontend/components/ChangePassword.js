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
export default function ChangePassword({ navigation }) {
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
      <Text style={styles.heading}>Change Password</Text>
      
      <View>
        <Text style={styles.Header}> Password</Text>
        <View style={styles.input}>
          <TextInput placeholder="Enter Password" />
        </View>
      </View>
      
      <View>
        <Text style={styles.Header}> Confirm Password</Text>
        <View style={styles.input}>
          <TextInput placeholder="Confirm Password" />
        </View>
      </View>
     
      <View style={styles.button}>
        <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
          <Text style={styles.buttonText}>Confirm</Text>
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
    width: 200,
    height: 200,
  },
  heading: {
    fontSize: 28,
    fontFamily: "Outfit-SemiBold",
    textAlign: "center",
    fontWeight: "300",
  },
  body: {
    fontFamily: "Outfit-Regular",
    fontSize: 15,
    alignSelf: "center",
    alignItems: "center",
    marginTop: 10,
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
  checkbox: {
    height: 22,
    width: 22,
    borderWidth: 2,
    borderColor: "#FF6600", // orange
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  text: {
    fontFamily: "Outfit-Regular",
    fontSize: 14,
  },
  text2: {
    color: "#FF6600",
    fontFamily: "Outfit-SemiBold",
  },
  button: {
    backgroundColor: "#0A2166",
    padding: 15,
    borderRadius: 8,
    marginTop: 40,
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
