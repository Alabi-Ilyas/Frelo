import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useFonts } from "expo-font";
export default function Welcome({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-SemiBold": require("../assets/fonts/Outfit-SemiBold.ttf"),
  });

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Image
          source={require("./../assets/images/logo.png")}
          style={styles.image} // This now applies width & height to the image
          resizeMode="contain" // Put resizeMode here
        />
      </View>
      <Text style={styles.heading}>Welcome to Frelo</Text>
      <Text style={styles.body}>
        {" "}
        Your work. Your progress. All in one place.
      </Text>
      <View style={styles.button}>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  logo: {
    alignItems: "center",
    alignSelf: "center",
  },
  image: {
    width: 350,
    height: 350,
  },
  heading: {
    fontSize: 30,
    fontFamily: "Outfit-SemiBold",
    textAlign: "center",
    marginVertical: 20,
    fontWeight: "600",
    paddingTop: 77,
  },
  body: {
    fontFamily: "Outfit-Regular",
    fontSize: 18,
    alignSelf: "center",
    alignItems: "center",
    marginTop: 40,
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
});
