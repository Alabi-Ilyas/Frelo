import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthToken } from "../api/axios";

export const loadToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    setAuthToken(token);
    return token;
  }
  return null;
};
